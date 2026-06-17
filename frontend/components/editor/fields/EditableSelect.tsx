import { X } from "lucide-react";
import { Label } from "@/components/ui/label";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  clearable?: boolean;
};

export function EditableSelect({ label, value, onChange, options, placeholder = "请选择", clearable = true }: Props) {
  return (
    <div>
      {label && <Label className="block text-xs text-muted-foreground mb-1">{label}</Label>}
      <div className="flex items-center gap-1">
        <select
          className="flex-1 h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm text-foreground transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {clearable && value && (
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
    </div>
  );
}
