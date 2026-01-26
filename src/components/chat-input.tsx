"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

interface ChatInputProps {
  onSendMessage?: (message: string) => void;
  showGreeting?: boolean;
}

export function ChatInput({ onSendMessage, showGreeting = true }: ChatInputProps) {
  const [message, setMessage] = useState("");

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
            className="w-full resize-none bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>

        {/* Bottom Bar */}
        <div className="flex items-center justify-end border-t border-border px-3 py-2">
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
  );
}
