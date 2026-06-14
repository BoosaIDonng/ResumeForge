"use client";

import { useState } from "react";
import { getAIHeaders } from "@/lib/ai-settings";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Target, Loader2 } from "lucide-react";

type AnalysisResult = {
  overallScore: number;
  atsScore: number;
  keywordMatches: string[];
  missingKeywords: string[];
  suggestions: { section: string; current: string; suggested: string }[];
  summary: string;
};

type Props = {
  resumeId?: number;
  resumeData?: string;
  onClose: () => void;
};

export default function JdAnalysisDialog({ resumeId, resumeData, onClose }: Props) {
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);

  async function handleAnalyze() {
    if (!jobDescription.trim()) return;

    setError("");
    setLoading(true);
    setResult(null);
    try {
      const headers = getAIHeaders();
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
      const res = await fetch(`${API_BASE}/api/ai/jd-match`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({
          resumeId,
          resumeData,
          jobDescription: jobDescription.trim(),
        }),
      });
      const body = await res.json();
      if (!res.ok || !body.success) throw new Error(body.message || "分析失败");
      setResult(body.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "分析失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  function scoreColor(score: number) {
    if (score >= 80) return "text-success bg-success/10";
    if (score >= 60) return "text-warning bg-warning/10";
    return "text-destructive bg-destructive/10";
  }

  function scoreBarColor(score: number) {
    if (score >= 80) return "bg-success";
    if (score >= 60) return "bg-warning";
    return "bg-destructive";
  }

  const inputClass =
    "w-full rounded-lg border border-border bg-muted/50 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20";

  return (
    <Dialog open onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] gap-0 overflow-hidden flex flex-col">
        <DialogHeader className="border-b border-border px-5 py-4 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Target className="size-4" /> JD 匹配分析
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              粘贴职位描述 <span className="text-destructive">*</span>
            </label>
            <textarea
              className={`${inputClass} min-h-[120px] resize-y`}
              placeholder="将目标职位的 JD 粘贴到这里..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={!jobDescription.trim() || loading}
            className="w-full"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                分析中...
              </span>
            ) : (
              "开始分析"
            )}
          </Button>

          {error && (
            <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>
          )}

          {result && (
            <div className="space-y-5 pt-2">
              {/* Scores */}
              <div className="flex gap-3">
                <div className={`flex-1 rounded-lg p-4 text-center ${scoreColor(result.overallScore)}`}>
                  <div className="text-2xl font-bold">{result.overallScore}</div>
                  <div className="text-xs font-medium mt-1">综合评分</div>
                </div>
                <div className={`flex-1 rounded-lg p-4 text-center ${scoreColor(result.atsScore)}`}>
                  <div className="text-2xl font-bold">{result.atsScore}</div>
                  <div className="text-xs font-medium mt-1">ATS 评分</div>
                </div>
              </div>

              {/* Score bar */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">匹配度</span>
                  <span className="text-xs font-medium text-foreground">{result.overallScore}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${scoreBarColor(result.overallScore)}`}
                    style={{ width: `${result.overallScore}%` }}
                  />
                </div>
              </div>

              {/* Matched keywords */}
              {result.keywordMatches.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">匹配关键词</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {result.keywordMatches.map((kw, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing keywords */}
              {result.missingKeywords.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">缺失关键词</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {result.missingKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {result.suggestions.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">优化建议</h3>
                  <div className="space-y-3">
                    {result.suggestions.map((s, i) => (
                      <div key={i} className="rounded-lg border border-border p-3">
                        <p className="text-xs font-medium text-muted-foreground mb-2">{s.section}</p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <div>
                            <p className="text-xs text-muted-foreground/70 mb-0.5">当前</p>
                            <p className="text-sm text-foreground bg-destructive/10 rounded px-2 py-1">
                              {s.current}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground/70 mb-0.5">建议</p>
                            <p className="text-sm text-foreground bg-success/10 rounded px-2 py-1">
                              {s.suggested}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary */}
              {result.summary && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">总结</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{result.summary}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
