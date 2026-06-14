"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";
import { getAIHeaders } from "@/lib/ai-settings";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PenLine, Loader2 } from "lucide-react";

type Props = {
  onClose: () => void;
};

export default function GenerateResumeDialog({ onClose }: Props) {
  const router = useRouter();
  const [jobTitle, setJobTitle] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [skills, setSkills] = useState("");
  const [industry, setIndustry] = useState("");
  const [experience, setExperience] = useState("");
  const [language, setLanguage] = useState("zh");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!jobTitle.trim()) return;

    setError("");
    setLoading(true);
    try {
      const headers = getAIHeaders();
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
      const res = await fetch(`${API_BASE}/api/ai/generate-resume`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({
          jobTitle: jobTitle.trim(),
          yearsOfExperience: yearsOfExperience ? Number(yearsOfExperience) : undefined,
          skills: skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          industry: industry.trim() || undefined,
          experience: experience.trim() || undefined,
          language,
        }),
      });
      const body = await res.json();
      if (!res.ok || !body.success) throw new Error(body.message || "生成失败");
      const resumeId = body.data?.id ?? body.data;
      if (resumeId) {
        router.push(`/resumes/${resumeId}/edit`);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-border bg-muted/50 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20";

  return (
    <Dialog open onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] gap-0 overflow-hidden flex flex-col">
        <DialogHeader className="border-b border-border px-5 py-4 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base">
            <PenLine className="size-4" /> AI 生成简历
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              目标职位 <span className="text-destructive">*</span>
            </label>
            <input
              className={inputClass}
              placeholder="如：高级前端工程师"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">工作年限</label>
              <input
                className={inputClass}
                type="number"
                min={0}
                max={50}
                placeholder="如：5"
                value={yearsOfExperience}
                onChange={(e) => setYearsOfExperience(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">行业</label>
              <input
                className={inputClass}
                placeholder="如：互联网/科技"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              技能 (逗号分隔)
            </label>
            <input
              className={inputClass}
              placeholder="如：React, TypeScript, Node.js"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">工作经历简述</label>
            <textarea
              className={`${inputClass} min-h-[80px] resize-y`}
              placeholder="简要描述你的工作经历和成就..."
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">生成语言</label>
            <select className={inputClass} value={language} onChange={(e) => setLanguage(e.target.value)}>
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
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button
              type="submit"
              disabled={!jobTitle.trim() || loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  生成中...
                </span>
              ) : (
                "开始生成"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
