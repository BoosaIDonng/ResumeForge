"use client";

import { useState, useEffect, use, useRef } from "react";
import { apiGet } from "@/lib/api";
import type { Resume } from "@/lib/types";
import { parseResumeData, emptyResumeData } from "@/components/resume/resumeData";
import type { ResumeData } from "@/components/resume/resumeData";
import ResumeForm from "@/components/resume/ResumeForm";
import ResumePreview from "@/components/resume/ResumePreview";
import AiToolbar from "@/components/ai/AiToolbar";
import ExportMenu from "@/components/export/ExportMenu";
import EditorSidebar from "@/components/editor/EditorSidebar";
import { ArrowLeft } from "lucide-react";

export default function EditResumePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [resume, setResume] = useState<Resume | null>(null);
  const [data, setData] = useState<ResumeData>(emptyResumeData());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [activeSection, setActiveSection] = useState("basics");
  const formRef = useRef<HTMLDivElement>(null);

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

  function scrollToSection(sectionId: string) {
    setActiveSection(sectionId);
    const el = document.querySelector(`[data-section-id="${sectionId}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse space-y-3 w-full max-w-md">
          <div className="h-4 w-3/4 rounded bg-muted" />
          <div className="h-4 w-1/2 rounded bg-muted" />
          <div className="h-4 w-5/6 rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-destructive mb-4">{error || "简历不存在"}</p>
        <a href="/resumes" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" />
          返回简历列表
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5.5rem)]">
      {/* Desktop header with title + export */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2">
        <h1 className="truncate text-sm font-medium text-muted-foreground" title={resume.title}>{resume.title}</h1>
        <ExportMenu resumeId={resume.id} />
      </div>

      {/* AI Toolbar */}
      <AiToolbar
        resumeId={resume.id}
        resumeData={JSON.stringify(data)}
        onResumeUpdated={async () => {
          // Reload resume from server after AI tool-calling modified it
          try {
            const r = await apiGet<Resume>(`/api/resumes/${resume.id}`);
            if (r.resumeData) {
              setData(parseResumeData(r.resumeData));
            }
          } catch { /* ignore */ }
        }}
        designData={data}
        onDesignChange={setData}
      />

      {/* Mobile tab switcher */}
      <div className="flex lg:hidden border-b border-border bg-card">
        <button
          onClick={() => setActiveTab("edit")}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${activeTab === "edit" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}
        >
          编辑
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${activeTab === "preview" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}
        >
          预览
        </button>
      </div>

      {/* Desktop: three-column layout / Mobile: tabbed */}
      <div className="flex flex-1 min-h-0 gap-0 lg:gap-0">
        {/* Left: Module navigation */}
        <div className={`${activeTab === "edit" ? "flex" : "hidden"} lg:flex`}>
          <EditorSidebar
            data={data}
            activeSection={activeSection}
            onSelect={scrollToSection}
            onReorder={(newOrder: string[]) => {
              setData({ ...data, enabledSections: newOrder });
            }}
            onEnable={(sectionId: string) => {
              if (!data.enabledSections.includes(sectionId)) {
                setData({ ...data, enabledSections: [...data.enabledSections, sectionId] });
              }
            }}
            onDisable={(sectionId: string) => {
              setData({ ...data, enabledSections: data.enabledSections.filter(id => id !== sectionId) });
            }}
          />
        </div>

        {/* Middle: Form */}
        <div
          ref={formRef}
          className={`${activeTab === "edit" ? "flex" : "hidden"} lg:flex flex-1 overflow-y-auto border-0 lg:border-l lg:border-r border-border bg-card`}
        >
          <div className="w-full min-w-0">
            <ResumeForm id={resume.id} title={resume.title} data={data} onChange={setData} />
          </div>
        </div>

        {/* Right: Preview */}
        <div className={`${activeTab === "preview" ? "flex" : "hidden"} lg:flex flex-1 overflow-y-auto bg-muted p-4`}>
          <ResumePreview data={data} />
        </div>
      </div>
    </div>
  );
}
