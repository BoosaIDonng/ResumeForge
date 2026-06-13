"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiPost, apiGet } from "@/lib/api";
import type { InterviewSession, Resume } from "@/lib/types";
import { TaskProgress } from "@/components/TaskProgress";

const personas = [
  { value: "HR", label: "HR 总监", desc: "考察文化匹配和软技能" },
  { value: "TECHNICAL", label: "技术专家", desc: "深入考察技术细节和实现能力" },
  { value: "ARCHITECTURE", label: "首席架构师", desc: "考察系统设计和架构思维" },
  { value: "LEADERSHIP", label: "技术VP", desc: "考察领导力和全局视野" },
];

export default function NewInterviewPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20 text-zinc-500">加载中...</div>}>
      <NewInterviewForm />
    </Suspense>
  );
}

function NewInterviewForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [resumeId, setResumeId] = useState(searchParams.get("resumeId") ?? "");
  const [jobId, setJobId] = useState(searchParams.get("jobId") ?? "");
  const [role, setRole] = useState("");
  const [level, setLevel] = useState("中级");
  const [type, setType] = useState("技术面");
  const [persona, setPersona] = useState("TECHNICAL");
  const [techStack, setTechStack] = useState("");
  const [questionCount, setQuestionCount] = useState(5);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [taskId, setTaskId] = useState<number | null>(null);

  useEffect(() => {
    apiGet<Resume[]>("/api/resumes").then(setResumes).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await apiPost<{ session: InterviewSession; taskId: number }>(
        "/api/interviews",
        {
          resumeId: Number(resumeId),
          jobId: jobId ? Number(jobId) : null,
          role,
          level,
          type,
          persona,
          techStack,
          questionCount,
        }
      );
      setSession(result.session);
      setTaskId(result.taskId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建面试失败");
    } finally {
      setLoading(false);
    }
  };

  const handleTaskComplete = () => {
    if (session) {
      router.push(`/interviews/${session.id}`);
    }
  };

  if (taskId && session) {
    return (
      <div className="max-w-lg mx-auto py-12 px-4">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
          正在生成面试题目
        </h1>
        <TaskProgress taskId={taskId} onComplete={handleTaskComplete} />
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-4">
          题目生成完成后将自动跳转到面试页面
        </p>
      </div>
    );
  }

  const inputClass = "w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors";
  const labelClass = "block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5";

  return (
    <div className="max-w-lg mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
        创建模拟面试
      </h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">选择面试官人格和参数，AI 将根据简历和 JD 生成针对性问题</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Resume selector */}
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

        {/* Job ID (optional) */}
        <div>
          <label className={labelClass}>职位 ID <span className="text-zinc-400 font-normal">（可选）</span></label>
          <input
            type="text"
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            placeholder="关联已分析的 JD"
            className={inputClass}
          />
        </div>

        {/* Persona grid */}
        <div>
          <label className={labelClass}>面试官人格</label>
          <div className="grid grid-cols-2 gap-2">
            {personas.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPersona(p.value)}
                className={`rounded-lg border p-3 text-left transition-all ${
                  persona === p.value
                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/20 dark:bg-blue-900/20 dark:border-blue-400"
                    : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600"
                }`}
              >
                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{p.label}</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass}>目标角色</label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
            placeholder="例如：Java 后端工程师"
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>级别</label>
            <select value={level} onChange={(e) => setLevel(e.target.value)} className={inputClass}>
              <option value="初级">初级</option>
              <option value="中级">中级</option>
              <option value="高级">高级</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>面试类型</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
              <option value="技术面">技术面</option>
              <option value="HR面">HR面</option>
              <option value="行为面">行为面</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>技术栈</label>
          <input
            type="text"
            value={techStack}
            onChange={(e) => setTechStack(e.target.value)}
            placeholder="例如：Spring Boot, Redis, MySQL"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>题目数量</label>
          <input
            type="number"
            value={questionCount}
            onChange={(e) => setQuestionCount(Number(e.target.value))}
            min={1}
            max={20}
            className={inputClass}
          />
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !resumeId}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "创建中..." : "开始面试"}
        </button>
      </form>
    </div>
  );
}
