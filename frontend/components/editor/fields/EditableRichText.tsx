import { Label } from "@/components/ui/label";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
};

export function EditableRichText({ label, value, onChange, rows = 3, placeholder }: Props) {
  return (
    <div>
      <Label className="block text-xs text-muted-foreground mb-1">{label}</Label>
      <textarea
        className="w-full border border-border bg-muted/50 px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/60 resize-none focus:border-primary focus:bg-background focus:outline-none"
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
