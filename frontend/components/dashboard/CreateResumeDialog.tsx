"use client";

import { useState, useRef } from "react";
import { apiPost } from "@/lib/api";
import { resumeStorage } from "@/lib/storage";
import { getAIHeaders } from "@/lib/ai-settings";
import type { Resume } from "@/lib/types";
import { emptyResumeData, migrateResumeData, type ResumeData } from "@/components/resume/resumeData";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LayoutTemplate, FileUp, Sparkles, Upload, X, Loader2, FileText } from "lucide-react";

type Tab = "template" | "upload" | "ai";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (resume: Resume) => void;
  initialTab?: Tab;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

const TEMPLATES = [
  { id: "default", name: "默认", color: "bg-primary", desc: "简洁清晰的默认模板" },
  { id: "modern", name: "现代", color: "bg-accent", desc: "时尚现代的设计风格" },
  { id: "classic", name: "经典", color: "bg-success", desc: "传统专业的经典布局" },
  { id: "minimal", name: "简约", color: "bg-muted-foreground", desc: "极简风格突出内容" },
];

const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".doc", ".json"];
const MAX_SIZE = 10 * 1024 * 1024;

const TABS: { key: Tab; label: string; icon: typeof LayoutTemplate }[] = [
  { key: "template", label: "从模板创建", icon: LayoutTemplate },
  { key: "upload", label: "上传文件", icon: FileUp },
  { key: "ai", label: "AI 生成", icon: Sparkles },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function validateResumeJson(raw: unknown): ResumeData | null {
  try {
    if (!raw || typeof raw !== "object") return null;
    const obj = raw as Record<string, unknown>;
    if (!obj.basics && !obj.sections) return null;
    return migrateResumeData(obj);
  } catch {
    return null;
  }
}

export default function CreateResumeDialog({ open, onClose, onCreated, initialTab = "template" }: Props) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tab 1: template
  const [title, setTitle] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("default");

  // Tab 2: upload
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tab 3: AI
  const [jobTitle, setJobTitle] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [skills, setSkills] = useState("");
  const [industry, setIndustry] = useState("");
  const [experience, setExperience] = useState("");
  const [language, setLanguage] = useState("zh");

  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setTab(initialTab);
      setError(null);
    }
  }

  function reset() {
    setTitle("");
    setSelectedTemplate("default");
    setSelectedFile(null);
    setDragOver(false);
    setJobTitle("");
    setYearsOfExperience("");
    setSkills("");
    setIndustry("");
    setExperience("");
    setLanguage("zh");
    setError(null);
    setBusy(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function switchTab(newTab: Tab) {
    setTab(newTab);
    setError(null);
  }

  // === Tab 1: Template create ===
  async function handleTemplateCreate() {
    if (!title.trim()) {
      setError("请输入简历标题");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const data = emptyResumeData();
      data.metadata.template = selectedTemplate;
      const resume = await apiPost<Resume>("/api/resumes", {
        title: title.trim(),
        master: false,
        resumeData: JSON.stringify(data),
      });
      onCreated(resume);
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建失败");
    } finally {
      setBusy(false);
    }
  }

  // === Tab 2: Upload ===
  function handleFileSelect(file: File) {
    setError(null);
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setError("仅支持 PDF、DOCX、DOC、JSON 格式");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("文件大小不能超过 10MB");
      return;
    }
    setSelectedFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    e.target.value = "";
  }

  async function handleUpload() {
    if (!selectedFile) return;
    setBusy(true);
    setError(null);
    const file = selectedFile;
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();

    try {
      if (ext === ".json") {
        const text = await file.text();
        const parsed = JSON.parse(text);
        const data = validateResumeJson(parsed);
        if (!data) {
          setError("JSON 格式不正确，缺少必要的简历字段");
          setBusy(false);
          return;
        }
        const resumeTitle = data.basics.name || file.name.replace(/\.json$/i, "");
        const resume = resumeStorage.create(resumeTitle, JSON.stringify(data));
        onCreated(resume);
      } else {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch(`${API_BASE}/api/ai/import-resume`, {
          method: "POST",
          headers: { ...getAIHeaders() },
          body: formData,
        });
        const json = await res.json();
        if (!res.ok || (!json.success && json.code !== "0")) {
          throw new Error(json.message || "解析失败");
        }
        const result = json.data;
        const resumeDataStr =
          typeof result?.resumeData === "string"
            ? result.resumeData
            : JSON.stringify(result?.resumeData ?? {});
        const resumeTitle = result?.title ?? file.name.replace(/\.[^.]+$/, "");
        const resume = resumeStorage.create(resumeTitle, resumeDataStr);
        onCreated(resume);
      }
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "导入失败");
    } finally {
      setBusy(false);
    }
  }

  // === Tab 3: AI Generate ===
  async function handleAiGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!jobTitle.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/ai/generate-resume`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAIHeaders() },
        body: JSON.stringify({
          jobTitle: jobTitle.trim(),
          yearsOfExperience: yearsOfExperience ? Number(yearsOfExperience) : undefined,
          skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
          industry: industry.trim() || undefined,
          experience: experience.trim() || undefined,
          language,
        }),
      });
      const body = await res.json();
      if (!res.ok || !body.success) throw new Error(body.message || "生成失败");
      const data = body.data;
      const resumeDataStr =
        typeof data?.resumeData === "string"
          ? data.resumeData
          : JSON.stringify(data?.resumeData ?? data);
      const resumeTitle = data?.title ?? `${jobTitle.trim()} 简历`;
      const resume = resumeStorage.create(resumeTitle, resumeDataStr);
      onCreated(resume);
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败，请重试");
    } finally {
      setBusy(false);
    }
  }

  const selectClass =
    "w-full rounded-lg border border-border bg-muted/50 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20";

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] gap-0 overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-5 py-4 border-b border-border shrink-0">
          <DialogTitle>新建简历</DialogTitle>
        </DialogHeader>

        {/* Tab bar */}
        <div className="flex border-b border-border shrink-0">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => switchTab(key)}
              className={`flex flex-1 items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors ${
                tab === key
                  ? "border-b-2 border-primary text-primary"
                  : "border-b-2 border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-5">
          {/* Tab 1: Template */}
          {tab === "template" && (
            <div className="space-y-4">
              <div>
                <Label className="block text-muted-foreground">简历标题</Label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例如：前端工程师简历"
                  className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  onKeyDown={(e) => { if (e.key === "Enter") handleTemplateCreate(); }}
                />
              </div>
              <div>
                <Label className="block text-muted-foreground">选择模板</Label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTemplate(t.id)}
                      className={`flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all ${
                        selectedTemplate === t.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <div className={`h-16 w-full rounded ${t.color} opacity-80`} />
                      <span className="text-sm font-medium text-foreground">{t.name}</span>
                      <span className="text-xs text-muted-foreground">{t.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
              {error && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={handleClose}>取消</Button>
                <Button onClick={handleTemplateCreate} disabled={busy}>
                  {busy ? "创建中..." : "创建"}
                </Button>
              </div>
            </div>
          )}

          {/* Tab 2: Upload */}
          {tab === "upload" && (
            <div className="space-y-4">
              {!selectedFile ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-10 text-center cursor-pointer transition-colors ${
                    dragOver
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/40 hover:bg-muted/30"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.doc,.json"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  <Upload className="h-10 w-10 text-muted-foreground/70" />
                  <p className="mt-3 text-sm font-medium text-foreground">拖拽文件到此处，或</p>
                  <span className="mt-2 inline-block rounded-lg bg-muted px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/80">
                    浏览文件
                  </span>
                  <p className="mt-3 text-xs text-muted-foreground">支持 PDF、DOCX、DOC、JSON（最大 10MB）</p>
                </div>
              ) : (
                <div className="rounded-lg border-2 border-success/40 bg-success/5 p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 shrink-0 text-success" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                    </div>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="text-muted-foreground transition-colors hover:text-destructive"
                      title="移除文件"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
              {error && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>
              )}
              {selectedFile && (
                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="outline" onClick={handleClose}>取消</Button>
                  <Button onClick={handleUpload} disabled={busy}>
                    {busy ? (
                      <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> 解析中...</span>
                    ) : (
                      "导入"
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: AI Generate */}
          {tab === "ai" && (
            <form onSubmit={handleAiGenerate} className="space-y-4">
              <div>
                <Label className="mb-1 block text-xs text-muted-foreground">
                  目标职位 <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="如：高级前端工程师"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="mb-1 block text-xs text-muted-foreground">工作年限</Label>
                  <Input
                    type="number"
                    min={0}
                    max={50}
                    placeholder="如：5"
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="mb-1 block text-xs text-muted-foreground">行业</Label>
                  <Input
                    placeholder="如：互联网/科技"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label className="mb-1 block text-xs text-muted-foreground">技能 (逗号分隔)</Label>
                <Input
                  placeholder="如：React, TypeScript, Node.js"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                />
              </div>
              <div>
                <Label className="mb-1 block text-xs text-muted-foreground">工作经历简述</Label>
                <Textarea
                  className="min-h-[80px] resize-y"
                  placeholder="简要描述你的工作经历和成就..."
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                />
              </div>
              <div>
                <Label className="mb-1 block text-xs text-muted-foreground">生成语言</Label>
                <select className={selectClass} value={language} onChange={(e) => setLanguage(e.target.value)}>
                  <option value="zh">中文</option>
                  <option value="en">English</option>
                  <option value="ja">日本語</option>
                  <option value="ko">한국어</option>
                </select>
              </div>
              {error && (
                <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={handleClose}>取消</Button>
                <Button type="submit" disabled={!jobTitle.trim() || busy}>
                  {busy ? (
                    <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> 生成中...</span>
                  ) : (
                    "开始生成"
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
