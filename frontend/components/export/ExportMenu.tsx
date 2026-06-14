"use client";

import { useState } from "react";
import { Download, FileText, Globe, File, Braces, FileType, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ExportDialog from "./ExportDialog";

type Props = {
  resumeId: number;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

const EXPORT_OPTIONS = [
  { format: "pdf", icon: FileText, label: "PDF 下载" },
  { format: "docx", icon: FileType, label: "Word DOCX" },
  { format: "html", icon: Globe, label: "HTML 文件" },
  { format: "txt", icon: File, label: "纯文本 TXT" },
  { format: "json", icon: Braces, label: "JSON 数据" },
] as const;

export default function ExportMenu({ resumeId }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  async function handleExport(format: string) {
    setLoading(format);
    try {
      const res = await fetch(`${API_BASE}/api/resumes/${resumeId}/export?format=${format}`);
      if (!res.ok) throw new Error("导出失败");
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") || "";
      const filenameMatch = disposition.match(/filename="?([^"]+)"?/);
      const filename = filenameMatch?.[1] || `resume.${format}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err instanceof Error ? err.message : "导出失败");
    } finally {
      setLoading(null);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="outline" size="sm" disabled={loading !== null} />
          }
        >
          <Download className="h-4 w-4" />
          {loading ? "导出中..." : "导出"}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {EXPORT_OPTIONS.map((opt) => (
            <DropdownMenuItem
              key={opt.format}
              onClick={() => handleExport(opt.format)}
              disabled={loading !== null}
            >
              <opt.icon className="h-4 w-4" />
              {opt.label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setDialogOpen(true)}>
            <Settings className="h-4 w-4" />
            高级导出...
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ExportDialog
        resumeId={resumeId}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
}
