"use client";

type ColorPickerProps = {
  label: string;
  value: string;
  onChange: (color: string) => void;
};

const PRESET_COLORS = [
  "#18181b", "#374151", "#6b7280",
  "#2563eb", "#3b82f6", "#60a5fa",
  "#059669", "#10b981", "#34d399",
  "#d97706", "#f59e0b", "#fbbf24",
  "#dc2626", "#ef4444", "#f87171",
  "#7c3aed", "#8b5cf6", "#a78bfa",
];

export default function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border-0"
        />
        <div className="flex flex-wrap gap-1">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onChange(color)}
              className={`w-5 h-5 rounded-full border-2 transition-all ${
                value === color ? "border-primary scale-110" : "border-transparent hover:scale-110"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
