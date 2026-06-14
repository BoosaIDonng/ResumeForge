"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getAIHeaders } from "@/lib/ai-settings";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Upload } from "lucide-react";

type ParsedData = {
  basics: { name: string; headline: string; email: string; phone: string };
  summary: string;
  experience: { company: string; position: string; period: string; description: string }[];
  education: { school: string; degree: string; period: string }[];
  skills: string[];
};

type Props = {
  onClose: () => void;
};

export default function ParseResumeDialog({ onClose }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [applying, setApplying] = useState(false);

  function handleFileSelect(selected: File | null) {
    if (!selected) return;
    const allowed = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
    ];
    if (!allowed.includes(selected.type)) {
      setError("仅支持 PDF、PNG、JPEG、WebP 格式");
      return;
    }
    if (selected.size > 20 * 1024 * 1024) {
      setError("文件大小不能超过 20MB");
      return;
    }
    setError("");
    setFile(selected);
    setParsedData(null);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    handleFileSelect(dropped);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave() {
    setDragOver(false);
  }

  async function handleParse() {
    if (!file) return;

    setError("");
    setLoading(true);
    setProgress(0);
    setParsedData(null);

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 3, 90));
    }, 200);

    try {
      const headers = getAIHeaders();
      // Remove Content-Type to let browser set multipart boundary
      const { ["Content-Type"]: _, ...aiHeaders } = headers;

      const formData = new FormData();
      formData.append("file", file);

      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
      const res = await fetch(`${API_BASE}/api/ai/parse-resume`, {
        method: "POST",
        headers: aiHeaders,
        body: formData,
      });
      const body = await res.json();
      if (!res.ok || !body.success) throw new Error(body.message || "解析失败");
      setParsedData(body.data);
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "解析失败，请重试");
    } finally {
      clearInterval(progressInterval);
      setLoading(false);
    }
  }

  async function handleApply() {
    if (!parsedData) return;

    setApplying(true);
    try {
      const resumeDataObj = {
        basics: {
          name: parsedData.basics?.name || "",
          headline: parsedData.basics?.headline || "",
          email: parsedData.basics?.email || "",
          phone: parsedData.basics?.phone || "",
          location: "",
          website: "",
        },
        summary: {
          title: "个人总结",
          content: parsedData.summary || "",
          hidden: false,
        },
        sections: {
          profiles: { title: "个人资料", hidden: false, items: [] },
          experience: {
            title: "工作经历",
            hidden: false,
            items: (parsedData.experience || []).map((exp) => ({
              company: exp.company || "",
              position: exp.position || "",
              period: exp.period || "",
              description: exp.description || "",
            })),
          },
          projects: { title: "项目经历", hidden: false, items: [] },
          education: {
            title: "教育经历",
            hidden: false,
            items: (parsedData.education || []).map((edu) => ({
              school: edu.school || "",
              degree: edu.degree || "",
              period: edu.period || "",
            })),
          },
          skills: {
            title: "技能",
            hidden: false,
            items: (parsedData.skills || []).map((skill) => ({
              name: skill,
              keywords: [skill],
            })),
          },
          languages: { title: "语言", hidden: false, items: [] },
          certifications: { title: "证书", hidden: false, items: [] },
          awards: { title: "荣誉奖项", hidden: false, items: [] },
        },
        customSections: [],
        metadata: { template: "default", language: "zh" },
      };

      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
      const res = await fetch(`${API_BASE}/api/resumes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${parsedData.basics?.name || "导入"}的简历`,
          resumeData: JSON.stringify(resumeDataObj),
        }),
      });
      const body = await res.json();
      if (!res.ok || !body.success) throw new Error(body.message || "创建失败");
      const resumeId = body.data?.id ?? body.data;
      if (resumeId) {
        router.push(`/resumes/${resumeId}/edit`);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建简历失败");
    } finally {
      setApplying(false);
    }
  }

  return (
    <Dialog open onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] gap-0 overflow-hidden flex flex-col">
        <DialogHeader className="border-b border-border px-5 py-4 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base">
            <FileText className="size-4" /> AI 解析简历
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 transition-colors ${
              dragOver
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/40 hover:bg-muted/50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
            />
            <Upload className="h-10 w-10 text-muted-foreground/70 mb-3" />
            {file ? (
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">拖拽文件到此处或点击上传</p>
                <p className="text-xs text-muted-foreground/70 mt-1">支持 PDF、PNG、JPEG、WebP (最大 20MB)</p>
              </div>
            )}
          </div>

          {/* Parse button */}
          {file && !parsedData && (
            <Button
              onClick={handleParse}
              disabled={loading}
              className="w-full"
            >
              {loading ? "解析中..." : "开始解析"}
            </Button>
          )}

          {/* Progress */}
          {loading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">解析进度</span>
                <span className="font-medium text-foreground">{progress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>
          )}

          {/* Parsed data preview */}
          {parsedData && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">解析结果预览</h3>

              {/* Basics */}
              {parsedData.basics && (
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-2">基本信息</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {parsedData.basics.name && (
                      <div>
                        <span className="text-muted-foreground/70">姓名：</span>
                        <span className="text-foreground">{parsedData.basics.name}</span>
                      </div>
                    )}
                    {parsedData.basics.headline && (
                      <div>
                        <span className="text-muted-foreground/70">职位：</span>
                        <span className="text-foreground">{parsedData.basics.headline}</span>
                      </div>
                    )}
                    {parsedData.basics.email && (
                      <div>
                        <span className="text-muted-foreground/70">邮箱：</span>
                        <span className="text-foreground">{parsedData.basics.email}</span>
                      </div>
                    )}
                    {parsedData.basics.phone && (
                      <div>
                        <span className="text-muted-foreground/70">电话：</span>
                        <span className="text-foreground">{parsedData.basics.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Summary */}
              {parsedData.summary && (
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">个人总结</p>
                  <p className="text-sm text-muted-foreground">{parsedData.summary}</p>
                </div>
              )}

              {/* Experience */}
              {parsedData.experience?.length > 0 && (
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-2">工作经历 ({parsedData.experience.length})</p>
                  {parsedData.experience.map((exp, i) => (
                    <div key={i} className="mb-2 last:mb-0">
                      <p className="text-sm font-medium text-foreground">
                        {exp.company} - {exp.position}
                      </p>
                      {exp.period && <p className="text-xs text-muted-foreground/70">{exp.period}</p>}
                    </div>
                  ))}
                </div>
              )}

              {/* Education */}
              {parsedData.education?.length > 0 && (
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-2">教育经历 ({parsedData.education.length})</p>
                  {parsedData.education.map((edu, i) => (
                    <div key={i} className="mb-2 last:mb-0">
                      <p className="text-sm font-medium text-foreground">
                        {edu.school} - {edu.degree}
                      </p>
                      {edu.period && <p className="text-xs text-muted-foreground/70">{edu.period}</p>}
                    </div>
                  ))}
                </div>
              )}

              {/* Skills */}
              {parsedData.skills?.length > 0 && (
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-2">技能</p>
                  <div className="flex flex-wrap gap-1.5">
                    {parsedData.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFile(null);
                    setParsedData(null);
                  }}
                >
                  重新上传
                </Button>
                <Button
                  onClick={handleApply}
                  disabled={applying}
                >
                  {applying ? "导入中..." : "导入到编辑器"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
