"use client";

import { useAuth } from "@/hooks/custom/use-auth";
import { useCreateConversation } from "@/hooks/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChatInput } from "@/components/chat-input";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

export default function NewChatPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const createConversationMutation = useCreateConversation();
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleSendMessage = async (message: string) => {
    if (isCreating) return;

    setIsCreating(true);
    const chatId = uuidv4();
    const title = message.length > 50 ? message.substring(0, 50) + "..." : message;

    try {
      // Create conversation in backend
      await createConversationMutation.mutateAsync({
        conversation_id: chatId,
        title,
        model: "default",
      });

      if (typeof window !== "undefined") {
        sessionStorage.setItem(`pending_ai_message:${chatId}`, message);
      }

      // Navigate to the chat
      router.push(`/queries/chat/${chatId}`);
    } catch (error) {
      console.error("Failed to create conversation:", error);
      toast.error("Failed to create conversation. Please try again.");
      setIsCreating(false);
    }
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
      <ChatInput onSendMessage={handleSendMessage} disabled={isCreating} />
    </motion.div>
  );
}
