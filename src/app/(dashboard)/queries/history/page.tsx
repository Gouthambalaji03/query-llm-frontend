"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Clock, Trash2 } from "lucide-react";

interface ChatHistory {
  id: string;
  title: string;
  lastMessage: string;
  createdAt: Date;
}

export default function HistoryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Mock data - replace with actual API call
  const [chats, setChats] = useState<ChatHistory[]>([
    {
      id: "1",
      title: "Database query optimization",
      lastMessage: "How can I optimize this SQL query?",
      createdAt: new Date(Date.now() - 1000 * 60 * 60),
    },
    {
      id: "2",
      title: "User analytics report",
      lastMessage: "Show me the user growth for last month",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
    {
      id: "3",
      title: "Sales data analysis",
      lastMessage: "What were the top selling products?",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    },
  ]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  };

  const handleDeleteChat = (id: string) => {
    setChats((prev) => prev.filter((chat) => chat.id !== id));
    // TODO: Call API to delete chat
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
    <div className="flex flex-1 flex-col p-6">
      <div className="mx-auto w-full max-w-3xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Query History</h1>
          <Button onClick={() => router.push("/queries/chat/new")}>
            New Query
          </Button>
        </div>

        {/* Chat List */}
        {chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare className="mb-4 size-12 text-muted-foreground" />
            <h2 className="mb-2 text-lg font-medium">No queries yet</h2>
            <p className="mb-4 text-muted-foreground">
              Start a new query to see your history here
            </p>
            <Button onClick={() => router.push("/queries/chat/new")}>
              Start New Query
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {chats.map((chat) => (
              <Card
                key={chat.id}
                className="cursor-pointer transition-colors hover:bg-accent"
                onClick={() => router.push(`/queries/chat/${chat.id}`)}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="mt-0.5 size-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">{chat.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {chat.lastMessage}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="size-3" />
                      {formatDate(chat.createdAt)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteChat(chat.id);
                      }}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
