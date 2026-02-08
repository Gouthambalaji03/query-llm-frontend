"use client";

import { useAuth } from "@/hooks/custom/use-auth";
import { Message } from "@/hooks/custom/use-chat-store";
import { useGetConversation } from "@/hooks/api";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatInput } from "@/components/chat-input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { streamAiSse } from "@/lib/ai-stream";
import type { TAiStreamEvent, TToolInvocationPart } from "@/types";
import { queryClient } from "@/lib/tanstack-query";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { getModelLabel } from "@/constants/models";
import {
  CodeBlock,
  DataTable,
  MessageActions,
  TypingIndicator,
  ScrollToBottom,
} from "@/components/chat";

// Parse table from markdown lines
function parseTable(
  lines: string[],
  startIndex: number
): { table: { headers: string[]; rows: string[][] } | null; endIndex: number } {
  if (!lines[startIndex]?.startsWith("|"))
    return { table: null, endIndex: startIndex };

  const tableLines: string[] = [];
  let i = startIndex;

  while (i < lines.length && lines[i].startsWith("|")) {
    tableLines.push(lines[i]);
    i++;
  }

  if (tableLines.length < 2) return { table: null, endIndex: startIndex };

  const headers = tableLines[0]
    .split("|")
    .filter((c) => c.trim())
    .map((c) => c.trim());
  const rows: string[][] = [];

  for (let j = 1; j < tableLines.length; j++) {
    const cells = tableLines[j]
      .split("|")
      .filter((c) => c.trim())
      .map((c) => c.trim());
    if (!cells.every((c) => c.match(/^[-:]+$/))) {
      rows.push(cells);
    }
  }

  return { table: { headers, rows }, endIndex: i - 1 };
}

