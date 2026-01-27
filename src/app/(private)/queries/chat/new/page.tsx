"use client";

import { useAuth } from "@/hooks/use-auth";
import { useChatStore } from "@/hooks/use-chat-store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ChatInput } from "@/components/chat-input";

export default function NewChatPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const createChat = useChatStore((state) => state.createChat);
  const loadDummyData = useChatStore((state) => state.loadDummyData);

  // Load dummy data on mount
  useEffect(() => {
    loadDummyData();
  }, [loadDummyData]);

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

  if (!user) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-1 flex-col items-center justify-center p-8"
    >
      <ChatInput onSendMessage={handleSendMessage} />
    </motion.div>
  );
}
