"use client";

import { useState } from "react";
import { getAIHeaders } from "@/lib/ai-settings";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Loader2, Check, Copy } from "lucide-react";

type Props = {
  onClose: () => void;
};

export default function CoverLetterDialog({ onClose }: Props) {
  const [jobDescription, setJobDescription] = useState("");
  const [tone, setTone] = useState("formal");
  const [language, setLanguage] = useState("zh");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    if (!jobDescription.trim()) return;

    setError("");
    setLoading(true);
    setCoverLetter("");
    try {
      const headers = getAIHeaders();
      const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
      const res = await fetch(`${API_BASE}/api/ai/generate-cover-letter`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({
          jobDescription: jobDescription.trim(),
          tone,
          language,
        }),
      });
      const body = await res.json();
      if (!res.ok || !body.success) throw new Error(body.message || "生成失败");
      setCoverLetter(body.data?.content ?? body.data ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(coverLetter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const textarea = document.createElement("textarea");
      textarea.value = coverLetter;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const selectClass =
    "w-full border border-border bg-muted/50 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:bg-card focus:outline-none";

  const hasResult = loading || coverLetter.length > 0;
  const dialogSize = hasResult
    ? "sm:max-w-[800px] w-[95vw]"
    : "sm:max-w-[480px]";

  return (
    <Dialog open onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className={`${dialogSize} max-h-[90vh] gap-0 overflow-hidden flex flex-col`}>
        <DialogHeader className="border-b border-border px-5 py-4 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Mail className="size-4" /> AI 生成求职信
          </DialogTitle>
        </DialogHeader>
        <div className={`flex-1 min-h-0 overflow-y-auto ${hasResult ? "p-5 space-y-4" : "p-4"}`}>
          <div>
            <Label className="mb-1 block text-xs text-muted-foreground">
              职位描述 <span className="text-destructive">*</span>
            </Label>
            <Textarea
              className="min-h-[100px] resize-y"
              placeholder="粘贴目标职位的 JD..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1 block text-xs text-muted-foreground">语气风格</Label>
              <select className={selectClass} value={tone} onChange={(e) => setTone(e.target.value)}>
                <option value="formal">正式</option>
                <option value="friendly">友好</option>
                <option value="confident">自信</option>
              </select>
            </div>
            <div>
              <Label className="mb-1 block text-xs text-muted-foreground">语言</Label>
              <select className={selectClass} value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="zh">中文</option>
                <option value="en">English</option>
                <option value="ja">日本語</option>
                <option value="ko">한국어</option>
              </select>
            </div>
          </div>

          <Button
            className="w-full"
            onClick={handleGenerate}
            disabled={!jobDescription.trim() || loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                生成中...
              </span>
            ) : (
              "生成求职信"
            )}
          </Button>

          {error && (
            <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>
          )}

          {coverLetter && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">生成结果</h3>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-success" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      复制
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                className="min-h-[200px] resize-y"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