// Render inline formatting (code, bold)
function renderInlineFormatting(text: string): React.ReactNode {
  const parts = text.split(/(`[^`]+`)/g);

  return parts.map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="rounded-md bg-muted px-1.5 py-0.5 text-[13px] font-mono text-primary"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
    return boldParts.map((bp, j) => {
      if (bp.startsWith("**") && bp.endsWith("**")) {
        return (
          <strong key={`${i}-${j}`} className="font-semibold text-foreground">
            {bp.slice(2, -2)}
          </strong>
        );
      }
      return bp;
    });
  });
}

interface MessageContentProps {
  content: string;
}

function MessageContent({ content }: MessageContentProps) {
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-1">
      {parts.map((part, index) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          const match = part.match(/```(\w+)?\n?([\s\S]*?)```/);
          if (match) {
            const language = match[1] || "code";
            const code = match[2].trim();
            return <CodeBlock key={index} code={code} language={language} />;
          }
        }

        const lines = part.split("\n");
        const elements: React.ReactNode[] = [];
        let i = 0;

        while (i < lines.length) {
          const line = lines[i];

          // Check for table
          if (line.startsWith("|")) {
            const { table, endIndex } = parseTable(lines, i);
            if (table && table.rows.length > 0) {
              elements.push(
                <DataTable
                  key={`table-${i}`}
                  headers={table.headers}
                  rows={table.rows}
                />
              );
              i = endIndex + 1;
              continue;
            }
          }

          // Bold section headers
          if (line.match(/^\*\*.*:\*\*$/)) {
            elements.push(
              <p
                key={i}
                className="font-semibold text-foreground mt-5 mb-2 first:mt-0"
              >
                {line.replace(/\*\*/g, "")}
              </p>
            );
          }
          // Numbered lists
          else if (line.match(/^\d+\.\s/)) {
            const num = line.match(/^\d+/)?.[0];
            const text = line.replace(/^\d+\.\s/, "");
            elements.push(
              <div key={i} className="flex gap-3 my-2 pl-1">
                <span className="text-primary font-semibold shrink-0 w-5">
                  {num}.
                </span>
                <span className="text-foreground/80 leading-relaxed">
                  {renderInlineFormatting(text)}
                </span>
              </div>
            );
          }
          // Bullet points
          else if (line.match(/^[-•]\s/)) {
            const text = line.replace(/^[-•]\s/, "");
            elements.push(
              <div key={i} className="flex gap-3 my-2 pl-1">
                <span className="text-primary mt-1.5">
                  <span className="block size-1.5 rounded-full bg-current" />
                </span>
                <span className="text-foreground/80 leading-relaxed">
                  {renderInlineFormatting(text)}
                </span>
              </div>
            );
          }
          // Regular text
          else if (line.trim()) {
            elements.push(
              <p key={i} className="text-foreground/90 leading-7 my-1.5">
                {renderInlineFormatting(line)}
              </p>
            );
          }
          // Empty lines
          else {
            elements.push(<div key={i} className="h-3" />);
          }

          i++;
        }

        return <div key={index}>{elements}</div>;
      })}
    </div>
  );
}

interface ToolInvocationProps {
  part: {
    type: "tool-invocation";
    toolCallId: string;
    toolName: string;
    state: "call" | "result" | "partial-call";
    args?: unknown;
    result?: unknown;
  };
}

function ToolInvocation({ part }: ToolInvocationProps) {
  return (
    <div className="mt-3 rounded-lg border border-border bg-muted/40 p-3 text-xs">
      <div className="flex items-center justify-between">
        <span className="font-medium text-foreground">{part.toolName}</span>
        <span className="text-muted-foreground">{part.state}</span>
      </div>
      {part.args !== undefined && (
        <pre className="mt-2 whitespace-pre-wrap text-muted-foreground">
          {JSON.stringify(part.args, null, 2)}
        </pre>
      )}
      {/* Tool results are hidden from UI - only used for agent context */}
    </div>
  );
}

interface ChatMessageProps {
  message: Message;
  index: number;
  userEmail?: string;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
}

function ChatMessage({
  message,
  index,
  userEmail,
  isFirstInGroup,
  isLastInGroup,
}: ChatMessageProps) {
  const isUser = message.role === "user";

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getUserInitial = () => {
    if (userEmail) {
      return userEmail.charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.2), duration: 0.3 }}
      className={cn(
        "flex gap-4",
        isUser ? "flex-row-reverse" : "flex-row",
        !isFirstInGroup && "mt-1",
        isFirstInGroup && index > 0 && "mt-6"
      )}
    >
      {/* Avatar - only show for first message in group */}
      <div className="w-9 shrink-0">
        {isFirstInGroup && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: Math.min(index * 0.03 + 0.1, 0.3),
              type: "spring",
              stiffness: 200,
            }}
            className={cn(
              "flex size-9 items-center justify-center rounded-full shadow-sm",
              isUser
                ? "bg-foreground text-background"
                : "bg-primary/10 text-primary border border-primary/20"
            )}
          >
            {isUser ? (
              <span className="text-sm font-semibold">{getUserInitial()}</span>
            ) : (
              <Database className="size-4" />
            )}
          </motion.div>
        )}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          "flex flex-col min-w-0",
          isUser ? "items-end max-w-[75%]" : "items-start flex-1 max-w-[85%]"
        )}
      >
        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: Math.min(index * 0.03 + 0.05, 0.25) }}
          className={cn(
            "rounded-2xl shadow-sm",
            isUser
              ? "bg-foreground text-background px-4 py-2.5"
              : "bg-card border border-border/50 px-5 py-4",
            // Adjust corners based on position in group
            isUser && isFirstInGroup && "rounded-tr-md",
            isUser && !isFirstInGroup && !isLastInGroup && "rounded-r-md",
            isUser && isLastInGroup && !isFirstInGroup && "rounded-br-md",
            !isUser && isFirstInGroup && "rounded-tl-md",
            !isUser && !isFirstInGroup && !isLastInGroup && "rounded-l-md",
            !isUser && isLastInGroup && !isFirstInGroup && "rounded-bl-md"
          )}
        >
          {isUser ? (
            <p className="text-[15px] leading-relaxed">{message.content}</p>
          ) : (
            <>
              {message.content ? (
                <MessageContent content={message.content} />
              ) : message.parts?.some((part) => part.type === "tool-invocation") ? (
                <p className="text-[15px] leading-relaxed text-muted-foreground italic">
                  Using tool: {message.parts.find((part) => part.type === "tool-invocation")?.toolName}
                </p>
              ) : null}
            </>
          )}
        </motion.div>

        {!isUser && message.parts?.some((part) => part.type === "tool-invocation") && (
          <div className="w-full">
            {message.parts
              ?.filter((part) => part.type === "tool-invocation")
              .map((part) => (
                <ToolInvocation
                  key={part.toolCallId}
                  part={part as ToolInvocationProps["part"]}
                />
              ))}
          </div>
        )}

        {/* Message Actions - only for assistant messages on last in group */}
        {!isUser && isLastInGroup && (
          <MessageActions
            content={message.content}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          />
        )}

        {/* Timestamp - only show for last message in group */}
        {isLastInGroup && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: Math.min(index * 0.03 + 0.15, 0.35) }}
            className="text-[11px] text-muted-foreground/50 px-1 mt-1.5"
          >
            {formatTime(message.createdAt)}
          </motion.span>
        )}
      </div>
    </motion.div>
  );
}

export default function ChatPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const chatId = params.id as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isStreamingRef = useRef(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [pendingMessages, setPendingMessages] = useState<Message[]>([]);
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const isTyping = isStreaming;
  const [persistedMessages, setPersistedMessages] = useState<Message[]>([]);

  // Fetch conversation from backend
  const { data: conversationData, isLoading: isLoadingConversation } = useGetConversation(
    { conversationId: chatId },
    { enabled: !!chatId && !!user && !loading }
  );

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Sync backend data with local store
  useEffect(() => {
    if (!loading && user && !conversationData && !isLoadingConversation) {
      router.push("/queries/chat/new");
    }
  }, [conversationData, loading, user, router, isLoadingConversation]);

  // Sync backend messages with local state
  // Only runs when conversationData changes (after refetch)
  useEffect(() => {
    if (!conversationData) return;

    const backendMessages = conversationData.user_context_messages || [];
    const mapped = backendMessages.map((msg) => ({
      id: msg.id,
      role: msg.role as "user" | "assistant",
      content: msg.content,
      parts: msg.role === "assistant" ? msg.parts : undefined,
      createdAt: new Date(msg.created_at),
    }));

    // Only update if we have new data or starting fresh
    if (mapped.length > 0 || persistedMessages.length === 0) {
      setPersistedMessages(mapped);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationData]);

  // Clean up pending and streaming messages after they're persisted
  useEffect(() => {
    if (isStreaming) return;
    if (persistedMessages.length === 0) return;

    const backendIds = new Set(persistedMessages.map((msg) => msg.id));

    // Clear streaming message if it's now persisted
    if (streamingMessage && backendIds.has(streamingMessage.id)) {
      setStreamingMessage(null);
    }

    // Clear pending messages that are now persisted
    // Only update if something was actually filtered out to avoid infinite loop
    if (pendingMessages.length > 0) {
      const filtered = pendingMessages.filter((msg) => !backendIds.has(msg.id));
      if (filtered.length !== pendingMessages.length) {
        setPendingMessages(filtered);
      }
    }
  }, [isStreaming, persistedMessages, streamingMessage, pendingMessages]);

  const messages = useMemo(() => {
    const baseMessages = persistedMessages;
    const backendIds = new Set(baseMessages.map((msg) => msg.id));
    const pendingFiltered = pendingMessages.filter((msg) => !backendIds.has(msg.id));
    const streamingFiltered =
      streamingMessage && !backendIds.has(streamingMessage.id) ? [streamingMessage] : [];
    return [...baseMessages, ...pendingFiltered, ...streamingFiltered];
  }, [persistedMessages, pendingMessages, streamingMessage]);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  useEffect(() => {
    if (!isStreaming) return;
    if (showScrollButton) return;
    scrollToBottom();
  }, [isStreaming, showScrollButton, streamingMessage?.content]);

  useEffect(() => {
    if (loading || isLoadingConversation || !user || isStreaming) return;
    if (typeof window === "undefined") return;
    const pendingKey = `pending_ai_message:${chatId}`;
    const pending = sessionStorage.getItem(pendingKey);
    if (!pending) return;
    sessionStorage.removeItem(pendingKey);
    handleSendMessage(pending);
  }, [loading, isLoadingConversation, user, chatId, isStreaming]);

  // Handle scroll to show/hide scroll-to-bottom button
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [user, messages.length]);

  const handleSendMessage = async (message: string) => {
    // Use ref for immediate synchronous check to prevent race conditions
    if (!user || isStreaming || isStreamingRef.current) {
      return;
    }

    // Set ref immediately to block concurrent calls
    isStreamingRef.current = true;

    const aiUrl = process.env.NEXT_PUBLIC_AI_URL;
    if (!aiUrl) {
      toast.error("AI server URL is not configured.");
      isStreamingRef.current = false;
      return;
    }

    if (conversationData && persistedMessages.length === 0) {
      const backendMessages = conversationData.user_context_messages || [];
      const mapped = backendMessages.map((msg) => ({
        id: msg.id,
        role: msg.role as "user" | "assistant",
        content: msg.content,
        parts: msg.role === "assistant" ? msg.parts : undefined,
        createdAt: new Date(msg.created_at),
      }));
      if (mapped.length > 0) {
        setPersistedMessages(mapped);
      }
    }

    const createdAt = new Date();
    const pendingId = uuidv4();
    const assistantId = uuidv4();

    setPendingMessages((prev) => [
      ...prev,
      {
        id: pendingId,
        role: "user",
        content: message,
        createdAt,
      },
    ]);

    setStreamingMessage({
      id: assistantId,
      role: "assistant",
      content: "",
      parts: [],
      createdAt,
    });

    setIsStreaming(true);

    try {
      const token = await user.getIdToken();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      await streamAiSse({
        url: `${aiUrl}/api/ai/sse`,
        token,
        body: {
          conversation_id: chatId,
          message,
          model: conversationData?.conversation.ai_model || "default",
          user_message_id: pendingId,
          assistant_message_id: assistantId,
        },
        signal: controller.signal,
        onEvent: (event) => {
          const payload = event.data as TAiStreamEvent;
          switch (payload.type) {
            case "message-start":
              if (payload.role === "assistant") {
                setStreamingMessage((prev) =>
                  prev ? { ...prev, id: payload.messageId } : prev
                );
              }
              break;
            case "text":
              setStreamingMessage((prev) =>
                prev
                  ? { ...prev, content: `${prev.content}${payload.delta}` }
                  : prev
              );
              break;
            case "tool-invocation":
              setStreamingMessage((prev) => {
                if (!prev) return prev;
                const parts = prev.parts ? [...prev.parts] : [];
                parts.push({
                  type: "tool-invocation",
                  toolCallId: payload.toolCallId,
                  toolName: payload.toolName,
                  state: payload.state,
                  args: payload.args,
                });
                return { ...prev, parts };
              });
              break;
            case "tool-result":
              setStreamingMessage((prev) => {
                if (!prev) return prev;
                let found = false;
                const parts = (prev.parts ?? []).map((part) => {
                  if (
                    part.type === "tool-invocation" &&
                    part.toolCallId === payload.toolCallId
                  ) {
                    found = true;
                    const updated: TToolInvocationPart = {
                      ...part,
                      state: "result",
                      result: payload.result,
                    };
                    return updated;
                  }
                  return part;
                });
                if (!found) {
                  const fallback: TToolInvocationPart = {
                    type: "tool-invocation",
                    toolCallId: payload.toolCallId,
                    toolName: payload.toolName,
                    state: "result",
                    result: payload.result,
                  };
                  parts.push(fallback);
                }
                return { ...prev, parts };
              });
              break;
            case "chat-complete":
              isStreamingRef.current = false;
              setIsStreaming(false);
              // Delayed refetch to allow backend to save messages after stream completes
              setTimeout(() => {
                queryClient.invalidateQueries({ queryKey: ["useGetConversation"] });
                queryClient.invalidateQueries({ queryKey: ["useGetAllConversations"] });
              }, 500);
              break;
            case "error":
              toast.error(payload.message || "Streaming error");
              isStreamingRef.current = false;
              setIsStreaming(false);
              break;
            case "cancel":
              isStreamingRef.current = false;
              setIsStreaming(false);
              // Don't invalidate queries - let cleanup effect handle temporary messages
              break;
            default:
              break;
          }
        },
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        toast("Streaming cancelled.");
      } else {
        console.error("AI stream failed:", error);
        toast.error("AI stream failed.");
      }
      isStreamingRef.current = false;
      setIsStreaming(false);
    } finally {
      abortControllerRef.current = null;
    }
  };

  const handleCancelStream = () => {
    abortControllerRef.current?.abort();
  };

  const getUserInitial = () => {
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  // Group consecutive messages from same sender
  const getMessageGroupInfo = (messages: Message[], index: number) => {
    const current = messages[index];
    const prev = messages[index - 1];
    const next = messages[index + 1];

    const isFirstInGroup = !prev || prev.role !== current.role;
    const isLastInGroup = !next || next.role !== current.role;

    return { isFirstInGroup, isLastInGroup };
  };

  if (loading || isLoadingConversation) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </motion.div>
      </div>
    );
  }

  if (!user || !conversationData) {
    return null;
  }


  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between border-b border-border bg-background px-4 py-3"
      >
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => router.push("/queries/history")}
            className="shrink-0 hover:bg-muted"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold">{conversationData.conversation.title}</h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>
                {messages.length}{" "}
                {messages.length === 1 ? "message" : "messages"}
              </span>
              <span>•</span>
              <span>{getModelLabel(conversationData.conversation.ai_model)}</span>
            </div>
          </div>
        </div>
        <div
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-foreground text-background text-sm font-semibold shadow-sm"
          title={user?.email || "User"}
        >
          {getUserInitial()}
        </div>
      </motion.header>

      {/* Messages */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto relative">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <AnimatePresence mode="popLayout">
            {messages.map((msg, index) => {
              const { isFirstInGroup, isLastInGroup } = getMessageGroupInfo(
                messages,
                index
              );
              return (
                <div key={msg.id} className="group">
                  <ChatMessage
                    message={msg}
                    index={index}
                    userEmail={user?.email || ""}
                    isFirstInGroup={isFirstInGroup}
                    isLastInGroup={isLastInGroup}
                  />
                </div>
              );
            })}
          </AnimatePresence>

          {/* Typing Indicator */}
          <AnimatePresence>
            {isTyping && (
              <div className="mt-6">
                <TypingIndicator />
              </div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Scroll to Bottom Button */}
        <ScrollToBottom show={showScrollButton} onClick={scrollToBottom} />
      </div>

      {/* Input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-t border-border bg-background p-4"
      >
        <div className="mx-auto max-w-3xl">
          {isStreaming && (
            <div className="mb-3 flex justify-end">
              <Button variant="outline" size="sm" onClick={handleCancelStream}>
                Stop
              </Button>
            </div>
          )}
          <ChatInput onSendMessage={handleSendMessage} showGreeting={false} disabled={isStreaming} />
        </div>
      </motion.div>
    </div>
  );
}
