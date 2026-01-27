"use client";

import { useAuth } from "@/hooks/use-auth";
import { useChatStore, Chat } from "@/hooks/use-chat-store";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Clock,
  Trash2,
  Plus,
  Search,
  Calendar,
} from "lucide-react";

export default function HistoryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const chats = useChatStore((state) => state.chats);
  const deleteChat = useChatStore((state) => state.deleteChat);
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

  // Group chats by date
  const groupedChats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const groups: { label: string; chats: Chat[] }[] = [
      { label: "Today", chats: [] },
      { label: "Yesterday", chats: [] },
      { label: "Last 7 days", chats: [] },
      { label: "Older", chats: [] },
    ];

    chats.forEach((chat) => {
      const chatDate = new Date(chat.createdAt);
      chatDate.setHours(0, 0, 0, 0);

      if (chatDate.getTime() === today.getTime()) {
        groups[0].chats.push(chat);
      } else if (chatDate.getTime() === yesterday.getTime()) {
        groups[1].chats.push(chat);
      } else if (chatDate.getTime() > lastWeek.getTime()) {
        groups[2].chats.push(chat);
      } else {
        groups[3].chats.push(chat);
      }
    });

    return groups.filter((group) => group.chats.length > 0);
  }, [chats]);

  const formatTime = (date: Date) => {
    const chatDate = new Date(date);
    return chatDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleDeleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteChat(id);
    toast.success("Conversation deleted");
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
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-border bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Query History</h1>
            <p className="text-sm text-muted-foreground">
              {chats.length} {chats.length === 1 ? "query" : "queries"} total
            </p>
          </div>
          <Button onClick={() => router.push("/queries/chat/new")} className="gap-2">
            <Plus className="size-4" />
            New Query
          </Button>
        </div>
      </motion.header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-6 py-6">
          <AnimatePresence mode="wait">
            {chats.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                  className="mb-6 flex size-20 items-center justify-center rounded-full bg-muted"
                >
                  <Search className="size-10 text-muted-foreground" />
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-2 text-xl font-semibold"
                >
                  No queries yet
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mb-6 max-w-sm text-muted-foreground"
                >
                  Start asking questions about your database and your query history will appear here.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button
                    size="lg"
                    onClick={() => router.push("/queries/chat/new")}
                    className="gap-2"
                  >
                    <Plus className="size-4" />
                    Start Your First Query
                  </Button>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                {groupedChats.map((group, groupIndex) => (
                  <motion.div
                    key={group.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: groupIndex * 0.1 }}
                  >
                    {/* Group Header */}
                    <div className="mb-3 flex items-center gap-2">
                      <Calendar className="size-4 text-muted-foreground" />
                      <h2 className="text-sm font-medium text-muted-foreground">
                        {group.label}
                      </h2>
                      <div className="h-px flex-1 bg-border" />
                    </div>

                    {/* Chat Items */}
                    <div className="space-y-2">
                      {group.chats.map((chat, index) => (
                        <motion.div
                          key={chat.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: groupIndex * 0.1 + index * 0.05 }}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => router.push(`/queries/chat/${chat.id}`)}
                          className="group cursor-pointer rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/20 hover:bg-accent/50 hover:shadow-md"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 overflow-hidden">
                              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <MessageSquare className="size-5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="truncate font-medium text-foreground group-hover:text-primary">
                                  {chat.title}
                                </h3>
                                <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <MessageSquare className="size-3" />
                                    {chat.messages.length} {chat.messages.length === 1 ? "message" : "messages"}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="size-3" />
                                    {formatTime(chat.createdAt)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={(e) => handleDeleteChat(chat.id, e)}
                              className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
