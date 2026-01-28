"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Copy, Check, ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageActionsProps {
  content: string;
  className?: string;
}

export function MessageActions({ content, className }: MessageActionsProps) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = (type: "up" | "down") => {
    setFeedback(feedback === type ? null : type);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-center gap-1 pt-2",
        className
      )}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
      >
        {copied ? (
          <>
            <Check className="size-3.5 text-green-500" />
            <span>Copied</span>
          </>
        ) : (
          <>
            <Copy className="size-3.5" />
            <span>Copy</span>
          </>
        )}
      </Button>

      <div className="mx-1 h-4 w-px bg-border" />

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => handleFeedback("up")}
        className={cn(
          "h-7 w-7 text-muted-foreground hover:text-foreground",
          feedback === "up" && "text-green-500 hover:text-green-600"
        )}
      >
        <ThumbsUp className="size-3.5" />
      </Button>

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => handleFeedback("down")}
        className={cn(
          "h-7 w-7 text-muted-foreground hover:text-foreground",
          feedback === "down" && "text-red-500 hover:text-red-600"
        )}
      >
        <ThumbsDown className="size-3.5" />
      </Button>
    </motion.div>
  );
}
