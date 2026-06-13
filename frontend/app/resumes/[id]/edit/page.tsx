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

  useEffect(() => {
    async function load() {
      try {
        const r = await apiGet<Resume>(`/api/resumes/${id}`);
        setResume(r);
        if (r.resumeData) {
          setData(parseResumeData(r.resumeData));
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load resume");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-gray-500">Loading...</div>;
  }

  if (error || !resume) {
    return <div className="flex items-center justify-center py-20 text-red-500">{error || "Resume not found"}</div>;
  }

  return (
    <div className="flex h-[calc(100vh-2rem)] gap-4 p-4">
      {/* Left: Form */}
      <div className="w-1/2 overflow-y-auto rounded border border-gray-200 bg-white">
        <ResumeForm id={resume.id} title={resume.title} data={data} onChange={setData} />
      </div>
      {/* Right: Preview */}
      <div className="w-1/2 overflow-y-auto rounded border border-gray-200 bg-gray-50 p-4">
        <ResumePreview data={data} />
      </div>
    </div>
  );
}
