"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiGet, apiDelete } from "@/lib/api";
import type { InterviewSession } from "@/lib/types";
import { Plus, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";

export default function InterviewsPage() {
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      try {
        const data = await apiGet<InterviewSession[]>("/api/interviews");
        setSessions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "加载面试列表失败");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const statusLabel: Record<string, string> = { CREATED: "待开始", IN_PROGRESS: "进行中", COMPLETED: "已完成" };
  const statusClass: Record<string, string> = {
    CREATED: "border-border text-muted-foreground",
    IN_PROGRESS: "border-primary/40 text-primary",
    COMPLETED: "border-success/40 text-success",
  };

  const allSelected = sessions.length > 0 && selected.size === sessions.length;

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(sessions.map((s) => s.id)));
    }
  }

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("确定要删除这条面试记录吗？此操作不可撤销。")) return;
    try {
      await apiDelete(`/api/interviews/${id}`);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      setSelected((prev) => { const next = new Set(prev); next.delete(id); return next; });
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除失败");
    }
  }

  async function handleDeleteSelected() {
    const count = selected.size;
    if (count === 0) return;
    if (!confirm(`确定要删除选中的 ${count} 条面试记录吗？此操作不可撤销。`)) return;
    const ids = Array.from(selected);
    try {
      await Promise.all(ids.map((id) => apiDelete(`/api/interviews/${id}`)));
      setSessions((prev) => prev.filter((s) => !selected.has(s.id)));
      setSelected(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : "批量删除失败");
    }
  }

  async function handleDeleteAll() {
    if (sessions.length === 0) return;
    if (!confirm(`确定要删除全部 ${sessions.length} 条面试记录吗？此操作不可撤销。`)) return;
    try {
      await Promise.all(sessions.map((s) => apiDelete(`/api/interviews/${s.id}`)));
      setSessions([]);
      setSelected(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除全部失败");
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-0">
      <div className="border-b-[3px] border-double border-border py-6">
        <p className="text-eyebrow mb-1">模拟面试</p>
        <div className="flex items-end justify-between">
          <h1 className="text-display text-foreground">面试记录</h1>
          <Link
            href="/interviews/new"
            className="inline-flex items-center gap-1.5 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" />
            新建面试
          </Link>
        </div>
      </div>

      {error && (
        <div className="border-b border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>
      )}

      {/* Toolbar — select all + batch actions */}
      {!loading && sessions.length > 0 && (
        <div className="flex items-center justify-between border-b border-border py-2">
          <Label className="text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleSelectAll}
              className="h-4 w-4 accent-primary"
            />
            全选
            {selected.size > 0 && (
              <span className="text-xs text-muted-foreground">（已选 {selected.size} 项）</span>
            )}
          </Label>
          <div className="flex items-center gap-2">
            {selected.size > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="inline-flex items-center gap-1 text-xs text-destructive hover:text-destructive/80 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                删除选中 ({selected.size})
              </button>
            )}
            <button
              onClick={handleDeleteAll}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              删除全部
            </button>
          </div>
        </div>
      )}

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

      {!loading && sessions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <span className="font-heading text-6xl font-bold text-muted-foreground/20">面</span>
          <p className="mt-2 text-sm text-muted-foreground">还没有面试记录</p>
          <Link
            href="/interviews/new"
            className="mt-4 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            创建第一次面试
          </Link>
        </div>
      )}

      {!loading && sessions.length > 0 && (
        <div className="divide-y divide-border">
          {sessions.map((session, i) => (
            <div
              key={session.id}
              className={`group flex items-center gap-3 bg-card px-4 py-4 transition-colors hover:bg-muted/30 ${selected.has(session.id) ? "bg-muted/40" : ""}`}
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={selected.has(session.id)}
                onChange={() => toggleSelect(session.id)}
                onClick={(e) => e.stopPropagation()}
                className="h-4 w-4 shrink-0 accent-primary"
              />

              {/* Number */}
              <span className="w-6 shrink-0 font-heading text-sm font-bold text-muted-foreground/20 tabular-nums select-none">
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* Content — clickable */}
              <Link
                href={session.status === "COMPLETED" ? `/interviews/${session.id}/report` : `/interviews/${session.id}`}
                className="min-w-0 flex-1"
              >
                <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  {session.role} · {session.level}
                </h3>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {session.type} 面试
                  {session.questionCount > 0 && <span className="ml-1">· {session.questionCount} 题</span>}
                </p>
                {session.techStack && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {session.techStack.split(",").map((t) => t.trim()).filter(Boolean).map((tech) => (
                      <span key={tech} className="border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </Link>

              {/* Status badge */}
              <span className={`shrink-0 border px-2 py-0.5 text-[11px] font-medium ${statusClass[session.status] ?? statusClass.CREATED}`}>
                {statusLabel[session.status] ?? session.status}
              </span>

              {/* Delete button */}
              <button
                onClick={(e) => handleDelete(e, session.id)}
                className="shrink-0 p-1.5 text-muted-foreground/40 opacity-0 transition-all hover:text-destructive group-hover:opacity-100"
                title="删除"
                aria-label="删除面试记录"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
