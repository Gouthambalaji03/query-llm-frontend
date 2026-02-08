"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

interface ChatInputProps {
  onSendMessage?: (message: string) => void;
  showGreeting?: boolean;
  disabled?: boolean;
  showModelSelector?: boolean;
  selectedModel?: string;
  onModelChange?: (model: string) => void;
}

export function ChatInput({
  onSendMessage,
  showGreeting = true,
  disabled = false,
  showModelSelector = false,
  selectedModel,
  onModelChange,
}: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    if (!disabled && message.trim() && onSendMessage) {
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

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-6">
      {/* Greeting */}
      {showGreeting && (
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-3xl font-semibold text-foreground">
            What would you like to query?
          </h1>
          <p className="text-muted-foreground">
            Ask questions about your data in natural language
          </p>
        </div>
      )}

      {/* Input Container */}
      <div className="w-full rounded-2xl border border-border bg-card shadow-sm">
        {/* Text Area */}
        <div className="p-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your database..."
            rows={1}
            disabled={disabled}
            className="w-full resize-none bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>

        {/* Bottom Bar */}
        <div className={cn(
          "flex items-center border-t border-border px-3 py-2",
          showModelSelector ? "justify-between" : "justify-end"
        )}>
          {/* Model Selector - Left Side */}
          {showModelSelector && selectedModel && onModelChange && (
            <div className="flex items-center gap-2">
              <select
                value={selectedModel}
                onChange={(e) => onModelChange(e.target.value)}
                disabled={disabled}
                className="rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-amber-600 disabled:opacity-50"
              >
                <option value="openai:gpt-4o">GPT-4o</option>
                <option value="openai:gpt-4o-mini">GPT-4o Mini</option>
                <option value="openai:o1">o1</option>
                <option value="openai:o1-mini">o1 Mini</option>
                <option value="anthropic:claude-sonnet-4.5">Claude Sonnet 4.5</option>
                <option value="anthropic:claude-opus-4.6">Claude Opus 4.6</option>
                <option value="anthropic:claude-haiku-4.5">Claude Haiku 4.5</option>
                <option value="gemini:gemini-2.5-flash">Gemini 2.5 Flash</option>
                <option value="gemini:gemini-2.5-pro">Gemini 2.5 Pro</option>
                <option value="gemini:gemini-3-flash-preview">Gemini 3 Flash Preview</option>
              </select>
            </div>
          )}

          {/* Submit Button - Right Side */}
          <Button
            size="icon-sm"
            onClick={handleSubmit}
            disabled={disabled || !message.trim()}
            className={cn(
              "rounded-lg",
              message.trim() && !disabled
                ? "bg-amber-600 text-white hover:bg-amber-700"
                : "bg-muted text-muted-foreground"
            )}
          >
            <ArrowUp className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
