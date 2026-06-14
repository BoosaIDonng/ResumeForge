"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, UploadCloud, Plus, LayoutGrid, List } from "lucide-react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import type { Resume } from "@/lib/types";
import ResumeCard from "@/components/dashboard/ResumeCard";
import ResumeListItem from "@/components/dashboard/ResumeListItem";
import CreateResumeDialog from "@/components/dashboard/CreateResumeDialog";
import ImportJsonDialog from "@/components/dashboard/ImportJsonDialog";
import ShareDialog from "@/components/dashboard/ShareDialog";
import TourOverlay from "@/components/dashboard/TourOverlay";
import DocxImportButton from "@/components/ai/DocxImportButton";
import { calcCompleteness, parseResumeDataSafe, getPreviewSummary } from "@/lib/completeness";

type ViewMode = "grid" | "list";
type SortKey = "updatedAt" | "createdAt" | "title-asc" | "title-desc";

const VIEW_KEY = "ai-resume-view-mode";

const sortLabels: Record<SortKey, string> = {
  updatedAt: "最近编辑", createdAt: "创建时间", "title-asc": "名称 A–Z", "title-desc": "名称 Z–A",
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return "夜深了，注意休息";
  if (hour < 12) return "早安，新的一天";
  if (hour < 14) return "午安";
  if (hour < 18) return "下午好";
  return "晚上好";
}

