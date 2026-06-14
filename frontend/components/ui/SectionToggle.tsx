"use client";

import { Eye, EyeOff } from "lucide-react";

type SectionToggleProps = {
  hidden: boolean;
  onToggle: (hidden: boolean) => void;
  label?: string;
};

export default function SectionToggle({ hidden, onToggle, label }: SectionToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(!hidden)}
      className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
        hidden
          ? "bg-muted text-muted-foreground/60"
          : "bg-primary/10 text-primary"
      }`}
      title={hidden ? "显示此部分" : "隐藏此部分"}
    >
      {hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      {label && <span>{label}</span>}
    </button>
  );
}
