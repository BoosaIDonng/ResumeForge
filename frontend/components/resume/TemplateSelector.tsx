"use client";

import { cn } from "@/lib/utils";
import { templates } from "./templates";
import type { ResumeData } from "./resumeData";
import { Check } from "lucide-react";

type Props = {
  data: ResumeData;
  onSelect: (templateId: string) => void;
};

export default function TemplateSelector({ data, onSelect }: Props) {
  const currentTemplate = data.metadata.template || "default";

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">选择模板</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 max-h-[320px] overflow-y-auto pr-1">
        {templates.map((tpl) => {
          const isActive = currentTemplate === tpl.id;
          return (
            <button
              key={tpl.id}
              type="button"
              onClick={() => onSelect(tpl.id)}
              className={cn(
                "group relative flex flex-col items-start rounded-lg border p-2 text-left transition-all hover:border-primary/50",
                isActive
                  ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                  : "border-border hover:bg-muted/30"
              )}
            >
              {/* Mini preview thumbnail */}
              <div className="w-full aspect-[210/297] overflow-hidden rounded border border-border/50 bg-white mb-1.5 pointer-events-none">
                <div className="origin-top-left scale-[0.25] w-[400%] h-[400%]">
                  <tpl.component data={data} />
                </div>
              </div>

              {/* Template name + description */}
              <div className="w-full min-w-0">
                <div className="flex items-center gap-1">
                  <span className={cn("text-xs font-medium truncate", isActive ? "text-primary" : "text-foreground")}>
                    {tpl.name}
                  </span>
                  {isActive && <Check className="size-3 text-primary shrink-0" />}
                </div>
                <p className="text-[10px] text-muted-foreground/70 leading-tight mt-0.5 line-clamp-2">
                  {tpl.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