export default function Dashboard() {
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortKey, setSortKey] = useState<SortKey>("updatedAt");

  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [shareResumeId, setShareResumeId] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(VIEW_KEY);
    if (saved === "grid" || saved === "list") setViewMode(saved);
  }, []);

  const loadResumes = useCallback(async () => {
    try {
      setError(null);
      const data = await apiGet<Resume[]>("/api/resumes");
      setResumes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadResumes(); }, [loadResumes]);

  function toggleView(mode: ViewMode) {
    setViewMode(mode);
    localStorage.setItem(VIEW_KEY, mode);
  }

  const sorted = [...resumes].sort((a, b) => {
    switch (sortKey) {
      case "updatedAt": return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      case "createdAt": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "title-asc": return a.title.localeCompare(b.title, "zh-CN");
      case "title-desc": return b.title.localeCompare(a.title, "zh-CN");
    }
  });

  const featured = sorted[0] || null;
  const rest = sorted.slice(1);
  const featuredData = featured ? parseResumeDataSafe(featured.resumeData) : null;
  const featuredCompleteness = featuredData ? calcCompleteness(featuredData) : 0;
  const featuredSummary = featured ? getPreviewSummary(featured.resumeData, 80) : "";

  async function handleRename(id: number, newTitle: string) {
    try {
      const resume = resumes.find((r) => r.id === id);
      if (!resume) return;
      await apiPut(`/api/resumes/${id}`, { title: newTitle, resumeData: resume.resumeData });
      setResumes((prev) => prev.map((r) => (r.id === id ? { ...r, title: newTitle, updatedAt: new Date().toISOString() } : r)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "重命名失败");
    }
  }

  async function handleCopy(id: number) {
    try {
      const copy = await apiPost<Resume>(`/api/resumes/${id}/copy`, {});
      setResumes((prev) => [copy, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "复制失败");
    }
  }

  function handleShare(id: number) { setShareResumeId(id); }

  async function handleDelete(id: number) {
    if (!confirm("确定要删除这份简历吗？此操作不可撤销。")) return;
    try {
      await apiDelete(`/api/resumes/${id}`);
      setResumes((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除失败");
    }
  }

  function handleCreated(resume: Resume) {
    setResumes((prev) => [resume, ...prev]);
    router.push(`/resumes/${resume.id}/edit`);
  }

  function handleImported(resume: Resume) { setResumes((prev) => [resume, ...prev]); }

  return (
    <div className="mx-auto max-w-6xl px-6 py-0">
      {/* Hero */}
      <div className="border-b-[3px] border-double border-border py-6">
        <p className="text-eyebrow mb-2">{getGreeting()}</p>
        <h1 className="text-display leading-[1.05] text-foreground">简历工作台</h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground leading-relaxed drop-cap">
          每份简历都值得被认真对待。选择一份继续编辑，或创建新简历，开始你的求职旅程。
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button data-tour="create" onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-1.5 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover">
            <Plus className="h-4 w-4" /> 新建简历
          </button>
          <button data-tour="ai-generate" onClick={() => router.push("/resumes?ai=true")}
            className="inline-flex items-center gap-1.5 border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted">
            <Sparkles className="h-4 w-4" /> AI 生成
          </button>
          <button data-tour="export" onClick={() => setImportOpen(true)}
            className="inline-flex items-center gap-1.5 border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted">
            <UploadCloud className="h-4 w-4" /> 导入
          </button>
          <DocxImportButton />
        </div>
      </div>

      {/* Pull quote */}
      <div className="border-b border-border py-4">
        <blockquote className="border-l-2 border-primary pl-4 text-sm italic text-muted-foreground">
          "简历是你的第一印象——让它说话。"
        </blockquote>
      </div>

      {/* Error */}
      {error && (
        <div className="border-b border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border py-2">
        <div className="flex items-center gap-3">
          <span className="text-eyebrow">全部简历</span>
          <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="border-none bg-transparent text-xs text-muted-foreground outline-none cursor-pointer">
            {Object.entries(sortLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
        </div>
        <div className="flex items-center divide-x divide-border">
          <button onClick={() => toggleView("grid")} aria-label="网格视图"
            className={`p-2 text-xs transition-colors ${viewMode === "grid" ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}>
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => toggleView("list")} aria-label="列表视图"
            className={`p-2 text-xs transition-colors ${viewMode === "list" ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}>
            <List className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-2 gap-px bg-border lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card p-5 animate-pulse">
              <div className="h-4 w-2/3 bg-muted" />
              <div className="mt-2 h-3 w-1/3 bg-muted/50" />
            </div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <span className="font-heading text-6xl font-bold text-muted-foreground/20">空</span>
          <p className="mt-2 text-sm text-muted-foreground">还没有简历</p>
          <button onClick={() => setCreateOpen(true)}
            className="mt-4 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-colors">
            创建第一份简历
          </button>
        </div>
      ) : (
        <>
          {/* Multi-column: Featured (2/3) + Sidebar (1/3) */}
          <div className="grid grid-cols-1 lg:grid-cols-3" data-tour="templates">
            {/* Featured article — left 2/3 */}
            {featured && (
              <div className="lg:col-span-2 border-r border-border">
                <div
                  onClick={() => router.push(`/resumes/${featured.id}/edit`)}
                  onKeyDown={(e) => { if (e.key === "Enter") router.push(`/resumes/${featured.id}/edit`); }}
                  role="button"
                  tabIndex={0}
                  className="group cursor-pointer bg-card p-6 transition-colors hover:bg-muted/30"
                >
                  <span className="mb-2 block font-heading text-4xl font-bold leading-none text-muted-foreground/10 tabular-nums select-none">
                    01
                  </span>
                  <h2 className="mb-2 font-heading text-2xl font-bold leading-tight text-foreground group-hover:text-primary transition-colors">
                    {featured.title}
                  </h2>
                  {featuredData?.basics?.name && (
                    <p className="text-sm text-muted-foreground mb-2">
                      <span className="font-medium text-foreground">{featuredData.basics.name}</span>
                      {featuredData.basics.headline && <><span className="mx-1">·</span>{featuredData.basics.headline}</>}
                    </p>
                  )}
                  {featuredSummary && (
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 max-w-md">{featuredSummary}</p>
                  )}
                  <div className="mb-4 max-w-xs">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                      <span>完整度</span>
                      <span className="tabular-nums font-medium">{featuredCompleteness}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted">
                      <div className="h-full bg-primary transition-all duration-500" style={{ width: `${featuredCompleteness}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground border-t border-border pt-3">
                    <span className="border border-border px-1.5 py-0.5 font-medium">
                      {(() => { try { return JSON.parse(featured.resumeData)?.metadata?.template || "default"; } catch { return "default"; } })()}
                    </span>
                    {featured.master && <span className="border border-primary/40 text-primary px-1.5 py-0.5 font-medium">主版</span>}
                    <span className="ml-auto tabular-nums">更新于 {new Date(featured.updatedAt).toLocaleDateString("zh-CN", { month: "long", day: "numeric" })}</span>
                  </div>
                </div>

                {/* Grid of rest under featured (on desktop) */}
                {rest.length > 0 && viewMode === "grid" && (
                  <div className="grid grid-cols-2 gap-px bg-border border-t border-border">
                    {rest.map((r, i) => (
                      <ResumeCard key={r.id} resume={r} index={i + 1} onRename={handleRename} onCopy={handleCopy} onShare={handleShare} onDelete={handleDelete} />
                    ))}
                  </div>
                )}
                {rest.length > 0 && viewMode === "list" && (
                  <div className="divide-y divide-border border-t border-border">
                    {rest.map((r, i) => (
                      <ResumeListItem key={r.id} resume={r} index={i + 1} onRename={handleRename} onCopy={handleCopy} onShare={handleShare} onDelete={handleDelete} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Sidebar — right 1/3 */}
            <div className="hidden lg:block">
              <div className="px-4 py-3 border-b border-border">
                <span className="text-eyebrow">近期动态</span>
              </div>
              <div className="divide-y divide-border">
                {sorted.slice(0, 5).map((r, i) => (
                  <div
                    key={r.id}
                    onClick={() => router.push(`/resumes/${r.id}/edit`)}
                    onKeyDown={(e) => { if (e.key === "Enter") router.push(`/resumes/${r.id}/edit`); }}
                    role="button"
                    tabIndex={0}
                    className="cursor-pointer px-4 py-3 transition-colors hover:bg-muted/30"
                  >
                    <div className="flex items-start gap-2">
                      <span className="font-heading text-xs font-bold text-muted-foreground/25 tabular-nums select-none pt-0.5">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate" title={r.title}>{r.title}</p>
                        {parseResumeDataSafe(r.resumeData)?.basics?.name && (
                          <p className="text-[11px] text-muted-foreground truncate" title={parseResumeDataSafe(r.resumeData)!.basics.name}>{parseResumeDataSafe(r.resumeData)!.basics.name}</p>
                        )}
                        <p className="text-[10px] text-muted-foreground mt-0.5 tabular-nums">
                          {new Date(r.updatedAt).toLocaleDateString("zh-CN", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="flex items-center justify-between border-t-[3px] border-double border-border py-3 mt-0">
            <span className="text-xs text-muted-foreground">
              共 <strong className="text-foreground">{resumes.length}</strong> 份简历
            </span>
            <span className="text-xs text-muted-foreground tabular-nums">
              最后编辑: {new Date(sorted[0]?.updatedAt).toLocaleDateString("zh-CN", { month: "long", day: "numeric" })}
            </span>
          </div>
        </>
      )}

      {/* Footer */}
      <footer className="border-t border-border py-4 mt-4">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="tracking-wider uppercase">AI Resume · 简历优化平台</span>
          <span className="tabular-nums">每份简历都值得被认真对待</span>
        </div>
      </footer>

      <CreateResumeDialog open={createOpen} onClose={() => setCreateOpen(false)} onCreate={handleCreated} />
      <ImportJsonDialog open={importOpen} onClose={() => setImportOpen(false)} onImport={handleImported} />
      <ShareDialog open={shareResumeId !== null} resumeId={shareResumeId} onClose={() => setShareResumeId(null)} />
      <TourOverlay />
    </div>
  );
}
