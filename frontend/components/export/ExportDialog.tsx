"use client";

import { useState, useEffect } from "react";
import { Loader2, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { resumeStorage } from "@/lib/storage";
import { getTemplates } from "@/lib/api";

type Template = {
  id: string;
  name: string;
  description: string;
};

type Props = {
  resumeId: string;
  open: boolean;
  onClose: () => void;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export default function ExportDialog({ resumeId, open, onClose }: Props) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [fitOnePage, setFitOnePage] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    getTemplates()
      .then((data) => setTemplates(Array.isArray(data) ? data : []))
      .catch((err) => setError(err instanceof Error ? err.message : "加载模板失败"))
      .finally(() => setLoading(false));
  }, [open]);

  async function handleExport() {
    setExporting(true);
    try {
      // Fetch resume data from localStorage
      const resume = resumeStorage.getById(resumeId);
      if (!resume) throw new Error("简历不存在");

      const res = await fetch(`${API_BASE}/api/resumes/export/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData: typeof resume.resumeData === 'string' ? resume.resumeData : JSON.stringify(resume.resumeData),
          title: resume.title,
          template: selectedTemplate || undefined,
          fitOnePage,
        }),
      });
      if (!res.ok) throw new Error("导出失败");
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") || "";
      const filenameMatch = disposition.match(/filename="?([^"]+)"?/);
      const filename = filenameMatch?.[1] || "resume.pdf";
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(blobUrl);
      onClose();
    } catch (err) {
      alert(err instanceof Error ? err.message : "导出失败");
    } finally {
      setExporting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="h-4 w-4" /> 高级 PDF 导出
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div>
            <Label className="mb-2 block text-xs text-muted-foreground">
              选择模板
            </Label>
            {loading && (
              <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                加载模板中...
              </div>
            )}
            {error && (
              <div className="py-4 text-center text-sm text-destructive">{error}</div>
            )}
            {!loading && !error && (
              <div className="grid grid-cols-2 gap-2">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplate(t.id)}
                    className={`border px-3 py-2.5 text-left transition-colors rounded-lg ${
                      selectedTemplate === t.id
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="mt-0.5 text-xs opacity-70">{t.description}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">
              单页模式
            </Label>
            <button
              role="switch"
              aria-checked={fitOnePage}
              onClick={() => setFitOnePage(!fitOnePage)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                fitOnePage ? "bg-primary" : "bg-input"
              }`}
            >
              <span
                className={`pointer-events-none block h-4 w-4 rounded-full bg-background ring-0 transition-transform ${
                  fitOnePage ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleExport} disabled={exporting || loading}>
            {exporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                导出中...
              </>
            ) : (
              <>
                <FileDown className="h-4 w-4" />
                导出 PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
