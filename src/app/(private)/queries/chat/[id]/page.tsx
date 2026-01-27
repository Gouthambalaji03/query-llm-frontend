"use client";

import { useAuth } from "@/hooks/use-auth";
import { useChatStore, Message } from "@/hooks/use-chat-store";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatInput } from "@/components/chat-input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Database } from "lucide-react";
import { cn } from "@/lib/utils";
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
            <MessageContent content={message.content} />
          )}
        </motion.div>

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
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isTyping] = useState(false); // For future AI response simulation

  const chat = useChatStore((state) => state.getChat(chatId));
  const addMessage = useChatStore((state) => state.addMessage);
  const loadDummyData = useChatStore((state) => state.loadDummyData);

  useEffect(() => {
    loadDummyData();
  }, [loadDummyData]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && user && !chat) {
      router.push("/queries/chat/new");
    }
  }, [chat, loading, user, router]);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages, scrollToBottom]);

  // Handle scroll to show/hide scroll-to-bottom button
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } =
      scrollContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isNearBottom);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  const handleSendMessage = (message: string) => {
    addMessage(chatId, "user", message);
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

  if (loading) {
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

  if (!user || !chat) {
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
            <h1 className="truncate text-base font-semibold">{chat.title}</h1>
            <p className="text-xs text-muted-foreground">
              {chat.messages.length}{" "}
              {chat.messages.length === 1 ? "message" : "messages"}
            </p>
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
            {chat.messages.map((msg, index) => {
              const { isFirstInGroup, isLastInGroup } = getMessageGroupInfo(
                chat.messages,
                index
              );
              return (
                <div key={msg.id} className="group">
                  <ChatMessage
                    message={msg}
                    index={index}
                    userEmail={user?.email}
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
          <ChatInput onSendMessage={handleSendMessage} showGreeting={false} />
        </div>
      </motion.div>
    </div>
  );
}
