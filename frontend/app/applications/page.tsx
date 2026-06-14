"use client";

import { useState, useEffect, useCallback } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import type { Application, ApplicationStats } from "@/lib/types";
import { Plus, Trash2, Pencil, ExternalLink, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const STATUSES = ["ALL", "APPLIED", "INTERVIEWING", "OFFER", "REJECTED", "WITHDRAWN"] as const;

const statusLabel: Record<string, string> = {
  APPLIED: "已投递",
  INTERVIEWING: "面试中",
  OFFER: "已录用",
  REJECTED: "已拒绝",
  WITHDRAWN: "已撤回",
};

const statusClass: Record<string, string> = {
  APPLIED: "border-border text-muted-foreground",
  INTERVIEWING: "border-primary/40 text-primary",
  OFFER: "border-success/40 text-success",
  REJECTED: "border-destructive/40 text-destructive",
  WITHDRAWN: "border-muted-foreground/40 text-muted-foreground",
};

type FormData = {
  resumeId: string;
  company: string;
  position: string;
  status: string;
  notes: string;
  url: string;
};

const emptyForm: FormData = { resumeId: "1", company: "", position: "", status: "APPLIED", notes: "", url: "" };

const inputClass =
  "w-full border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-primary focus:outline-none";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchApplications = useCallback(async () => {
    try {
      const data = await apiGet<Application[]>("/api/applications");
      setApplications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载投递记录失败");
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const data = await apiGet<ApplicationStats>("/api/applications/stats");
      setStats(data);
    } catch {
      // stats are non-critical
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchApplications(), fetchStats()]).finally(() => setLoading(false));
  }, [fetchApplications, fetchStats]);

  const filtered = filter === "ALL" ? applications : applications.filter((a) => a.status === filter);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(app: Application) {
    setEditingId(app.id);
    setForm({
      resumeId: String(app.resumeId),
      company: app.company,
      position: app.position,
      status: app.status,
      notes: app.notes ?? "",
      url: app.url ?? "",
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.company.trim() || !form.position.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        resumeId: Number(form.resumeId),
        company: form.company.trim(),
        position: form.position.trim(),
        status: form.status,
        notes: form.notes.trim() || null,
        url: form.url.trim() || null,
      };
      if (editingId !== null) {
        await apiPut(`/api/applications/${editingId}`, payload);
      } else {
        await apiPost("/api/applications", payload);
      }
      setDialogOpen(false);
      await Promise.all([fetchApplications(), fetchStats()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("确定要删除这条投递记录吗？")) return;
    try {
      await apiDelete(`/api/applications/${id}`);
      setApplications((prev) => prev.filter((a) => a.id !== id));
      await fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除失败");
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-0">
      {/* Masthead */}
      <div className="border-b-[3px] border-double border-border py-6">
        <p className="text-eyebrow mb-1">求职跟踪</p>
        <div className="flex items-end justify-between">
          <h1 className="text-display text-foreground">投递记录</h1>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" />
            新增投递
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-3 lg:grid-cols-6">
          <StatCard label="总计" value={stats.total} />
          {STATUSES.filter((s) => s !== "ALL").map((s) => (
            <StatCard key={s} label={statusLabel[s]} value={stats.byStatus[s] ?? 0} />
          ))}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-1 border-b border-border py-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === s
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {s === "ALL" ? "全部" : statusLabel[s]}
          </button>
        ))}
      </div>

      {error && (
        <div className="border-b border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">关闭</button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="divide-y divide-border">
          {[1, 2, 3].map((i) => (
            <div key={i} className="px-4 py-4 animate-pulse">
              <div className="h-4 w-1/3 bg-muted" />
              <div className="mt-2 h-3 w-1/4 bg-muted/50" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <span className="font-heading text-6xl font-bold text-muted-foreground/20">职</span>
          <p className="mt-2 text-sm text-muted-foreground">
            {filter === "ALL" ? "还没有投递记录" : `${statusLabel[filter]}的记录为空`}
          </p>
          {filter === "ALL" && (
            <button
              onClick={openCreate}
              className="mt-4 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              新增第一条投递
            </button>
          )}
        </div>
      )}

      {/* Application list */}
      {!loading && filtered.length > 0 && (
        <div className="divide-y divide-border">
          {filtered.map((app, i) => (
            <div
              key={app.id}
              className="group flex items-center gap-4 bg-card px-4 py-4 transition-colors hover:bg-muted/30"
            >
              {/* Number */}
              <span className="w-6 shrink-0 font-heading text-sm font-bold text-muted-foreground/20 tabular-nums select-none">
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-foreground">{app.position}</h3>
                  <span className={`shrink-0 border px-2 py-0.5 text-[11px] font-medium ${statusClass[app.status] ?? statusClass.APPLIED}`}>
                    {statusLabel[app.status] ?? app.status}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {app.company}
                  <span className="ml-2">· 投递于 {new Date(app.appliedAt).toLocaleDateString("zh-CN")}</span>
                </p>
                {(app.notes || app.url) && (
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground/70">
                    {app.notes && <span className="truncate max-w-xs">{app.notes}</span>}
                    {app.url && (
                      <a
                        href={app.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="h-3 w-3" />
                        链接
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => openEdit(app)}
                  className="p-1.5 text-muted-foreground/40 transition-colors hover:text-primary"
                  title="编辑"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(app.id)}
                  className="p-1.5 text-muted-foreground/40 transition-colors hover:text-destructive"
                  title="删除"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId !== null ? "编辑投递" : "新增投递"}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">简历 ID</label>
              <input
                className={inputClass}
                type="number"
                value={form.resumeId}
                onChange={(e) => setForm((f) => ({ ...f, resumeId: e.target.value }))}
                placeholder="1"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">公司 *</label>
              <input
                className={inputClass}
                value={form.company}
                onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                placeholder="如：字节跳动"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">职位 *</label>
              <input
                className={inputClass}
                value={form.position}
                onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
                placeholder="如：前端工程师"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">状态</label>
              <select
                className={inputClass}
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              >
                {STATUSES.filter((s) => s !== "ALL").map((s) => (
                  <option key={s} value={s}>{statusLabel[s]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">链接</label>
              <input
                className={inputClass}
                value={form.url}
                onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">备注</label>
              <textarea
                className={inputClass + " resize-none"}
                rows={3}
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="可选备注…"
              />
            </div>
          </div>

          <DialogFooter>
            <button
              onClick={() => setDialogOpen(false)}
              className="border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.company.trim() || !form.position.trim()}
              className="bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "保存中…" : editingId !== null ? "更新" : "创建"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-card px-4 py-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="font-heading text-2xl font-bold tabular-nums text-foreground">{value}</p>
    </div>
  );
}
