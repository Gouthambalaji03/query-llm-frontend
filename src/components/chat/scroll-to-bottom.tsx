"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

interface ScrollToBottomProps {
  show: boolean;
  onClick: () => void;
}

export function ScrollToBottom({ show, onClick }: ScrollToBottomProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10"
        >
          <Button
            variant="secondary"
            size="sm"
            onClick={onClick}
            className="gap-1.5 rounded-full shadow-lg border border-border/50 bg-background/95 backdrop-blur-sm hover:bg-accent"
          >
            <ArrowDown className="size-4" />
            <span>Scroll to bottom</span>
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
