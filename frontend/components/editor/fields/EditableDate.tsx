"use client";

import { Label } from "@/components/ui/label";
import { MonthYearPicker } from "./MonthYearPicker";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  nullable?: boolean;
};

export function EditableDate({ label, value, onChange, nullable = false }: Props) {
  return (
    <div>
      <Label className="block text-xs text-muted-foreground mb-1">{label}</Label>
      <MonthYearPicker value={value} onChange={onChange} nullable={nullable} />
    </div>
  );
}
