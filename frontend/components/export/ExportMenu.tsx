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
  resumeId: string;
  resumeData: string;
  title: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

const EXPORT_OPTIONS = [
  { format: "pdf", icon: FileText, label: "PDF 下载" },
  { format: "docx", icon: FileType, label: "Word DOCX" },
  { format: "html", icon: Globe, label: "HTML 文件" },
  { format: "txt", icon: File, label: "纯文本 TXT" },
  { format: "json", icon: Braces, label: "JSON 数据" },
] as const;

export default function ExportMenu({ resumeId, resumeData, title }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  async function handleExport(format: string) {
    setLoading(format);
    try {
      // For PDF/DOCX, send to backend for server-side rendering
      if (format === "pdf" || format === "docx") {
        const res = await fetch(`${API_BASE}/api/resumes/export/${format}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resumeData, title }),
        });
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
      } else {
        // For HTML/TXT/JSON, generate client-side
        let content: string;
        let mimeType: string;
        let extension: string;

        if (format === "json") {
          content = JSON.stringify(JSON.parse(resumeData), null, 2);
          mimeType = "application/json";
          extension = "json";
        } else if (format === "html") {
          content = generateHtml(resumeData, title);
          mimeType = "text/html";
          extension = "html";
        } else {
          content = generatePlainText(resumeData);
          mimeType = "text/plain";
          extension = "txt";
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${title || "resume"}.${extension}`;
        a.click();
        URL.revokeObjectURL(url);
      }
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
        resumeData={resumeData}
        title={title}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
}

// Helper function to generate HTML from resume data
function generateHtml(resumeDataJson: string, title: string): string {
  try {
    const data = JSON.parse(resumeDataJson);
    const basics = data.basics || {};
    const sections = [];

    if (basics.name) sections.push(`<h1>${escapeHtml(basics.name)}</h1>`);
    if (basics.label) sections.push(`<p class="label">${escapeHtml(basics.label)}</p>`);
    if (basics.email) sections.push(`<p>Email: ${escapeHtml(basics.email)}</p>`);
    if (basics.phone) sections.push(`<p>Phone: ${escapeHtml(basics.phone)}</p>`);
    if (basics.summary) sections.push(`<h2>Summary</h2><p>${escapeHtml(basics.summary)}</p>`);

    if (data.work?.length) {
      sections.push("<h2>Work Experience</h2>");
      for (const w of data.work) {
        sections.push(`<h3>${escapeHtml(w.position || "")} at ${escapeHtml(w.company || "")}</h3>`);
        if (w.startDate) sections.push(`<p>${w.startDate} - ${w.endDate || "Present"}</p>`);
        if (w.summary) sections.push(`<p>${escapeHtml(w.summary)}</p>`);
      }
    }

    if (data.education?.length) {
      sections.push("<h2>Education</h2>");
      for (const e of data.education) {
        sections.push(`<h3>${escapeHtml(e.studyType || "")} ${escapeHtml(e.area || "")} - ${escapeHtml(e.institution || "")}</h3>`);
        if (e.startDate) sections.push(`<p>${e.startDate} - ${e.endDate || "Present"}</p>`);
      }
    }

    if (data.skills?.length) {
      sections.push("<h2>Skills</h2>");
      for (const s of data.skills) {
        sections.push(`<p><strong>${escapeHtml(s.name || "")}</strong>: ${(s.keywords || []).map((k: string) => escapeHtml(k)).join(", ")}</p>`);
      }
    }

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; color: #333; line-height: 1.6; }
    h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
    h2 { color: #34495e; margin-top: 30px; }
    h3 { color: #7f8c8d; margin-bottom: 5px; }
    .label { font-size: 1.2em; color: #7f8c8d; }
    p { margin: 5px 0; }
  </style>
</head>
<body>
  ${sections.join("\n  ")}
</body>
</html>`;
  } catch {
    return `<html><body><pre>${resumeDataJson}</pre></body></html>`;
  }
}

// Helper function to generate plain text from resume data
function generatePlainText(resumeDataJson: string): string {
  try {
    const data = JSON.parse(resumeDataJson);
    const lines = [];
    const basics = data.basics || {};

    if (basics.name) lines.push(basics.name);
    if (basics.label) lines.push(basics.label);
    lines.push("");
    if (basics.email) lines.push(`Email: ${basics.email}`);
    if (basics.phone) lines.push(`Phone: ${basics.phone}`);
    if (basics.summary) {
      lines.push("");
      lines.push("SUMMARY");
      lines.push("-------");
      lines.push(basics.summary);
    }

    if (data.work?.length) {
      lines.push("");
      lines.push("WORK EXPERIENCE");
      lines.push("---------------");
      for (const w of data.work) {
        lines.push(`${w.position || ""} at ${w.company || ""}`);
        if (w.startDate) lines.push(`${w.startDate} - ${w.endDate || "Present"}`);
        if (w.summary) lines.push(w.summary);
        lines.push("");
      }
    }

    if (data.education?.length) {
      lines.push("EDUCATION");
      lines.push("---------");
      for (const e of data.education) {
        lines.push(`${e.studyType || ""} ${e.area || ""} - ${e.institution || ""}`);
        if (e.startDate) lines.push(`${e.startDate} - ${e.endDate || "Present"}`);
        lines.push("");
      }
    }

    if (data.skills?.length) {
      lines.push("SKILLS");
      lines.push("------");
      for (const s of data.skills) {
        lines.push(`${s.name || ""}: ${(s.keywords || []).join(", ")}`);
      }
    }

    return lines.join("\n");
  } catch {
    return resumeDataJson;
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
