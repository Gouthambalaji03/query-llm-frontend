"use client";

import { motion } from "framer-motion";
import { Database } from "lucide-react";

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex gap-4"
    >
      {/* Avatar */}
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 shadow-sm">
        <Database className="size-4" />
      </div>

      {/* Typing Bubble */}
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-md bg-card border border-border/60 px-5 py-4 shadow-sm">
        <motion.span
          className="size-2 rounded-full bg-muted-foreground/60"
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0 }}
        />
        <motion.span
          className="size-2 rounded-full bg-muted-foreground/60"
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
        />
        <motion.span
          className="size-2 rounded-full bg-muted-foreground/60"
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
        />
      </div>
    </motion.div>
  );
}
