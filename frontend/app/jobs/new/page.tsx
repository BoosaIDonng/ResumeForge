"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiPost, apiGet } from "@/lib/api";
import { TaskProgress } from "@/components/TaskProgress";
import type { Job, AiTask, Resume } from "@/lib/types";

export default function NewJobPage() {
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [resumeId, setResumeId] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<number | null>(null);
  const [jobId, setJobId] = useState<number | null>(null);

  useEffect(() => {
    apiGet<Resume[]>("/api/resumes").then(setResumes).catch(() => {});
  }, []);

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
      <div className="mx-auto max-w-lg px-4 py-12">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
          JD 分析中
        </h1>
        <TaskProgress taskId={taskId} onComplete={handleTaskComplete} />
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-4">
          分析完成后将自动跳转到报告页面
        </p>
      </div>
    );
  }

  const inputClass = "w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors";
  const labelClass = "block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5";

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
        新建 JD 分析
      </h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">粘贴职位描述，AI 将对比简历并生成 ATS 匹配报告</p>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className={labelClass}>选择简历</label>
          {resumes.length > 0 ? (
            <select
              value={resumeId}
              onChange={(e) => setResumeId(e.target.value)}
              required
              className={inputClass}
            >
              <option value="">— 请选择简历 —</option>
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>{r.title}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={resumeId}
              onChange={(e) => setResumeId(e.target.value)}
              required
              placeholder="输入简历 ID"
              className={inputClass}
            />
          )}
        </div>

        <div>
          <label className={labelClass}>职位名称</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className={inputClass}
            placeholder="例如：高级 Java 工程师"
          />
        </div>

        <div>
          <label className={labelClass}>公司名称</label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
            className={inputClass}
            placeholder="例如：字节跳动"
          />
        </div>

        <div>
          <label className={labelClass}>职位描述 (JD)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={10}
            className={`${inputClass} resize-y min-h-[200px]`}
            placeholder="粘贴完整的职位描述..."
          />
          <p className="mt-1 text-xs text-zinc-400">建议粘贴完整的 JD 原文以获得最准确的分析结果</p>
        </div>

        <button
          type="submit"
          disabled={loading || !resumeId}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "提交中..." : "开始分析"}
        </button>
      </form>
    </div>
  );
}
