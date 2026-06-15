"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiPost, apiGet } from "@/lib/api";
import { TaskProgress } from "@/components/TaskProgress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  const [taskId, setTaskId] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  useEffect(() => {
    apiGet<Resume[]>("/api/resumes").then(setResumes).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const job = await apiPost<Job>("/api/jobs", {
        resumeId: resumeId, title, company, description,
      });
      setJobId(job.id);

      const result = await apiPost<{ taskId: string; status: string }>(
        "/api/analysis/jd-match",
        { resumeId: resumeId, jobId: job.id }
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
      if (task.resultRefId) router.push(`/jobs/${jobId}/analysis?reportId=${task.resultRefId}`);
    } catch {
      setError("获取分析结果失败");
    }
  }

  if (taskId) {
    return (
      <div className="mx-auto max-w-lg px-6 py-12">
        <p className="text-eyebrow mb-1">分析进行中</p>
        <h1 className="text-display-sm mb-6 text-foreground">JD 匹配分析</h1>
        <TaskProgress taskId={taskId} onComplete={handleTaskComplete} />
        <p className="mt-4 text-sm text-muted-foreground">分析完成后将自动跳转到报告页面</p>
      </div>
    );
  }

  const selectClass = "w-full border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-primary focus:outline-none";

  return (
    <div className="mx-auto max-w-lg px-6 py-0">
      <div className="border-b-[3px] border-double border-border py-6">
        <p className="text-eyebrow mb-1">新建分析</p>
        <h1 className="text-display-sm text-foreground">JD 匹配分析</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          粘贴职位描述，AI 将对比简历并生成 ATS 匹配报告
        </p>
      </div>

      {error && (
        <div className="border-b border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="divide-y divide-border">
        <div className="space-y-5 py-5">
          <div>
            <Label className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">选择简历</Label>
            {resumes.length > 0 ? (
              <select value={resumeId} onChange={(e) => setResumeId(e.target.value)} required className={selectClass}>
                <option value="">— 请选择简历 —</option>
                {resumes.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
              </select>
            ) : (
              <Input type="text" value={resumeId} onChange={(e) => setResumeId(e.target.value)} required placeholder="输入简历 ID" />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">职位名称</Label>
              <Input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="高级 Java 工程师" />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">公司名称</Label>
              <Input type="text" value={company} onChange={(e) => setCompany(e.target.value)} required placeholder="字节跳动" />
            </div>
          </div>

          <div>
            <Label className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">职位描述 (JD)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={10}
              className="resize-y min-h-[200px]"
              placeholder="粘贴完整的职位描述…"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">建议粘贴完整 JD 原文以获得最准确的分析</p>
          </div>
        </div>

        <div className="py-4">
          <Button
            type="submit"
            disabled={loading || !resumeId}
            className="w-full"
          >
            {loading ? "提交中…" : "开始分析"}
          </Button>
        </div>
      </form>
    </div>
  );
}
