"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  Menu,
  Plus,
  Search,
  MessageSquare,
  Settings,
  ChevronDown,
  PanelLeftClose,
  PanelLeft,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [historyExpanded, setHistoryExpanded] = useState(true);

  // Mock chat history - replace with actual data
  const chatHistory = [
    { id: "1", title: "Database query optimization" },
    { id: "2", title: "User analytics report" },
    { id: "3", title: "Sales data analysis" },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const getUserInitial = () => {
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  if (collapsed) {
    return (
      <aside className="flex h-full w-12 flex-col border-r border-sidebar-border bg-sidebar">
        <div className="flex h-14 items-center justify-center border-b border-sidebar-border">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onToggle}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <PanelLeft className="size-5" />
          </Button>
        </div>
        <div className="flex flex-1 flex-col items-center gap-2 py-4">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => router.push("/queries/chat/new")}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <Plus className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <Search className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => router.push("/queries/history")}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <MessageSquare className="size-5" />
          </Button>
        </div>
        <div className="flex flex-col items-center gap-2 border-t border-sidebar-border py-4">
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <Settings className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleSignOut}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <LogOut className="size-5" />
          </Button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <Menu className="size-5" />
          </Button>
          <span className="text-lg font-semibold text-sidebar-foreground">
            ✳️
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggle}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <PanelLeftClose className="size-5" />
        </Button>
      </div>

      {/* New Query & Search */}
      <div className="flex flex-col gap-2 p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/queries/chat/new")}
          className={cn(
            "justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent",
            pathname === "/queries/chat/new" && "bg-sidebar-accent"
          )}
        >
          <Plus className="size-4" />
          New Query
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <Search className="size-4" />
          Search
        </Button>
      </div>

      {/* Query History */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <button
          onClick={() => setHistoryExpanded(!historyExpanded)}
          className="mb-2 flex w-full items-center gap-2 text-sm text-muted-foreground hover:text-sidebar-foreground"
        >
          <MessageSquare className="size-4" />
          <span>History</span>
          <ChevronDown
            className={cn(
              "ml-auto size-4 transition-transform",
              !historyExpanded && "-rotate-90"
            )}
          />
        </button>
        {historyExpanded && (
          <div className="flex flex-col gap-1">
            {chatHistory.map((chat) => (
              <button
                key={chat.id}
                onClick={() => router.push(`/queries/chat/${chat.id}`)}
                className={cn(
                  "truncate rounded-md px-2 py-1.5 text-left text-sm text-sidebar-foreground hover:bg-sidebar-accent",
                  pathname === `/queries/chat/${chat.id}` && "bg-sidebar-accent"
                )}
              >
                {chat.title}
              </button>
            ))}
            <button
              onClick={() => router.push("/queries/history")}
              className="mt-2 text-left text-xs text-muted-foreground hover:text-sidebar-foreground"
            >
              View all history
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <Settings className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleSignOut}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <LogOut className="size-5" />
          </Button>
        </div>
        <div className="flex size-8 items-center justify-center rounded-full bg-sidebar-accent text-sm font-medium text-sidebar-accent-foreground">
          {getUserInitial()}
        </div>
      </div>
    </aside>
  );
}
