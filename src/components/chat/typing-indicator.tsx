"use client";

import { motion } from "framer-motion";
import { Database, Sparkles } from "lucide-react";

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex gap-4 ml-10"
    >

      {/* Generating Indicator */}
      <div className="flex items-center gap-2">
        <motion.span
          className="text-primary"
          animate={{ rotate: [0, 12, -12, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkles className="size-4" />
        </motion.span>
        <motion.span
          className="text-xs font-medium text-foreground"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        >
          Generating
        </motion.span>
      </div>
    </motion.div>
  );
}
