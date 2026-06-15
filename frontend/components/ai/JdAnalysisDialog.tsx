"use client";

import { useState } from "react";
import { getAIHeaders } from "@/lib/ai-settings";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Target, Loader2, Lightbulb, Building2, Briefcase, BarChart3, Wand2 } from "lucide-react";

type AnalysisResult = {
  overallScore: number;
  atsScore: number;
  keywordMatches: string[];
  missingKeywords: string[];
  jdKeywords?: {
    company: string;
    role: string;
    seniorityLevel: string;
    experienceYears: number;
  };
  requiredSkillsMatched?: string[];
  requiredSkillsMissing?: string[];
  preferredSkillsMatched?: string[];
  preferredSkillsMissing?: string[];
  keywordMatchPercentage?: number;
  potentialMatchPercentage?: number;
  suggestions: { section: string; current: string; suggested: string; reason?: string }[];
  summary: string;
};

type Props = {
  resumeId?: string;
  resumeData?: string;
  onClose: () => void;
  onSendToChat?: (message: string) => void;
};

export default function JdAnalysisDialog({ resumeId, resumeData, onClose, onSendToChat }: Props) {
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAnalyze() {
    if (!jobDescription.trim()) return;
    if (!resumeData) {
      setError("缺少简历数据，无法分析");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
      const res = await fetch(`${API_BASE}/api/ai/jd-match`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAIHeaders() },
        body: JSON.stringify({ resumeText: resumeData, jobDescription: jobDescription.trim() }),
      });
      const body = await res.json();
      if (!res.ok || !body.success) throw new Error(body.message || "分析失败");
      const r = body.data;
      const parsed: AnalysisResult = {
        overallScore: r.overallScore,
        atsScore: r.atsScore,
        keywordMatches: Array.isArray(r.keywordMatches) ? r.keywordMatches : [],
        missingKeywords: Array.isArray(r.missingKeywords) ? r.missingKeywords : [],
        jdKeywords: r.jdKeywords,
        requiredSkillsMatched: r.requiredSkillsMatched,
        requiredSkillsMissing: r.requiredSkillsMissing,
        preferredSkillsMatched: r.preferredSkillsMatched,
        preferredSkillsMissing: r.preferredSkillsMissing,
        keywordMatchPercentage: r.keywordMatchPercentage,
        potentialMatchPercentage: r.potentialMatchPercentage,
        suggestions: Array.isArray(r.suggestions) ? r.suggestions : [],
        summary: r.summary,
      };
      setResult(parsed);
    } catch (e) {
      setError(e instanceof Error ? e.message : "分析失败");
    } finally {
      setLoading(false);
    }
  }

  function handleOptimize() {
    if (!result || !onSendToChat) return;
    const parts: string[] = [];

    const allMissing = [
      ...(result.requiredSkillsMissing ?? []),
      ...(result.preferredSkillsMissing ?? []),
      ...result.missingKeywords.filter(
        (kw) => !(result.requiredSkillsMissing ?? []).includes(kw) && !(result.preferredSkillsMissing ?? []).includes(kw)
      ),
    ];
    if (allMissing.length > 0) {
      parts.push(`缺失关键词：${allMissing.join("、")}`);
    }

    if (result.suggestions.length > 0) {
      const list = result.suggestions
        .map((s, i) => `${i + 1}. [${s.section}] "${s.current}" → "${s.suggested}"`)
        .join("\n");
      parts.push(`优化建议：\n${list}`);
    }

    if (parts.length === 0) return;

    const message = `请根据以下 JD 匹配分析结果优化简历，将缺失关键词融入相关栏目，并按建议修改内容：\n\n${parts.join("\n\n")}\n\n请使用工具直接修改对应的简历模块内容。`;
    onClose();
    setTimeout(() => onSendToChat(message), 300);
  }

  function scoreColor(score: number) {
    if (score >= 80) return "text-success bg-success/10";
    if (score >= 60) return "text-warning bg-warning/10";
    return "text-destructive bg-destructive/10";
  }

  const hasResult = result !== null || loading;
  const dialogSize = hasResult
    ? "sm:max-w-[1000px] w-[95vw]"
    : "sm:max-w-[480px]";

  return (
    <Dialog open onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className={`${dialogSize} max-h-[90vh] gap-0 overflow-hidden flex flex-col`}>
        <DialogHeader className="border-b border-border px-5 py-4 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Target className="size-4" /> JD 匹配分析
          </DialogTitle>
        </DialogHeader>
        <div className={`flex-1 min-h-0 overflow-y-auto ${hasResult ? "p-5 space-y-4" : "p-4"}`}>
          <div>
            <Label className="mb-1 block text-xs text-muted-foreground">
              粘贴职位描述 <span className="text-destructive">*</span>
            </Label>
            <Textarea
              className="min-h-[100px] resize-y"
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

          {loading && (
            <div className="flex flex-col items-center gap-3 py-4">
              <p className="text-sm text-muted-foreground">正在分析 JD 匹配度...</p>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
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

              {/* JD Metadata */}
              {result.jdKeywords && (
                <div className="rounded-lg border border-border p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                    <BarChart3 className="size-3.5" /> JD 关键信息
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 rounded border border-border bg-muted/30 px-3 py-2">
                      <Building2 className="size-3.5 text-muted-foreground" />
                      <div>
                        <p className="text-[10px] text-muted-foreground">公司</p>
                        <p className="text-sm font-medium text-foreground">{result.jdKeywords.company}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded border border-border bg-muted/30 px-3 py-2">
                      <Briefcase className="size-3.5 text-muted-foreground" />
                      <div>
                        <p className="text-[10px] text-muted-foreground">职位</p>
                        <p className="text-sm font-medium text-foreground">{result.jdKeywords.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded border border-border bg-muted/30 px-3 py-2">
                      <Target className="size-3.5 text-muted-foreground" />
                      <div>
                        <p className="text-[10px] text-muted-foreground">级别</p>
                        <p className="text-sm font-medium text-foreground">{result.jdKeywords.seniorityLevel}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded border border-border bg-muted/30 px-3 py-2">
                      <BarChart3 className="size-3.5 text-muted-foreground" />
                      <div>
                        <p className="text-[10px] text-muted-foreground">经验要求</p>
                        <p className="text-sm font-medium text-foreground">{result.jdKeywords.experienceYears} 年</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Score bars */}
              <div className="space-y-2.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">关键词匹配率</span>
                    <span className="text-xs font-medium text-foreground">
                      {result.keywordMatchPercentage ?? result.overallScore}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all duration-500 bg-primary`}
                      style={{ width: `${result.keywordMatchPercentage ?? result.overallScore}%` }}
                    />
                  </div>
                </div>
                {result.potentialMatchPercentage != null && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">
                        潜在匹配 <span className="text-[10px] text-accent-foreground/60">(可注入)</span>
                      </span>
                      <span className="text-xs font-medium text-foreground">
                        {result.potentialMatchPercentage}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full transition-all duration-500 bg-accent"
                        style={{ width: `${result.potentialMatchPercentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Structured keywords */}
              {(result.requiredSkillsMatched?.length ||
                result.requiredSkillsMissing?.length ||
                result.preferredSkillsMatched?.length ||
                result.preferredSkillsMissing?.length) ? (
                <div className="space-y-3">
                  {result.requiredSkillsMatched && result.requiredSkillsMatched.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-2">
                        必要技能 <span className="text-success">(已匹配)</span>
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {result.requiredSkillsMatched.map((kw, i) => (
                          <span
                            key={i}
                            className="rounded-full bg-success/10 border border-success/20 px-2.5 py-1 text-xs font-medium text-success"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.requiredSkillsMissing && result.requiredSkillsMissing.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-2">
                        必要技能 <span className="text-destructive">(缺失)</span>
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {result.requiredSkillsMissing.map((kw, i) => (
                          <span
                            key={i}
                            className="rounded-full bg-destructive/10 border border-destructive/20 px-2.5 py-1 text-xs font-medium text-destructive"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.preferredSkillsMatched && result.preferredSkillsMatched.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-2">
                        优先技能 <span className="text-success">(已匹配)</span>
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {result.preferredSkillsMatched.map((kw, i) => (
                          <span
                            key={i}
                            className="rounded-full bg-success/5 border border-success/15 px-2.5 py-1 text-xs font-medium text-success/80"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.preferredSkillsMissing && result.preferredSkillsMissing.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-2">
                        优先技能 <span className="text-destructive">(缺失)</span>
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {result.preferredSkillsMissing.map((kw, i) => (
                          <span
                            key={i}
                            className="rounded-full bg-destructive/5 border border-destructive/15 px-2.5 py-1 text-xs font-medium text-destructive/80"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Fallback: flat keywordMatches / missingKeywords */}
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
                </>
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
                        {s.reason && (
                          <div className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground/80">
                            <Lightbulb className="size-3 mt-0.5 shrink-0 text-warning/70" />
                            <span>{s.reason}</span>
                          </div>
                        )}
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

              {/* Optimize button */}
              {resumeId && onSendToChat && (result.missingKeywords.length > 0 || result.suggestions.length > 0) && (
                <Button onClick={handleOptimize} className="w-full gap-1.5" size="lg">
                  <Wand2 className="size-4" />
                  AI 助手优化简历
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
