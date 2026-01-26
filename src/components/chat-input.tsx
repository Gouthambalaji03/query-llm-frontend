"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Clock,
  ChevronDown,
  ArrowUp,
  Pencil,
  Sparkles,
  Code,
  Briefcase,
  Lightbulb,
} from "lucide-react";

interface ChatInputProps {
  onSendMessage?: (message: string) => void;
}

export function ChatInput({ onSendMessage }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState("Opus 4.5");

  const handleSubmit = () => {
    if (message.trim() && onSendMessage) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const quickActions = [
    { icon: Pencil, label: "Write" },
    { icon: Sparkles, label: "Learn" },
    { icon: Code, label: "Code" },
    { icon: Briefcase, label: "Life stuff" },
    { icon: Lightbulb, label: "Claude's choice" },
  ];

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Morning";
    if (hour < 17) return "Afternoon";
    return "Evening";
  };

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-6">
      {/* Greeting */}
      <div className="flex items-center gap-3">
        <span className="text-3xl">✳️</span>
        <h1 className="text-4xl font-medium text-foreground">
          {getGreeting()}, Bro
        </h1>
      </div>

      {/* Input Container */}
      <div className="w-full rounded-2xl border border-border bg-card shadow-sm">
        {/* Text Area */}
        <div className="p-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="How can I help you today?"
            rows={1}
            className="w-full resize-none bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>

        {/* Bottom Bar */}
        <div className="flex items-center justify-between border-t border-border px-3 py-2">
          {/* Left Actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <Plus className="size-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-blue-500 hover:text-blue-600"
            >
              <Clock className="size-5" />
            </Button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Model Selector */}
            <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              {selectedModel}
              <ChevronDown className="size-4" />
            </button>

            {/* Submit Button */}
            <Button
              size="icon-sm"
              onClick={handleSubmit}
              disabled={!message.trim()}
              className={cn(
                "rounded-lg",
                message.trim()
                  ? "bg-amber-600 text-white hover:bg-amber-700"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <ArrowUp className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap justify-center gap-2">
        {quickActions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            size="sm"
            className="gap-2 rounded-full border-border bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <action.icon className="size-4" />
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
