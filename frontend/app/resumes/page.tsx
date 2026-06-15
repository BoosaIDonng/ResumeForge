"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { resumeStorage } from "@/lib/storage";
import type { Resume } from "@/lib/types";
import CreateResumeDialog from "@/components/dashboard/CreateResumeDialog";
import { ChevronRight, Plus } from "lucide-react";

function ResumesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTab, setDialogTab] = useState<"template" | "upload" | "ai">("template");

  useEffect(() => { fetchResumes(); }, []);

  const aiParam = searchParams.get("ai") === "true";
  const [aiHandled, setAiHandled] = useState(false);
  if (aiParam && !aiHandled) {
    setAiHandled(true);
    setDialogTab("ai");
    setDialogOpen(true);
  }

  function fetchResumes() {
    try {
      const data = resumeStorage.getAll().map(r => ({
        id: r.id,
        title: r.title,
        resumeData: typeof r.resumeData === 'string' ? r.resumeData : JSON.stringify(r.resumeData),
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }));
      setResumes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }

  function handleCreate() {
    if (!newTitle.trim()) return;
    setCreating(true);
    setError(null);
    try {
      resumeStorage.create(newTitle.trim(), {});
      setNewTitle("");
      fetchResumes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建失败");
    } finally {
      setCreating(false);
    }
  }

  function handleDuplicate(e: React.MouseEvent, id: string) {
    e.preventDefault();
    e.stopPropagation();
    try {
      resumeStorage.duplicate(id);
      fetchResumes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "复制失败");
    }
  }

  function handleCreated(resume: Resume) {
    setResumes((prev) => [resume, ...prev]);
    router.push(`/resumes/${resume.id}/edit`);
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-0">
      {/* Masthead */}
      <div className="border-b-[3px] border-double border-border py-6">
        <p className="text-eyebrow mb-1">全部简历</p>
        <div className="flex items-end justify-between">
          <h1 className="text-display text-foreground">我的简历</h1>
          <span className="font-heading text-2xl font-bold text-muted-foreground/15 tabular-nums">{resumes.length}</span>
        </div>
      </div>

      {/* Create bar */}
      <div className="flex gap-2 border-b border-border py-3">
        <input
          className="flex-1 border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-primary focus:outline-none"
          placeholder="输入新简历标题…"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        />
        <button
          onClick={handleCreate}
          disabled={creating || !newTitle.trim()}
          className="inline-flex items-center gap-1.5 bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          {creating ? "创建中…" : "新建"}
        </button>
        <button
          onClick={() => { setDialogTab("template"); setDialogOpen(true); }}
          className="inline-flex items-center gap-1.5 border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
        >
          更多创建方式
        </button>
      </div>

      {error && (
        <div className="border-b border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>
      )}

      {loading && (
        <div className="grid grid-cols-2 gap-px bg-border lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card p-5 animate-pulse">
              <div className="h-4 w-3/4 bg-muted" />
              <div className="mt-3 h-3 w-1/2 bg-muted/50" />
            </div>
          ))}
        </div>
      )}

      {!loading && resumes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <span className="font-heading text-6xl font-bold text-muted-foreground/20">空</span>
          <p className="mt-2 text-sm text-muted-foreground">在上方输入标题创建第一份简历</p>
        </div>
      )}

      {!loading && resumes.length > 0 && (
        <div className="grid grid-cols-2 gap-px bg-border lg:grid-cols-3">
          {resumes.map((resume, i) => (
            <div key={resume.id} className="group relative bg-card p-5 transition-colors hover:bg-muted/30">
              <Link href={`/resumes/${resume.id}/edit`} className="block">
                <div className="flex items-start gap-3">
                  <span className="font-heading text-2xl font-bold leading-none text-muted-foreground/20 tabular-nums select-none">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-semibold text-foreground group-hover:text-primary truncate transition-colors">
                      {resume.title}
                    </h2>
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      更新于 {new Date(resume.updatedAt).toLocaleDateString("zh-CN")}
                    </p>
                    <div className="mt-2 flex items-center text-[11px] text-primary">
                      <span>点击编辑</span>
                      <ChevronRight className="ml-0.5 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </div>
              </Link>
              <button
                onClick={(e) => handleDuplicate(e, resume.id)}
                className="absolute right-3 top-3 border border-border px-2 py-0.5 text-[11px] text-muted-foreground opacity-0 transition-opacity hover:border-primary/40 hover:text-primary group-hover:opacity-100"
                title="复制简历"
              >
                复制
              </button>
            </div>
          ))}
        </div>
      )}

      <CreateResumeDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={handleCreated}
        initialTab={dialogTab}
      />
    </div>
  );
}

export default function ResumesPage() {
  return (
    <Suspense fallback={null}>
      <ResumesPageContent />
    </Suspense>
  );
}
