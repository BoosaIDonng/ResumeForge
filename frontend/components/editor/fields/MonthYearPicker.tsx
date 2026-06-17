"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type Props = {
  value: string; // "YYYY-MM" or ""
  onChange: (value: string) => void;
  nullable?: boolean;
};

const MONTHS = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

function parseValue(value: string): { year: number; month: number } {
  if (value && /^\d{4}-\d{2}$/.test(value)) {
    const [y, m] = value.split("-").map(Number);
    return { year: y, month: m - 1 };
  }
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() };
}

function formatValue(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

export function MonthYearPicker({ value, onChange, nullable = false }: Props) {
  const [open, setOpen] = useState(false);
  const parsed = parseValue(value);
  const [viewYear, setViewYear] = useState(parsed.year);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync viewYear when the picker opens
  useEffect(() => {
    if (open) {
      setViewYear(parseValue(value).year);
    }
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const displayText = value || (nullable ? "至今" : "");

  return (
    <div ref={containerRef} className="relative">
      <div
        className="flex items-center h-8 border border-border bg-muted/50 px-2.5 text-sm text-foreground cursor-pointer hover:border-primary/40 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className={displayText ? "" : "text-muted-foreground/60"}>
          {displayText || "YYYY-MM"}
        </span>
        <div className="ml-auto flex items-center gap-1">
          {(value || nullable) && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(""); }}
              className="text-muted-foreground/60 hover:text-destructive p-0.5"
              title="清除"
            >
              <X className="size-3" />
            </button>
          )}
        </div>
      </div>

      {open && (
        <div className="absolute z-50 top-full left-0 mt-1 bg-card border border-border shadow-lg p-3 w-64">
          {/* Year navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => setViewYear(viewYear - 1)}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="text-sm font-medium text-foreground tabular-nums">{viewYear}</span>
            <button
              type="button"
              onClick={() => setViewYear(viewYear + 1)}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          {/* 4×3 month grid */}
          <div className="grid grid-cols-4 gap-1">
            {MONTHS.map((label, idx) => {
              const isSelected = value && parsed.year === viewYear && parsed.month === idx;
              const isNow = new Date().getFullYear() === viewYear && new Date().getMonth() === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onChange(formatValue(viewYear, idx));
                    setOpen(false);
                  }}
                  className={`h-8 text-xs font-medium transition-colors ${
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : isNow
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Clear button */}
          {nullable && value && (
            <button
              type="button"
              onClick={() => { onChange(""); setOpen(false); }}
              className="w-full mt-2 py-1.5 text-xs text-muted-foreground hover:text-destructive border-t border-border pt-2 transition-colors"
            >
              清除日期
            </button>
          )}
        </div>
      )}
    </div>
  );
}
