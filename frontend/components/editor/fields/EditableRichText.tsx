import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
      {label && <Label className="block text-xs text-muted-foreground mb-1">{label}</Label>}
      <Textarea
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="resize-none"
      />
    </div>
  );
}
