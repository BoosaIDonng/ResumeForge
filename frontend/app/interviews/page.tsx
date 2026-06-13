"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import type { InterviewSession } from "@/lib/types";

export default function InterviewsPage() {
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiGet<InterviewSession[]>("/api/interviews");
        setSessions(data);
      } catch {
        // API might not support listing yet
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const statusLabel: Record<string, string> = {
    CREATED: "待开始",
    IN_PROGRESS: "进行中",
    COMPLETED: "已完成",
  };

  const statusColor: Record<string, string> = {
    CREATED: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
    IN_PROGRESS: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    COMPLETED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">模拟面试</h1>
        <Link
          href="/interviews/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          新建面试
        </Link>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
              <div className="h-4 w-1/3 rounded bg-zinc-200 dark:bg-zinc-700" />
              <div className="mt-2 h-3 w-1/4 rounded bg-zinc-100 dark:bg-zinc-800" />
            </div>
          ))}
        </div>
      )}

      {!loading && sessions.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-zinc-200 p-12 text-center dark:border-zinc-800">
          <svg className="mx-auto h-10 w-10 text-zinc-300 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
          </svg>
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">还没有面试记录</p>
          <Link
            href="/interviews/new"
            className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            创建第一次面试
          </Link>
        </div>
      )}

      {!loading && sessions.length > 0 && (
        <div className="space-y-3">
          {sessions.map((session) => (
            <Link
              key={session.id}
              href={session.status === "COMPLETED" ? `/interviews/${session.id}/report` : `/interviews/${session.id}`}
              className="group flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-5 transition-all hover:border-blue-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-700"
            >
              <div>
                <h3 className="font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {session.role} · {session.level}
                </h3>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {session.type} 面试
                </p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColor[session.status] ?? statusColor.CREATED}`}>
                {statusLabel[session.status] ?? session.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
