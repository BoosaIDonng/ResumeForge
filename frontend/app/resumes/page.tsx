"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiGet, apiPost } from "@/lib/api";
import type { Resume } from "@/lib/types";

export default function ResumesPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResumes();
  }, []);

  async function fetchResumes() {
    try {
      const data = await apiGet<Resume[]>("/api/resumes");
      setResumes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!newTitle.trim()) return;
    setCreating(true);
    setError(null);
    try {
      await apiPost<Resume>("/api/resumes", { title: newTitle.trim(), master: true });
      setNewTitle("");
      await fetchResumes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建失败");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">我的简历</h1>
        <span className="text-sm text-zinc-500">{resumes.length} 份简历</span>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Create form */}
      <div className="mb-8 flex gap-3">
        <input
          className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          placeholder="输入新简历标题..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        />
        <button
          onClick={handleCreate}
          disabled={creating || !newTitle.trim()}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {creating ? "创建中..." : "新建简历"}
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
              <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-700" />
              <div className="mt-3 h-3 w-1/2 rounded bg-zinc-100 dark:bg-zinc-800" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && resumes.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-zinc-200 p-12 text-center dark:border-zinc-800">
          <svg className="mx-auto h-10 w-10 text-zinc-300 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">还没有简历，在上方输入标题创建第一份</p>
        </div>
      )}

      {/* Resume grid */}
      {!loading && resumes.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume) => (
            <Link
              key={resume.id}
              href={`/resumes/${resume.id}/edit`}
              className="group rounded-xl border border-zinc-200 bg-white p-5 transition-all hover:border-blue-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-700"
            >
              <div className="flex items-start justify-between">
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate transition-colors">
                  {resume.title}
                </h2>
                {resume.master && (
                  <span className="shrink-0 ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    主版
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                更新于 {new Date(resume.updatedAt).toLocaleDateString("zh-CN")}
              </p>
              <div className="mt-3 flex items-center text-xs text-zinc-400 dark:text-zinc-500">
                <span>点击编辑</span>
                <svg className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
