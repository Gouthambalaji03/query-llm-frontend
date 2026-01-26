"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Menu,
  Plus,
  Search,
  MessageSquare,
  Settings,
  ChevronDown,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<"chat" | "code">("chat");
  const [historyExpanded, setHistoryExpanded] = useState(true);

  // Mock chat history
  const chatHistory = [
    { id: 1, title: "Previous conversation 1" },
    { id: 2, title: "Previous conversation 2" },
    { id: 3, title: "Previous conversation 3" },
  ];

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

      {/* Chat/Code Toggle */}
      <div className="flex gap-1 p-3">
        <Button
          variant={activeTab === "chat" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("chat")}
          className={cn(
            "flex-1",
            activeTab === "chat" && "bg-sidebar-accent text-sidebar-accent-foreground"
          )}
        >
          Chat
        </Button>
        <Button
          variant={activeTab === "code" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("code")}
          className={cn(
            "flex-1",
            activeTab === "code" && "bg-sidebar-accent text-sidebar-accent-foreground"
          )}
        >
          Code
        </Button>
      </div>

      {/* New Chat & Search */}
      <div className="flex flex-col gap-2 px-3">
        <Button
          variant="ghost"
          size="sm"
          className="justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <Plus className="size-4" />
          New chat
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

      {/* Chat History */}
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
                className="truncate rounded-md px-2 py-1.5 text-left text-sm text-sidebar-foreground hover:bg-sidebar-accent"
              >
                {chat.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-sidebar-border p-3">
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <Settings className="size-5" />
        </Button>
        <div className="flex size-8 items-center justify-center rounded-full bg-sidebar-accent text-sm font-medium text-sidebar-accent-foreground">
          B
        </div>
      </div>
    </aside>
  );
}
