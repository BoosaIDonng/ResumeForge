"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Palette } from "lucide-react";
import type { ResumeData } from "@/components/resume/resumeData";

type Props = {
  open: boolean;
  onClose: () => void;
  data: ResumeData;
  onChange: (data: ResumeData) => void;
};

const TEMPLATES = [
  { value: "default", label: "默认" },
  { value: "modern", label: "现代" },
  { value: "classic", label: "经典" },
  { value: "minimal", label: "简约" },
];

const PRESET_COLORS = [
  { name: "墨绿", value: "#2d6a4f" },
  { name: "深蓝", value: "#1e3a5f" },
  { name: "砖红", value: "#9b2226" },
  { name: "藏青", value: "#1b263b" },
  { name: "炭灰", value: "#333333" },
  { name: "原色", value: "#2563eb" },
];

export default function DesignSettingsDialog({ open, onClose, data, onChange }: Props) {
  const currentColor = data.metadata.design?.colors?.primary || "#2563eb";
  const currentTemplate = data.metadata.template || "default";

  function updateColor(primary: string) {
    onChange({
      ...data,
      metadata: {
        ...data.metadata,
        design: {
          colors: {
            primary,
            text: data.metadata.design?.colors?.text || "#18181b",
            background: data.metadata.design?.colors?.background || "#ffffff",
          },
        },
      },
    });
  }

  function updateTemplate(template: string) {
    onChange({
      ...data,
      metadata: { ...data.metadata, template },
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-4 w-4" /> 设计设置
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div>
            <Label className="mb-2 block text-xs text-muted-foreground">模板风格</Label>
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => updateTemplate(t.value)}
                  className={`border px-3 py-2.5 text-sm font-medium transition-colors ${
                    currentTemplate === t.value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-2 block text-xs text-muted-foreground">主色调</Label>
            <div className="flex flex-wrap items-center gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => updateColor(c.value)}
                  title={c.name}
                  className={`h-8 w-8 border-2 transition-all ${
                    currentColor.toLowerCase() === c.value.toLowerCase()
                      ? "border-foreground scale-110"
                      : "border-border hover:scale-105"
                  }`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
              <div className="ml-1 flex items-center gap-1.5">
                <input
                  type="color"
                  value={currentColor}
                  onChange={(e) => updateColor(e.target.value)}
                  className="h-8 w-8 cursor-pointer"
                />
                <span className="text-xs tabular-nums text-muted-foreground">{currentColor}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
