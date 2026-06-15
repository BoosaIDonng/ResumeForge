"use client";

import { useState, useRef } from "react";
import { Calendar, X } from "lucide-react";
import { Label } from "@/components/ui/label";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  nullable?: boolean;  // if true, null means "至今"
};

export function EditableDate({ label, value, onChange, nullable = false }: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayValue = value === "" ? (nullable ? "至今" : "") : value;

  return (
    <div className="relative">
      <Label className="block text-xs text-muted-foreground mb-1">{label}</Label>
      <div className="flex items-center gap-1">
        <div
          className="flex-1 flex items-center h-8 border border-border bg-muted/50 px-2.5 text-sm text-foreground cursor-pointer focus:border-primary focus:bg-background"
          onClick={() => inputRef.current?.showPicker?.() ?? setShowPicker(true)}
        >
          <span className={displayValue ? "" : "text-muted-foreground/60"}>
            {displayValue || "YYYY-MM"}
          </span>
          <Calendar className="ml-auto size-3.5 text-muted-foreground/60" />
        </div>
        {(value || nullable) && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-muted-foreground/60 hover:text-destructive p-0.5"
            title="清除"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="month"
        className="absolute opacity-0 pointer-events-none"
        value={value}
        onChange={(e) => { onChange(e.target.value); setShowPicker(false); }}
        onBlur={() => setShowPicker(false)}
      />
    </div>
  );
}
