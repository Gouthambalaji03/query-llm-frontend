"use client";

import { cn } from "@/lib/utils";

interface DataTableProps {
  headers: string[];
  rows: string[][];
}

// Check if a cell value looks like a number
const isNumeric = (value: string): boolean => {
  const cleaned = value.replace(/[$,%]/g, "").trim();
  return !isNaN(Number(cleaned)) && cleaned !== "";
};

export function DataTable({ headers, rows }: DataTableProps) {
  return (
    <div className="my-4 overflow-hidden rounded-xl border border-border/50 bg-card/30 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/60">
              {headers.map((header, i) => (
                <th
                  key={i}
                  className={cn(
                    "px-4 py-3 text-left font-semibold text-foreground sticky top-0 bg-muted/60",
                    i === 0 && "rounded-tl-xl",
                    i === headers.length - 1 && "rounded-tr-xl"
                  )}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={cn(
                  "border-b border-border/30 transition-colors",
                  rowIndex % 2 === 1 && "bg-muted/20",
                  rowIndex === rows.length - 1 && "border-b-0",
                  "hover:bg-primary/5"
                )}
              >
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className={cn(
                      "px-4 py-3 text-muted-foreground",
                      isNumeric(cell) && "text-right font-mono tabular-nums"
                    )}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
