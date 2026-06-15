"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Resume } from "@/lib/types";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { calcCompleteness, parseResumeDataSafe, getPreviewSummary } from "@/lib/completeness";

type Props = {
  resume: Resume;
  index: number;
  onRename: (id: string, newTitle: string) => void;
  onCopy: (id: string) => void;
  onShare: (id: string) => void;
  onDelete: (id: string) => void;
};

const templateLabels: Record<string, string> = {
  default: "默认", modern: "现代", classic: "经典", minimal: "简约",
};

function getTemplateFromData(resumeData: string): string {
  try { return JSON.parse(resumeData)?.metadata?.template || "default"; }
  catch { return "default"; }
}

export default function ResumeCard({ resume, index, onRename, onCopy, onShare, onDelete }: Props) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(resume.title);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const template = getTemplateFromData(resume.resumeData);
  const label = templateLabels[template] || template;
  const parsedData = parseResumeDataSafe(resume.resumeData);
  const completeness = parsedData ? calcCompleteness(parsedData) : 0;
  const personName = parsedData?.basics?.name || "";
  const headline = parsedData?.basics?.headline || "";
  const summary = getPreviewSummary(resume.resumeData, 55);
  const num = String(index + 1).padStart(2, "0");

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (editing && inputRef.current) { inputRef.current.focus(); inputRef.current.select(); }
  }, [editing]);

  function handleSaveRename() {
    const trimmed = title.trim();
    if (trimmed && trimmed !== resume.title) onRename(resume.id, trimmed);
    else setTitle(resume.title);
    setEditing(false);
  }

  function handleCardClick(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest("[data-menu]")) return;
    router.push(`/resumes/${resume.id}/edit`);
  }

  return (
    <div
      onClick={handleCardClick}
      className="group cursor-pointer bg-card transition-colors hover:bg-muted/30"
    >
      <div className="p-5">
        {/* Number */}
        <span className="mb-2 block font-heading text-3xl font-bold leading-none text-muted-foreground/15 tabular-nums select-none">
          {num}
        </span>

        {/* Title */}
        {editing ? (
          <input
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSaveRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveRename();
              if (e.key === "Escape") { setTitle(resume.title); setEditing(false); }
            }}
            onClick={(e) => e.stopPropagation()}
            className="mb-1 w-full border border-border bg-card px-1 py-0.5 font-heading text-lg font-bold text-foreground outline-none focus:border-primary"
          />
        ) : (
          <h3 className="mb-1 font-heading text-lg font-bold leading-tight text-foreground" title={resume.title}>
            {resume.title}
          </h3>
        )}

        {/* Byline */}
        {(personName || headline) && (
          <p className="text-xs text-muted-foreground mb-2">
            {personName && <span className="font-medium text-foreground">{personName}</span>}
            {personName && headline && <span className="mx-1">·</span>}
            {headline}
          </p>
        )}

        {/* Summary snippet */}
        {summary && (
          <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-2">
            {summary}
          </p>
        )}

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
            <span>完整度</span>
            <span className="tabular-nums font-medium">{completeness}%</span>
          </div>
          <div className="h-1.5 w-full bg-muted">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${completeness}%` }}
            />
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border pt-2">
          <div className="flex items-center gap-2">
            <span className="border border-border px-1.5 py-0.5 font-medium">{label}</span>
            {resume.master && (
              <span className="border border-primary/40 text-primary px-1.5 py-0.5 font-medium">主版</span>
            )}
          </div>
          <span className="tabular-nums">
            {new Date(resume.updatedAt).toLocaleDateString("zh-CN", { month: "short", day: "numeric" })}
          </span>
        </div>

        {/* Hover actions */}
        <div className="mt-2 flex items-center gap-3 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
          <Button variant="ghost" size="xs" onClick={(e) => { e.stopPropagation(); router.push(`/resumes/${resume.id}/edit`); }} className="px-1 text-[11px] text-muted-foreground hover:bg-transparent hover:text-primary">编辑</Button>
          <Button variant="ghost" size="xs" onClick={(e) => { e.stopPropagation(); onCopy(resume.id); }} className="px-1 text-[11px] text-muted-foreground hover:bg-transparent hover:text-primary">复制</Button>
          <Button variant="ghost" size="xs" onClick={(e) => { e.stopPropagation(); onShare(resume.id); }} className="px-1 text-[11px] text-muted-foreground hover:bg-transparent hover:text-primary">分享</Button>
          <div className="flex-1" />
          <div className="relative" data-menu ref={menuRef}>
            <Button variant="ghost" size="icon-xs" onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }} className="text-muted-foreground/60 hover:text-foreground">
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
            {menuOpen && (
              <div className="absolute right-0 bottom-full z-20 mb-1 w-28 border border-border bg-card py-0.5">
                <MenuItem label="重命名" onClick={() => { setMenuOpen(false); setEditing(true); }} />
                <MenuItem label="删除" danger onClick={() => { setMenuOpen(false); onDelete(resume.id); }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MenuItem({ label, onClick, danger }: { label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`w-full px-3 py-1.5 text-left text-xs transition-colors ${danger ? "text-destructive hover:bg-destructive/10" : "text-muted-foreground hover:bg-muted"}`}>
      {label}
    </button>
  );
}
