"use client";

import { useState, useCallback } from "react";
import { apiPost, apiPut } from "@/lib/api";
import type { Resume } from "@/lib/types";
import type { ResumeData } from "@/components/resume/resumeData";
import { migrateResumeData } from "@/components/resume/resumeData";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onImport: (resume: Resume) => void;
};

type PreviewInfo = {
  title: string;
  sectionCount: number;
  data: ResumeData;
};

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

function countSections(data: ResumeData): number {
  let count = 0;
  if (data.summary.content) count++;
  for (const section of Object.values(data.sections)) {
    if (section.items.length > 0) count++;
  }
  count += data.customSections.length;
  return count;
}

export default function ImportJsonDialog({ open, onClose, onImport }: Props) {
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<PreviewInfo | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawData, setRawData] = useState<ResumeData | null>(null);

  if (!open) return null;

  function reset() {
    setPreview(null);
    setError(null);
    setRawData(null);
    setDragging(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function processFile(file: File) {
    setError(null);
    if (!file.name.endsWith(".json")) {
      setError("请上传 .json 格式的文件");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        const data = validateResumeJson(parsed);
        if (!data) {
          setError("JSON 格式不正确，缺少必要的简历字段");
          return;
        }
        setRawData(data);
        setPreview({
          title: data.basics.name || file.name.replace(".json", ""),
          sectionCount: countSections(data),
          data,
        });
      } catch {
        setError("无法解析 JSON 文件");
      }
    };
    reader.readAsText(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragLeave() {
    setDragging(false);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  async function handleImport() {
    if (!rawData || !preview) return;
    setImporting(true);
    setError(null);
    try {
      const resume = await apiPost<Resume>("/api/resumes", {
        title: preview.title,
        master: false,
      });
      await apiPut<Resume>(`/api/resumes/${resume.id}`, {
        title: preview.title,
        resumeData: JSON.stringify(rawData),
      });
      onImport(resume);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "导入失败");
    } finally {
      setImporting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>导入 JSON</DialogTitle>
        </DialogHeader>

        {!preview ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
              dragging
                ? "border-primary bg-primary/10"
                : "border-border"
            }`}
          >
            <Upload className="h-10 w-10 text-muted-foreground/70" />
            <p className="mt-3 text-sm text-muted-foreground">
              拖拽 JSON 文件到此处
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              或者
            </p>
            <label className="mt-2 cursor-pointer rounded-lg bg-muted px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/80">
              选择文件
              <input
                type="file"
                accept=".json"
                onChange={handleFileInput}
                className="hidden"
              />
            </label>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <h3 className="text-sm font-medium text-foreground">文件预览</h3>
            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
              <p>标题：<span className="font-medium text-foreground">{preview.title}</span></p>
              <p>段落数：<span className="font-medium text-foreground">{preview.sectionCount}</span></p>
            </div>
            <button
              onClick={reset}
              className="mt-3 text-xs text-primary hover:underline"
            >
              重新选择文件
            </button>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            取消
          </Button>
          <Button
            onClick={handleImport}
            disabled={!preview || importing}
          >
            {importing ? "导入中..." : "导入"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
