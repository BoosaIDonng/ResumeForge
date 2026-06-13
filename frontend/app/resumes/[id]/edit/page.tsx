"use client";

import { useState, useEffect, use } from "react";
import { apiGet } from "@/lib/api";
import type { Resume } from "@/lib/types";
import { parseResumeData, emptyResumeData } from "@/components/resume/resumeData";
import type { ResumeData } from "@/components/resume/resumeData";
import ResumeForm from "@/components/resume/ResumeForm";
import ResumePreview from "@/components/resume/ResumePreview";

export default function EditResumePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [resume, setResume] = useState<Resume | null>(null);
  const [data, setData] = useState<ResumeData>(emptyResumeData());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  useEffect(() => {
    async function load() {
      try {
        const r = await apiGet<Resume>(`/api/resumes/${id}`);
        setResume(r);
        if (r.resumeData) {
          setData(parseResumeData(r.resumeData));
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "加载简历失败");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse space-y-3 w-full max-w-md">
          <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-4 w-1/2 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-4 w-5/6 rounded bg-zinc-200 dark:bg-zinc-700" />
        </div>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-red-500 mb-4">{error || "简历不存在"}</p>
        <a href="/resumes" className="text-sm text-blue-600 hover:underline">← 返回简历列表</a>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Mobile tab switcher */}
      <div className="flex lg:hidden border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <button
          onClick={() => setActiveTab("edit")}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${activeTab === "edit" ? "text-blue-600 border-b-2 border-blue-600" : "text-zinc-500"}`}
        >
          编辑
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${activeTab === "preview" ? "text-blue-600 border-b-2 border-blue-600" : "text-zinc-500"}`}
        >
          预览
        </button>
      </div>

      {/* Desktop: side by side / Mobile: tabbed */}
      <div className="flex flex-1 min-h-0 gap-0 lg:gap-4 lg:p-4">
        {/* Left: Form */}
        <div className={`${activeTab === "edit" ? "flex" : "hidden"} lg:flex w-full lg:w-1/2 overflow-y-auto rounded-none lg:rounded-xl border-0 lg:border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900`}>
          <ResumeForm id={resume.id} title={resume.title} data={data} onChange={setData} />
        </div>
        {/* Right: Preview */}
        <div className={`${activeTab === "preview" ? "flex" : "hidden"} lg:flex w-full lg:w-1/2 overflow-y-auto rounded-none lg:rounded-xl border-0 lg:border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950`}>
          <ResumePreview data={data} />
        </div>
      </div>
    </div>
  );
}
