"use client";

import { useAuth } from "@/hooks/custom/use-auth";
import { useCreateConversation } from "@/hooks/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChatInput } from "@/components/chat-input";
import { DEFAULT_MODEL } from "@/constants/models";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

export default function DashboardPage() {
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
      await createConversationMutation.mutateAsync({
        conversation_id: chatId,
        title,
        model: DEFAULT_MODEL,
      });

      if (typeof window !== "undefined") {
        sessionStorage.setItem(`pending_ai_message:${chatId}`, message);
      }

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
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8">
      <ChatInput onSendMessage={handleSendMessage} disabled={isCreating} />
    </div>
  );
}
