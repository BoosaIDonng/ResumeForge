"use client";

import { Plus, X } from "lucide-react";
import { Label } from "@/components/ui/label";

type Props = {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
};

export function EditableList({ label, items, onChange, placeholder = "输入内容" }: Props) {
  function addItem() {
    onChange([...items, ""]);
  }

  function updateItem(index: number, value: string) {
    const newItems = [...items];
    newItems[index] = value;
    onChange(newItems);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div>
      <Label className="block text-xs text-muted-foreground mb-1.5">{label}</Label>
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground/40 w-4 text-right">{i + 1}.</span>
            <input
              className="flex-1 h-7 border border-border bg-muted/50 px-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:bg-background focus:outline-none"
              placeholder={placeholder}
              value={item}
              onChange={(e) => updateItem(i, e.target.value)}
            />
            <button
              type="button"
              onClick={() => removeItem(i)}
              className="text-muted-foreground/40 hover:text-destructive p-0.5"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addItem}
        className="mt-1.5 inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80"
      >
        <Plus className="size-3" />
        添加{label}
      </button>
    </div>
  );
}
