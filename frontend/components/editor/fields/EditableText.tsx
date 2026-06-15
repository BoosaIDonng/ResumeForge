import { Label } from "@/components/ui/label";

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
      <Label className="block text-xs text-muted-foreground mb-1">{label}</Label>
      <input
        type={type}
        className="w-full h-8 border border-border bg-muted/50 px-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:bg-background focus:outline-none"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
