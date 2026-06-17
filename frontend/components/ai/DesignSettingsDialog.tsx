"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Palette, Type, LayoutTemplate, Paintbrush, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ResumeData } from "@/components/resume/resumeData";
import { templates } from "@/components/resume/templates";

type Props = {
  open: boolean;
  onClose: () => void;
  data: ResumeData;
  onChange: (data: ResumeData) => void;
};

const PRESET_COLORS = [
  { name: "默认蓝", value: "#2563eb" },
  { name: "墨绿", value: "#2d6a4f" },
  { name: "深蓝", value: "#1e3a5f" },
  { name: "砖红", value: "#9b2226" },
  { name: "藏青", value: "#1b263b" },
  { name: "炭灰", value: "#333333" },
  { name: "靛紫", value: "#4c1d95" },
  { name: "棕褐", value: "#78350f" },
  { name: "玫红", value: "#be185d" },
  { name: "翠蓝", value: "#0e7490" },
  { name: "橄榄", value: "#3f6212" },
  { name: "橘红", value: "#c2410c" },
];

const FONT_SIZES: { label: string; value: "small" | "medium" | "large"; desc: string }[] = [
  { label: "小", value: "small", desc: "适合内容丰富" },
  { label: "中", value: "medium", desc: "默认推荐" },
  { label: "大", value: "large", desc: "适合简洁简历" },
];

const LINE_SPACINGS: { label: string; value: "compact" | "normal" | "relaxed" }[] = [
  { label: "紧凑", value: "compact" },
  { label: "标准", value: "normal" },
  { label: "宽松", value: "relaxed" },
];

