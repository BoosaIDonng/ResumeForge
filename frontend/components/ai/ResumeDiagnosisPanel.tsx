"use client";

import { useState, useEffect, useCallback } from "react";
import { getAIHeaders } from "@/lib/ai-settings";
import { grammarHistoryStorage } from "@/lib/storage";
import type { DiagnosisRecord } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Stethoscope, Check, Loader2, Wand2, History,
  ChevronDown, ChevronRight, Lightbulb,
} from "lucide-react";

/* ── Types ── */

type DiagnosisIssue = {
  section: string;
  type: string;
  original: string;
  suggestion: string;
  severity: "high" | "medium" | "low";
};

type SectionScore = {
  sectionType: string;
  sectionName: string;
  score: number;
  feedback: string;
};

type Suggestion = {
  priority: string;
  section: string;
  message: string;
  example: string;
};

type DiagnosisResult = {
  score: number;
  issues: DiagnosisIssue[];
  summary: string;
  sectionScores: SectionScore[];
  suggestions: Suggestion[];
};

type Props = {
  resumeId?: string;
  resumeData?: string;
  onClose: () => void;
  onResumeUpdated?: () => void;
  onSendToChat?: (message: string) => void;
};

/* ── Component ── */

export default function ResumeDiagnosisPanel({
  resumeId,
  resumeData,
  onClose,
  onResumeUpdated,
  onSendToChat,
}: Props) {
  const [tab, setTab] = useState<"diagnosis" | "history">("diagnosis");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<DiagnosisResult | null>(null);

  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [historyRecords, setHistoryRecords] = useState<DiagnosisRecord[]>([]);
  const [expandedRecordId, setExpandedRecordId] = useState<number | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

  /* ── Fetch history ── */

  const fetchHistory = useCallback(async () => {
    if (!resumeId) return;
    setHistoryLoading(true);
    setHistoryError("");
    try {
      const records = grammarHistoryStorage.getByResumeId(resumeId);
      setHistoryRecords(records);
    } catch (err) {
      setHistoryError(err instanceof Error ? err.message : "获取历史记录失败");
    } finally {
      setHistoryLoading(false);
    }
  }, [resumeId]);

  useEffect(() => {
    if (tab === "history" && historyRecords.length === 0 && !historyLoading) {
      fetchHistory();
    }
  }, [tab, historyRecords.length, historyLoading, fetchHistory]);

  /* ── Run diagnosis ── */

  async function handleDiagnose() {
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const headers = getAIHeaders();
      const res = await fetch(`${API_BASE}/api/ai/grammar-check`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ resumeId, resumeData }),
      });
      const body = await res.json();
      if (!res.ok || !body.success) throw new Error(body.message || "诊断失败");
      const data = body.data;
      setResult(data);
      // Store in localStorage history
      if (resumeId && data) {
        grammarHistoryStorage.add({
          id: Date.now(),
          resumeId,
          score: data.score ?? 0,
          issuesCount: data.issues?.length ?? 0,
          issues: JSON.stringify(data.issues ?? []),
          summary: data.summary ?? "",
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "诊断失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  /* ── Apply handlers ── */

  function handleApplyOne(issue: DiagnosisIssue) {
    if (!onSendToChat) return;
    const message = `请根据以下简历诊断结果，修复这个问题：\n\n[${issue.section}] "${issue.original}" → "${issue.suggestion}"\n\n请使用工具直接修改对应的简历模块内容。`;
    onClose();
    setTimeout(() => onSendToChat(message), 300);
  }

  function handleApplyAll() {
    if (!result || result.issues.length === 0 || !onSendToChat) return;
    const issueList = result.issues
      .map(
        (issue, i) =>
          `${i + 1}. [${issue.section}] "${issue.original}" → "${issue.suggestion}"`
      )
      .join("\n");
    const message = `请根据以下简历诊断结果，逐一修复问题：\n\n${issueList}\n\n请使用工具直接修改对应的简历模块内容。`;
    onClose();
    setTimeout(() => onSendToChat(message), 300);
  }

  function handleApplySuggestion(sug: Suggestion) {
    if (!onSendToChat) return;
    const message = `请根据以下改进建议优化简历：\n\n【${sug.section}】${sug.message}\n${sug.example ? `示例：${sug.example}` : ""}\n\n请使用工具直接修改对应的简历模块内容。`;
    onClose();
    setTimeout(() => onSendToChat(message), 300);
  }

  /* ── Helpers ── */

  function severityBadge(s: string) {
    const map: Record<string, string> = {
      high: "bg-destructive/10 text-destructive",
      medium: "bg-warning/15 text-warning",
      low: "bg-primary/10 text-primary",
    };
    return map[s] ?? "bg-muted text-muted-foreground";
  }
  function severityLabel(s: string) {
    return { high: "严重", medium: "中等", low: "轻微" }[s] ?? s;
  }
  function typeBadge(t: string) {
    const map: Record<string, string> = {
      grammar: "bg-accent text-accent-foreground",
      spelling: "bg-warning/15 text-warning",
      style: "bg-primary/10 text-primary",
      punctuation: "bg-accent/20 text-accent",
      weak_verb: "bg-primary/10 text-primary",
      vague: "bg-warning/15 text-warning",
      quantify: "bg-accent text-accent-foreground",
    };
    return map[t] ?? "bg-muted text-muted-foreground";
  }
  function typeLabel(t: string) {
    const map: Record<string, string> = {
      grammar: "语法",
      spelling: "拼写",
      style: "风格",
      punctuation: "标点",
      weak_verb: "弱动词",
      vague: "模糊",
      quantify: "量化",
    };
    return map[t] ?? t;
  }
  function scoreBarColor(score: number) {
    if (score >= 80) return "bg-success";
    if (score >= 60) return "bg-warning";
    return "bg-destructive";
  }
  function scoreTextColor(score: number) {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  }
  function scoreBg(score: number) {
    if (score >= 80) return "bg-success/10 border-success/20";
    if (score >= 60) return "bg-warning/10 border-warning/20";
    return "bg-destructive/5 border-destructive/20";
  }
  function priorityBadge(p: string) {
    const styles: Record<string, string> = {
      high: "bg-destructive/10 text-destructive",
      medium: "bg-warning/15 text-warning",
      low: "bg-primary/10 text-primary/90",
    };
    const labels: Record<string, string> = { high: "高", medium: "中", low: "低" };
    return (
      <span
        className={`text-[10px] px-1.5 py-0.5 rounded ${styles[p] ?? styles.medium}`}
      >
        {labels[p] ?? p}优先
      </span>
    );
  }
  function parseIssues(issuesStr: string): DiagnosisIssue[] {
    try {
      return JSON.parse(issuesStr);
    } catch {
      return [];
    }
  }

  /* ── Render ── */

  const hasResult = result !== null;

  return (
    <Dialog open onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent
        className={`${
          hasResult ? "sm:max-w-[1600px] w-[95vw]" : "sm:max-w-[480px]"
        } max-h-[90vh] gap-0 overflow-hidden flex flex-col`}
      >
        {/* Header */}
        <DialogHeader className="border-b border-border px-6 py-5 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Stethoscope className="size-5" /> 简历诊断
          </DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        {hasResult && (
          <div className="flex border-b border-border shrink-0">
            {(["diagnosis", "history"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  tab === t
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "diagnosis" ? (
                  <><Stethoscope className="size-4" /> 诊断</>
                ) : (
                  <><History className="size-4" /> 历史记录</>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className={`flex-1 min-h-0 overflow-y-auto ${hasResult ? "p-6 space-y-6" : "p-5"}`}>
          {/* ── Diagnosis tab ── */}
          {(!hasResult || tab === "diagnosis") && (
            <>
              {/* Empty state */}
              {!result && !loading && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Stethoscope className="size-10 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground mb-4">
                    全面诊断简历质量，发现问题并给出评分和改进建议
                  </p>
                  <Button onClick={handleDiagnose} disabled={loading} size="lg">
                    开始诊断
                  </Button>
                </div>
              )}

              {/* Loading */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <Loader2 className="size-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">正在全面分析简历...</p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* Results */}
              {result && (
                <div className="space-y-6">
                  {/* ── Overall score ── */}
                  <div
                    className={`text-center p-4 rounded-lg border ${scoreBg(result.score)}`}
                  >
                    <div className={`text-4xl font-bold ${scoreTextColor(result.score)}`}>
                      {result.score}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      综合评分 / 100
                    </div>
                  </div>

                  {/* ── Summary ── */}
                  {result.summary && (
                    <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                      {result.summary}
                    </p>
                  )}

                  {/* ── Section scores ── */}
                  {result.sectionScores && result.sectionScores.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground mb-2">
                        分栏评分
                      </h4>
                      <div className="space-y-1.5">
                        {result.sectionScores.map((s, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <span className="w-24 text-muted-foreground truncate">
                              {s.sectionName}
                            </span>
                            <div className="flex-1 bg-border rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${scoreBarColor(s.score)}`}
                                style={{ width: `${s.score}%` }}
                              />
                            </div>
                            <span
                              className={`font-medium w-8 text-right ${scoreTextColor(
                                s.score
                              )}`}
                            >
                              {s.score}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── Issues count + Apply All ── */}
                  <div className="flex items-center justify-between text-base">
                    <span className="text-muted-foreground">
                      共发现{" "}
                      <span className="font-semibold text-foreground">
                        {result.issues.length}
                      </span>{" "}
                      个问题
                    </span>
                    {result.issues.length > 0 && resumeId && onSendToChat && (
                      <Button onClick={handleApplyAll} className="gap-1.5">
                        <Wand2 className="size-4" />
                        全部应用 ({result.issues.length})
                      </Button>
                    )}
                  </div>

                  {/* ── Issues list ── */}
                  {result.issues.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {result.issues.map((issue, i) => (
                        <div
                          key={i}
                          className="border p-5 transition-colors border-border"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-sm text-muted-foreground">
                              {issue.section}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 text-xs font-medium ${typeBadge(
                                issue.type
                              )}`}
                            >
                              {typeLabel(issue.type)}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 text-xs font-medium ${severityBadge(
                                issue.severity
                              )}`}
                            >
                              {severityLabel(issue.severity)}
                            </span>
                          </div>
                          <div className="space-y-2">
                            <div className="min-w-0">
                              <p className="text-xs text-muted-foreground/70 mb-1">
                                原文
                              </p>
                              <p className="text-sm text-foreground bg-destructive/10 px-3 py-2 break-words whitespace-pre-wrap line-clamp-3">
                                {issue.original}
                              </p>
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs text-muted-foreground/70 mb-1">
                                建议
                              </p>
                              <p className="text-sm text-foreground bg-success/10 px-3 py-2 break-words whitespace-pre-wrap line-clamp-3">
                                {issue.suggestion}
                              </p>
                            </div>
                          </div>
                          {resumeId && onSendToChat && (
                            <div className="mt-3 flex justify-end">
                              <Button
                                variant="outline"
                                onClick={() => handleApplyOne(issue)}
                                className="gap-1.5"
                              >
                                <Wand2 className="size-4" />
                                应用
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-8 text-center">
                      <Check className="size-12 text-muted-foreground mb-3" />
                      <p className="text-base text-muted-foreground">
                        未发现明显问题，简历质量很好！
                      </p>
                    </div>
                  )}

                  {/* ── Suggestions ── */}
                  {result.suggestions && result.suggestions.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground mb-2">
                        改进建议
                      </h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {result.suggestions.map((sug, i) => (
                          <div key={i} className="text-xs border rounded p-3">
                            <div className="flex items-center gap-2 mb-1">
                              {priorityBadge(sug.priority)}
                              <span className="text-muted-foreground/60">
                                {sug.section}
                              </span>
                            </div>
                            <p className="text-foreground">{sug.message}</p>
                            {sug.example && (
                              <p className="flex items-center gap-1 text-success mt-1 bg-success/10 p-1 rounded text-[11px]">
                                <Lightbulb className="size-3 shrink-0" />{" "}
                                {sug.example}
                              </p>
                            )}
                            {resumeId && onSendToChat && (
                              <div className="mt-2 flex justify-end">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleApplySuggestion(sug)}
                                  className="gap-1 text-xs h-7"
                                >
                                  <Wand2 className="size-3" />
                                  优化此项
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── Re-diagnose ── */}
                  <Button
                    onClick={handleDiagnose}
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    重新诊断
                  </Button>
                </div>
              )}
            </>
          )}

          {/* ── History tab ── */}
          {tab === "history" && (
            <>
              {historyLoading && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="size-10 animate-spin text-primary mb-4" />
                  <p className="text-base text-muted-foreground">
                    正在加载历史记录...
                  </p>
                </div>
              )}

              {historyError && (
                <div className="bg-destructive/10 px-4 py-3 text-base text-destructive">
                  {historyError}
                </div>
              )}

              {!historyLoading && !historyError && historyRecords.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <History className="size-12 text-muted-foreground mb-4" />
                  <p className="text-base text-muted-foreground">
                    暂无历史诊断记录
                  </p>
                </div>
              )}

              {!historyLoading && !historyError && historyRecords.length > 0 && (
                <div className="space-y-3">
                  {historyRecords.map((record) => {
                    const issues = parseIssues(record.issues);
                    const isExpanded = expandedRecordId === record.id;
                    const date = new Date(record.createdAt);
                    const dateStr = date.toLocaleDateString("zh-CN", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <div key={record.id} className="border border-border">
                        <button
                          onClick={() =>
                            setExpandedRecordId(isExpanded ? null : record.id)
                          }
                          className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-muted/30 transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                          )}
                          <span className="text-sm text-muted-foreground w-36 shrink-0">
                            {dateStr}
                          </span>
                          <span
                            className={`text-lg font-bold w-20 text-center ${scoreTextColor(
                              record.score
                            )}`}
                          >
                            {record.score}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {record.issuesCount} 个问题
                          </span>
                          <span className="ml-auto text-xs text-muted-foreground truncate max-w-[200px]">
                            {record.summary}
                          </span>
                        </button>

                        {isExpanded && (
                          <div className="border-t border-border px-5 py-4 space-y-4 bg-muted/10">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-foreground">
                                详细问题 ({issues.length})
                              </span>
                              <span
                                className={`text-sm font-semibold ${scoreTextColor(
                                  record.score
                                )}`}
                              >
                                得分: {record.score}/100
                              </span>
                            </div>
                            {record.summary && (
                              <p className="text-sm text-muted-foreground">
                                {record.summary}
                              </p>
                            )}
                            {issues.length > 0 ? (
                              <div className="space-y-3">
                                {issues.map((issue, i) => (
                                  <div
                                    key={i}
                                    className="border border-border p-4"
                                  >
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-xs text-muted-foreground">
                                        {issue.section}
                                      </span>
                                      <span
                                        className={`px-2 py-0.5 text-xs font-medium ${typeBadge(
                                          issue.type
                                        )}`}
                                      >
                                        {typeLabel(issue.type)}
                                      </span>
                                      <span
                                        className={`px-2 py-0.5 text-xs font-medium ${severityBadge(
                                          issue.severity
                                        )}`}
                                      >
                                        {severityLabel(issue.severity)}
                                      </span>
                                    </div>
                                    <div className="space-y-1.5">
                                      <div>
                                        <p className="text-xs text-muted-foreground/70 mb-0.5">
                                          原文
                                        </p>
                                        <p className="text-sm text-foreground bg-destructive/10 px-3 py-1.5 break-words whitespace-pre-wrap line-clamp-3">
                                          {issue.original}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-muted-foreground/70 mb-0.5">
                                          建议
                                        </p>
                                        <p className="text-sm text-foreground bg-success/10 px-3 py-1.5 break-words whitespace-pre-wrap line-clamp-3">
                                          {issue.suggestion}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                无详细问题数据
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
