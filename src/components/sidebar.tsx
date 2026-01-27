"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  const loadDummyData = useChatStore((state) => state.loadDummyData);
  const [historyExpanded, setHistoryExpanded] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load dummy data on mount
  useEffect(() => {
    loadDummyData();
  }, [loadDummyData]);

  const recentChats = chats.slice(0, 5);

  const filteredChats = searchQuery.trim()
    ? chats.filter(
        (chat) =>
          chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          chat.messages.some((msg) =>
            msg.content.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    : [];

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
      onToggle();
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

  const sidebarVariants = {
    expanded: { width: 256 },
    collapsed: { width: 56 },
  };

  const contentVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <motion.aside
      initial={false}
      animate={collapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="flex h-full flex-col border-r border-sidebar-border bg-sidebar overflow-hidden"
    >
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-3">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2"
            >
              <Database className="size-5 text-primary" />
              <span className="text-base font-semibold text-sidebar-foreground whitespace-nowrap">
                Query LLM
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggle}
          className="text-sidebar-foreground hover:bg-sidebar-accent shrink-0"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <motion.div
            animate={{ rotate: collapsed ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {collapsed ? <PanelLeft className="size-5" /> : <PanelLeftClose className="size-5" />}
          </motion.div>
        </Button>
      </div>

      {/* Search Bar */}
      <AnimatePresence>
        {searchOpen && !collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-b border-sidebar-border overflow-hidden"
          >
            <div className="p-3">
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

              <AnimatePresence>
                {searchQuery.trim() && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-2 max-h-48 overflow-y-auto"
                  >
                    {filteredChats.length === 0 ? (
                      <p className="py-2 text-center text-sm text-muted-foreground">
                        No results found
                      </p>
                    ) : (
                      <div className="flex flex-col gap-0.5">
                        {filteredChats.map((chat, index) => (
                          <motion.button
                            key={chat.id}
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
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
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex flex-col gap-1 p-3">
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "sm"}
          onClick={handleNewQuery}
          className={cn(
            "text-sidebar-foreground hover:bg-sidebar-accent",
            !collapsed && "justify-start gap-2",
            pathname === "/queries/chat/new" && "bg-sidebar-accent"
          )}
          title="New Query"
        >
          <Plus className="size-4 shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={contentVariants}
                transition={{ duration: 0.15 }}
                className="whitespace-nowrap"
              >
                New Query
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "sm"}
          onClick={handleViewHistory}
          className={cn(
            "text-sidebar-foreground hover:bg-sidebar-accent",
            !collapsed && "justify-start gap-2",
            pathname === "/queries/history" && "bg-sidebar-accent"
          )}
          title="History"
        >
          <History className="size-4 shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={contentVariants}
                transition={{ duration: 0.15 }}
                className="whitespace-nowrap"
              >
                All History
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "sm"}
          onClick={handleSearchToggle}
          className={cn(
            "text-sidebar-foreground hover:bg-sidebar-accent",
            !collapsed && "justify-start gap-2",
            searchOpen && "bg-sidebar-accent"
          )}
          title="Search"
        >
          <Search className="size-4 shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={contentVariants}
                transition={{ duration: 0.15 }}
                className="whitespace-nowrap"
              >
                Search
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </div>

      {/* Recent Queries */}
      <AnimatePresence>
        {!searchOpen && !collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-y-auto px-3"
          >
            <button
              onClick={() => setHistoryExpanded(!historyExpanded)}
              className="mb-2 flex w-full items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-sidebar-foreground"
            >
              <span>Recent</span>
              <motion.div
                animate={{ rotate: historyExpanded ? 0 : -90 }}
                transition={{ duration: 0.2 }}
                className="ml-auto"
              >
                <ChevronDown className="size-4" />
              </motion.div>
            </button>
            <AnimatePresence>
              {historyExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-0.5 overflow-hidden"
                >
                  {recentChats.length === 0 ? (
                    <p className="py-2 text-sm text-muted-foreground">
                      No queries yet
                    </p>
                  ) : (
                    recentChats.map((chat, index) => (
                      <motion.button
                        key={chat.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => router.push(`/queries/chat/${chat.id}`)}
                        className={cn(
                          "truncate rounded-md px-2 py-1.5 text-left text-sm text-sidebar-foreground hover:bg-sidebar-accent",
                          pathname === `/queries/chat/${chat.id}` && "bg-sidebar-accent"
                        )}
                      >
                        {chat.title}
                      </motion.button>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer */}
      {(searchOpen || collapsed) && <div className="flex-1" />}

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-sidebar-border p-3">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-sidebar-foreground hover:bg-sidebar-accent"
            title="Settings"
          >
            <Settings className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleSignOut}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
            title="Sign out"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground"
              title={user?.email || "User"}
            >
              {getUserInitial()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
