"use client";

import { useState } from "react";
import { getAIHeaders } from "@/lib/ai-settings";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Languages, Check } from "lucide-react";

type Props = {
  resumeId?: string;
  resumeData?: string;
  onClose: () => void;
};

const LANGUAGES = [
  { code: "en", label: "English", short: "EN" },
  { code: "zh", label: "中文", short: "ZH" },
  { code: "ja", label: "日本語", short: "JA" },
  { code: "ko", label: "한국어", short: "KO" },
  { code: "fr", label: "Français", short: "FR" },
  { code: "de", label: "Deutsch", short: "DE" },
  { code: "es", label: "Español", short: "ES" },
  { code: "pt", label: "Português", short: "PT" },
  { code: "ru", label: "Русский", short: "RU" },
  { code: "ar", label: "العربية", short: "AR" },
];

export default function TranslateDialog({ resumeId, resumeData, onClose }: Props) {
  const [targetLang, setTargetLang] = useState("en");
  const [mode, setMode] = useState<"overwrite" | "copy">("copy");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleTranslate() {
    setError("");
    setLoading(true);
    setProgress(0);
    setDone(false);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 5, 90));
    }, 300);

    try {
      const headers = getAIHeaders();
      const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
      const res = await fetch(`${API_BASE}/api/ai/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({
          resumeId,
          resumeData,
          targetLanguage: targetLang,
          mode,
        }),
      });
      const body = await res.json();
      if (!res.ok || !body.success) throw new Error(body.message || "翻译失败");
      setProgress(100);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "翻译失败，请重试");
    } finally {
      clearInterval(progressInterval);
      setLoading(false);
    }
  }

  const hasResult = loading || done;
  const dialogSize = hasResult
    ? "sm:max-w-[640px] w-[95vw]"
    : "sm:max-w-[480px]";

  return (
    <Dialog open onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className={`${dialogSize} max-h-[90vh] gap-0 overflow-hidden flex flex-col`}>
        <DialogHeader className="border-b border-border px-5 py-4 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Languages className="size-4" /> AI 翻译简历
          </DialogTitle>
        </DialogHeader>
        <div className={`flex-1 min-h-0 overflow-y-auto ${hasResult ? "p-5 space-y-4" : "p-4"}`}>
          <div>
            <Label className="mb-1 block text-xs text-muted-foreground">目标语言</Label>
            <div className="grid grid-cols-2 gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setTargetLang(lang.code)}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                    targetLang === lang.code
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-foreground hover:bg-muted/50"
                  }`}
                >
                  <span className="flex h-5 w-7 items-center justify-center rounded bg-muted text-[10px] font-bold tracking-wide text-muted-foreground">{lang.short}</span>
                  <span className="font-medium">{lang.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-1 block text-xs text-muted-foreground">翻译模式</Label>
            <div className="flex gap-2">
              <button
                onClick={() => setMode("overwrite")}
                className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                  mode === "overwrite"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-foreground hover:bg-muted/50"
                }`}
              >
                覆盖当前
              </button>
              <button
                onClick={() => setMode("copy")}
                className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                  mode === "copy"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-foreground hover:bg-muted/50"
                }`}
              >
                创建副本
              </button>
            </div>
          </div>

          {loading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">翻译进度</span>
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

          {error && (
            <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>
          )}

          {done && (
            <div className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2.5 text-sm text-success">
              <Check className="h-4 w-4" />
              翻译完成！{mode === "copy" ? "副本已创建" : "内容已更新"}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose}>
              {done ? "关闭" : "取消"}
            </Button>
            {!done && (
              <Button
                onClick={handleTranslate}
                disabled={loading}
              >
                {loading ? "翻译中..." : "开始翻译"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
