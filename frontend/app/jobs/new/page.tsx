"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost, apiGet } from "@/lib/api";
import { TaskProgress } from "@/components/TaskProgress";
import type { Job, AiTask } from "@/lib/types";

export default function NewJobPage() {
  const router = useRouter();
  const [resumeId, setResumeId] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<number | null>(null);
  const [jobId, setJobId] = useState<number | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const job = await apiPost<Job>("/api/jobs", {
        resumeId: Number(resumeId),
        title,
        company,
        description,
      });
      setJobId(job.id);

      const result = await apiPost<{ taskId: number; status: string }>(
        "/api/analysis/jd-match",
        { resumeId: Number(resumeId), jobId: job.id }
      );
      setTaskId(result.taskId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "提交失败");
    } finally {
      setLoading(false);
    }
  }

  async function handleTaskComplete() {
    if (!taskId || !jobId) return;
    try {
      const task = await apiGet<AiTask>(`/api/tasks/${taskId}`);
      if (task.resultRefId) {
        router.push(`/jobs/${jobId}/analysis?reportId=${task.resultRefId}`);
      }
    } catch {
      setError("获取分析结果失败");
    }
  }

  if (taskId) {
    return (
      <div className="mx-auto max-w-xl p-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
          JD 分析中
        </h1>
        <TaskProgress taskId={taskId} onComplete={handleTaskComplete} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
        新建 JD 分析
      </h1>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="resumeId" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            简历 ID
          </label>
          <input
            id="resumeId"
            type="text"
            value={resumeId}
            onChange={(e) => setResumeId(e.target.value)}
            required
            className="w-full rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="输入简历 ID"
          />
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            职位名称
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="例如：前端工程师"
          />
        </div>

        <div>
          <label htmlFor="company" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            公司名称
          </label>
          <input
            id="company"
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
            className="w-full rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="例如：字节跳动"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            职位描述 (JD)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={8}
            className="w-full rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            placeholder="粘贴职位描述..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "提交中..." : "开始分析"}
        </button>
      </form>
    </div>
  );
}
