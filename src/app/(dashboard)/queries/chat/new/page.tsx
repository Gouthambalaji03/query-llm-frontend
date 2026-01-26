"use client";

import { useAuth } from "@/hooks/use-auth";
import { useChatStore } from "@/hooks/use-chat-store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ChatInput } from "@/components/chat-input";

export default function NewChatPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const createChat = useChatStore((state) => state.createChat);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleSendMessage = (message: string) => {
    // Create new chat with UUID and navigate to it
    const chatId = createChat(message);
    router.push(`/queries/chat/${chatId}`);
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8">
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
}
