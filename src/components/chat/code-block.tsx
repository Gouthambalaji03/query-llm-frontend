"use client";

import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

interface CodeBlockProps {
  code: string;
  language: string;
}

// Custom theme based on oneDark but with softer background
const customTheme = {
  ...oneDark,
  'pre[class*="language-"]': {
    ...oneDark['pre[class*="language-"]'],
    background: "#1e1e1e",
    margin: 0,
    padding: "1rem",
    fontSize: "14px",
    lineHeight: "1.6",
  },
  'code[class*="language-"]': {
    ...oneDark['code[class*="language-"]'],
    background: "transparent",
    fontSize: "14px",
    lineHeight: "1.6",
  },
};

export function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Map common language names
  const languageMap: Record<string, string> = {
    sql: "sql",
    javascript: "javascript",
    js: "javascript",
    typescript: "typescript",
    ts: "typescript",
    python: "python",
    py: "python",
    json: "json",
    bash: "bash",
    shell: "bash",
    sh: "bash",
    code: "text",
  };

  const normalizedLanguage = languageMap[language.toLowerCase()] || language.toLowerCase();

  return (
    <div className="group relative my-4 overflow-hidden rounded-xl border border-border/40 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#2d2d2d] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="size-3 rounded-full bg-[#ff5f56]" />
            <span className="size-3 rounded-full bg-[#ffbd2e]" />
            <span className="size-3 rounded-full bg-[#27c93f]" />
          </div>
          <span className="ml-2 text-xs font-medium uppercase tracking-wider text-zinc-400">
            {language}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 gap-1.5 px-2 text-xs text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-green-400" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              <span>Copy</span>
            </>
          )}
        </Button>
      </div>

      {/* Code */}
      <div className="overflow-x-auto bg-[#1e1e1e]">
        <SyntaxHighlighter
          language={normalizedLanguage}
          style={customTheme}
          showLineNumbers={code.split("\n").length > 3}
          lineNumberStyle={{
            minWidth: "2.5em",
            paddingRight: "1em",
            color: "#4a4a4a",
            userSelect: "none",
          }}
          customStyle={{
            margin: 0,
            background: "transparent",
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
