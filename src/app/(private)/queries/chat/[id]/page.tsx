"use client";

import { useAuth } from "@/hooks/use-auth";
import { useChatStore } from "@/hooks/use-chat-store";
import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";
import { ChatInput } from "@/components/chat-input";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function ChatPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const chatId = params.id as string;

  const chat = useChatStore((state) => state.getChat(chatId));
  const addMessage = useChatStore((state) => state.addMessage);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Redirect if chat doesn't exist
    if (!loading && user && !chat) {
      router.push("/queries/chat/new");
    }
  }, [chat, loading, user, router]);

  const handleSendMessage = (message: string) => {
    addMessage(chatId, "user", message);
    // TODO: Send to API and get assistant response
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user || !chat) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => router.push("/queries/chat/new")}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <h1 className="truncate text-lg font-medium">{chat.title}</h1>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-3xl space-y-4">
          {chat.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border p-4">
        <div className="mx-auto max-w-3xl">
          <ChatInput onSendMessage={handleSendMessage} showGreeting={false} />
        </div>
      </div>
    </div>
  );
}