export default function DesignSettingsDialog({ open, onClose, data, onChange }: Props) {
  const [activeTab, setActiveTab] = useState<"template" | "color" | "typography">("template");

  const currentTemplate = data.metadata.template || "default";
  const currentColor = data.metadata.design?.colors?.primary || "#2563eb";
  const currentFontSize = data.metadata.design?.fontSize || "medium";
  const currentLineSpacing = data.metadata.design?.lineSpacing || "normal";

  function updateTemplate(templateId: string) {
    onChange({
      ...data,
      metadata: { ...data.metadata, template: templateId },
    });
  }

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

  function updateFontSize(fontSize: "small" | "medium" | "large") {
    onChange({
      ...data,
      metadata: {
        ...data.metadata,
        design: {
          ...data.metadata.design,
          colors: {
            primary: currentColor,
            text: data.metadata.design?.colors?.text || "#18181b",
            background: data.metadata.design?.colors?.background || "#ffffff",
          },
          fontSize,
        },
      },
    });
  }

  function updateLineSpacing(lineSpacing: "compact" | "normal" | "relaxed") {
    onChange({
      ...data,
      metadata: {
        ...data.metadata,
        design: {
          ...data.metadata.design,
          colors: {
            primary: currentColor,
            text: data.metadata.design?.colors?.text || "#18181b",
            background: data.metadata.design?.colors?.background || "#ffffff",
          },
          lineSpacing,
        },
      },
    });
  }

  const tabs = [
    { key: "template" as const, icon: LayoutTemplate, label: "模板" },
    { key: "color" as const, icon: Paintbrush, label: "配色" },
    { key: "typography" as const, icon: Type, label: "排版" },
  ];

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-[680px] p-0 flex flex-col max-h-[85vh]">
        <DialogHeader className="p-4 pb-0 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Palette className="h-4 w-4" /> 模板设计
          </DialogTitle>
        </DialogHeader>

        {/* Tab bar */}
        <div className="flex gap-1 px-4 pt-2 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                activeTab === tab.key
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4 pt-3">
          {/* Template Tab */}
          {activeTab === "template" && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                选择一个模板风格，点击即可实时预览
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {templates.map((tpl) => {
                  const isActive = currentTemplate === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => updateTemplate(tpl.id)}
                      className={cn(
                        "group relative flex flex-col items-start rounded-lg border-2 p-2 text-left transition-all",
                        isActive
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-border hover:border-primary/40 hover:bg-muted/30"
                      )}
                    >
                      {/* Thumbnail preview */}
                      <div className="w-full aspect-[210/297] overflow-hidden rounded border border-border/50 bg-white mb-2 pointer-events-none">
                        <div className="origin-top-left scale-[0.2] w-[500%] h-[500%]">
                          <tpl.component data={data} />
                        </div>
                      </div>

                      <div className="w-full min-w-0">
                        <div className="flex items-center gap-1">
                          <span className={cn("text-xs font-medium truncate", isActive ? "text-primary" : "text-foreground")}>
                            {tpl.name}
                          </span>
                          {isActive && <Check className="size-3 text-primary shrink-0" />}
                        </div>
                        <p className="text-[10px] text-muted-foreground/70 leading-tight mt-0.5 line-clamp-1">
                          {tpl.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Color Tab */}
          {activeTab === "color" && (
            <div className="space-y-5">
              {/* Preset colors */}
              <div>
                <Label className="mb-2.5 block text-xs font-medium text-foreground">主题色</Label>
                <div className="grid grid-cols-6 gap-2.5">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => updateColor(c.value)}
                      title={c.name}
                      className={cn(
                        "relative h-10 w-full rounded-lg border-2 transition-all hover:scale-105",
                        currentColor.toLowerCase() === c.value.toLowerCase()
                          ? "border-foreground ring-2 ring-foreground/20 scale-105"
                          : "border-border/50"
                      )}
                      style={{ backgroundColor: c.value }}
                    >
                      {currentColor.toLowerCase() === c.value.toLowerCase() && (
                        <Check className="absolute inset-0 m-auto size-4 text-white drop-shadow" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom color */}
              <div>
                <Label className="mb-2 block text-xs font-medium text-foreground">自定义颜色</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={currentColor}
                    onChange={(e) => updateColor(e.target.value)}
                    className="h-10 w-14 cursor-pointer rounded border border-border"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={currentColor}
                      onChange={(e) => {
                        if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
                          updateColor(e.target.value);
                        }
                      }}
                      className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm font-mono"
                      placeholder="#2563eb"
                    />
                  </div>
                  <div
                    className="h-10 w-20 rounded-md border border-border"
                    style={{ backgroundColor: currentColor }}
                  />
                </div>
              </div>

              {/* Color preview */}
              <div>
                <Label className="mb-2 block text-xs font-medium text-foreground">预览效果</Label>
                <div className="rounded-lg border border-border p-4 space-y-2">
                  <div className="h-3 rounded" style={{ backgroundColor: currentColor, width: "60%" }} />
                  <div className="h-2 w-4/5 rounded bg-muted" />
                  <div className="h-2 w-3/5 rounded bg-muted" />
                  <div className="flex gap-2 mt-3">
                    <div className="h-6 w-16 rounded-full text-[10px] text-white flex items-center justify-center" style={{ backgroundColor: currentColor }}>
                      标签
                    </div>
                    <div className="h-6 w-16 rounded-full text-[10px] text-white flex items-center justify-center" style={{ backgroundColor: currentColor, opacity: 0.7 }}>
                      标签
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Typography Tab */}
          {activeTab === "typography" && (
            <div className="space-y-6">
              {/* Font size */}
              <div>
                <Label className="mb-2.5 block text-xs font-medium text-foreground">字号大小</Label>
                <div className="grid grid-cols-3 gap-2">
                  {FONT_SIZES.map((fs) => (
                    <button
                      key={fs.value}
                      onClick={() => updateFontSize(fs.value)}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-lg border-2 px-3 py-3 transition-all",
                        currentFontSize === fs.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40"
                      )}
                    >
                      <span className={cn(
                        "font-medium",
                        fs.value === "small" ? "text-xs" : fs.value === "medium" ? "text-sm" : "text-base"
                      )}>
                        {fs.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{fs.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Line spacing */}
              <div>
                <Label className="mb-2.5 block text-xs font-medium text-foreground">行间距</Label>
                <div className="grid grid-cols-3 gap-2">
                  {LINE_SPACINGS.map((ls) => (
                    <button
                      key={ls.value}
                      onClick={() => updateLineSpacing(ls.value)}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-lg border-2 px-3 py-3 transition-all",
                        currentLineSpacing === ls.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40"
                      )}
                    >
                      <div className="flex flex-col w-full">
                        <div className="h-1.5 w-full rounded bg-muted-foreground/30" />
                        <div className={cn(
                          "h-1.5 w-4/5 rounded bg-muted-foreground/30",
                          ls.value === "compact" ? "mt-0.5" : ls.value === "normal" ? "mt-1" : "mt-2"
                        )} />
                        <div className={cn(
                          "h-1.5 w-3/5 rounded bg-muted-foreground/30",
                          ls.value === "compact" ? "mt-0.5" : ls.value === "normal" ? "mt-1" : "mt-2"
                        )} />
                      </div>
                      <span className="text-xs font-medium mt-1">{ls.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Page margins */}
              <div>
                <Label className="mb-2.5 block text-xs font-medium text-foreground">页面边距</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "窄", value: "narrow", padding: "p-1" },
                    { label: "标准", value: "normal", padding: "p-3" },
                    { label: "宽", value: "wide", padding: "p-5" },
                  ].map((m) => (
                    <button
                      key={m.value}
                      onClick={() => {
                        onChange({
                          ...data,
                          metadata: {
                            ...data.metadata,
                            design: {
                              ...data.metadata.design,
                              colors: {
                                primary: currentColor,
                                text: data.metadata.design?.colors?.text || "#18181b",
                                background: data.metadata.design?.colors?.background || "#ffffff",
                              },
                              margins: m.value as "narrow" | "normal" | "wide",
                            },
                          },
                        });
                      }}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-lg border-2 px-3 py-3 transition-all",
                        data.metadata.design?.margins === m.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40"
                      )}
                    >
                      <div className={cn("w-full h-12 rounded border-2 border-dashed border-muted-foreground/30 flex items-center justify-center", m.padding)}>
                        <div className="w-full h-full rounded bg-muted-foreground/10" />
                      </div>
                      <span className="text-xs font-medium">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
