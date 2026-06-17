import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "tel";
  className?: string;
};

export function EditableText({ label, value, onChange, placeholder, type = "text", className = "" }: Props) {
  return (
    <div className={className}>
      {label && <Label className="block text-xs text-muted-foreground mb-1">{label}</Label>}
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
