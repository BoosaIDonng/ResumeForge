"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Resume } from "@/lib/types";
import { MoreVertical } from "lucide-react";
import { calcCompleteness, parseResumeDataSafe } from "@/lib/completeness";

type Props = {
  resume: Resume;
  index: number;
  onRename: (id: number, newTitle: string) => void;
  onCopy: (id: number) => void;
  onShare: (id: number) => void;
  onDelete: (id: number) => void;
};

const templateLabels: Record<string, string> = {
  default: "默认", modern: "现代", classic: "经典", minimal: "简约",
};

function getTemplateFromData(resumeData: string): string {
  try { return JSON.parse(resumeData)?.metadata?.template || "default"; }
  catch { return "default"; }
}

export default function ResumeListItem({ resume, index, onRename, onCopy, onShare, onDelete }: Props) {
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
  const num = String(index + 1).padStart(2, "0");
  const personName = parsedData?.basics?.name || "";

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

  function handleRowClick(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest("[data-menu]")) return;
    router.push(`/resumes/${resume.id}/edit`);
  }

  return (
    <div
      onClick={handleRowClick}
      className="group flex cursor-pointer items-start gap-3 bg-card px-4 py-3 transition-colors hover:bg-muted/30"
    >
      <span className="w-6 shrink-0 pt-0.5 font-heading text-sm font-bold text-muted-foreground/20 tabular-nums select-none">
        {num}
      </span>

      <div className="min-w-0 flex-1">
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
            className="mb-0.5 w-full border border-border bg-card px-1 py-0.5 text-sm font-semibold text-foreground outline-none focus:border-primary"
          />
        ) : (
          <h3 className="mb-0.5 text-sm font-semibold text-foreground leading-tight" title={resume.title}>
            {resume.title}
          </h3>
        )}
        {personName && (
          <p className="text-[11px] text-muted-foreground">{personName}</p>
        )}
        {/* Progress bar */}
        <div className="mt-1.5 flex items-center gap-2">
          <div className="h-1 flex-1 bg-muted">
            <div className="h-full bg-primary transition-all duration-500" style={{ width: `${completeness}%` }} />
          </div>
          <span className="text-[10px] tabular-nums text-muted-foreground">{completeness}%</span>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        <div className="flex items-center gap-1.5">
          <span className="border border-border px-1 py-0.5 text-[10px] font-medium text-muted-foreground">{label}</span>
          {resume.master && <span className="border border-primary/40 px-1 py-0.5 text-[10px] font-medium text-primary">主版</span>}
        </div>
        <span className="text-[10px] tabular-nums text-muted-foreground">
          {new Date(resume.updatedAt).toLocaleDateString("zh-CN", { month: "short", day: "numeric" })}
        </span>
      </div>

      <div className="relative shrink-0 self-center" data-menu ref={menuRef}>
        <button
          onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
          className="p-2 text-muted-foreground/60 opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100 focus-within:opacity-100"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-full z-20 mt-1 w-28 border border-border bg-card py-0.5">
            <MenuItem label="重命名" onClick={() => { setMenuOpen(false); setEditing(true); }} />
            <MenuItem label="复制" onClick={() => { setMenuOpen(false); onCopy(resume.id); }} />
            <MenuItem label="分享" onClick={() => { setMenuOpen(false); onShare(resume.id); }} />
            <div className="my-0.5 border-t border-border" />
            <MenuItem label="删除" danger onClick={() => { setMenuOpen(false); onDelete(resume.id); }} />
          </div>
        )}
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
