"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useChatStore } from "@/hooks/use-chat-store";
import {
  Plus,
  Search,
  Settings,
  ChevronDown,
  PanelLeftClose,
  PanelLeft,
  LogOut,
  Database,
  History,
  X,
} from "lucide-react";

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const chats = useChatStore((state) => state.chats);
  const [historyExpanded, setHistoryExpanded] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const recentChats = chats.slice(0, 5);

  // Filter chats based on search query
  const filteredChats = searchQuery.trim()
    ? chats.filter(
        (chat) =>
          chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          chat.messages.some((msg) =>
            msg.content.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    : [];

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const handleNewQuery = () => {
    router.push("/queries/chat/new");
  };

  const handleViewHistory = () => {
    router.push("/queries/history");
  };

  const handleSearchToggle = () => {
    if (collapsed && onToggle) {
      onToggle(); // Expand sidebar first
    }
    setSearchOpen(!searchOpen);
    if (searchOpen) {
      setSearchQuery("");
    }
  };

  const handleSearchClose = () => {
    setSearchOpen(false);
    setSearchQuery("");
  };

  const getUserInitial = () => {
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  // Collapsed sidebar
  if (collapsed) {
    return (
      <aside className="flex h-full w-14 flex-col border-r border-sidebar-border bg-sidebar">
        {/* Header */}
        <div className="flex h-14 items-center justify-center border-b border-sidebar-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
            title="Expand sidebar"
          >
            <PanelLeft className="size-5" />
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex flex-1 flex-col items-center gap-1 p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNewQuery}
            className={cn(
              "text-sidebar-foreground hover:bg-sidebar-accent",
              pathname === "/queries/chat/new" && "bg-sidebar-accent"
            )}
            title="New Query"
          >
            <Plus className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleViewHistory}
            className={cn(
              "text-sidebar-foreground hover:bg-sidebar-accent",
              pathname === "/queries/history" && "bg-sidebar-accent"
            )}
            title="History"
          >
            <History className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSearchToggle}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
            title="Search"
          >
            <Search className="size-5" />
          </Button>
        </div>

        {/* Footer */}
        <div className="flex flex-col items-center gap-1 border-t border-sidebar-border p-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground hover:bg-sidebar-accent"
            title="Settings"
          >
            <Settings className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
            title="Sign out"
          >
            <LogOut className="size-5" />
          </Button>
        </div>
      </aside>
    );
  }

  // Expanded sidebar
  return (
    <aside className="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-3">
        <div className="flex items-center gap-2">
          <Database className="size-5 text-primary" />
          <span className="text-base font-semibold text-sidebar-foreground">
            Query LLM
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

      {/* Search Bar */}
      {searchOpen && (
        <div className="border-b border-sidebar-border p-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search queries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 pr-9"
            />
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleSearchClose}
              className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </Button>
          </div>

          {/* Search Results */}
          {searchQuery.trim() && (
            <div className="mt-2 max-h-48 overflow-y-auto">
              {filteredChats.length === 0 ? (
                <p className="py-2 text-center text-sm text-muted-foreground">
                  No results found
                </p>
              ) : (
                <div className="flex flex-col gap-0.5">
                  {filteredChats.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => {
                        router.push(`/queries/chat/${chat.id}`);
                        handleSearchClose();
                      }}
                      className={cn(
                        "truncate rounded-md px-2 py-1.5 text-left text-sm text-sidebar-foreground hover:bg-sidebar-accent",
                        pathname === `/queries/chat/${chat.id}` && "bg-sidebar-accent"
                      )}
                    >
                      {chat.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-1 p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNewQuery}
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
          onClick={handleViewHistory}
          className={cn(
            "justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent",
            pathname === "/queries/history" && "bg-sidebar-accent"
          )}
        >
          <History className="size-4" />
          All History
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSearchToggle}
          className={cn(
            "justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent",
            searchOpen && "bg-sidebar-accent"
          )}
        >
          <Search className="size-4" />
          Search
        </Button>
      </div>

      {/* Recent Queries */}
      {!searchOpen && (
        <div className="flex-1 overflow-y-auto px-3">
          <button
            onClick={() => setHistoryExpanded(!historyExpanded)}
            className="mb-2 flex w-full items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-sidebar-foreground"
          >
            <span>Recent</span>
            <ChevronDown
              className={cn(
                "ml-auto size-4 transition-transform",
                !historyExpanded && "-rotate-90"
              )}
            />
          </button>
          {historyExpanded && (
            <div className="flex flex-col gap-0.5">
              {recentChats.length === 0 ? (
                <p className="py-2 text-sm text-muted-foreground">
                  No queries yet
                </p>
              ) : (
                recentChats.map((chat) => (
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
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Spacer when search is open */}
      {searchOpen && <div className="flex-1" />}

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-sidebar-border p-3">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <Settings className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleSignOut}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
        <div
          className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground"
          title={user?.email || "User"}
        >
          {getUserInitial()}
        </div>
      </div>
    </aside>
  );
}
