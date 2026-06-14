"use client";

import { useState, useEffect, useCallback } from "react";
import { getAIHeaders } from "@/lib/ai-settings";
import type { GrammarCheckRecord } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SpellCheck, Check, Loader2, Wand2, History, ChevronDown, ChevronRight } from "lucide-react";

type GrammarIssue = {
  section: string;
  type: string;
  original: string;
  suggestion: string;
  severity: "high" | "medium" | "low";
};

type GrammarResult = {
  score: number;
  issues: GrammarIssue[];
  summary: string;
};

type Props = {
  resumeId?: number;
  resumeData?: string;
  onClose: () => void;
  onResumeUpdated?: () => void;
  onSendToChat?: (message: string) => void;
};

export default function GrammarCheckPanel({ resumeId, resumeData, onClose, onResumeUpdated, onSendToChat }: Props) {
  const [tab, setTab] = useState<"check" | "history">("check");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<GrammarResult | null>(null);

  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [historyRecords, setHistoryRecords] = useState<GrammarCheckRecord[]>([]);
  const [expandedRecordId, setExpandedRecordId] = useState<number | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!resumeId) return;
    setHistoryLoading(true);
    setHistoryError("");
    try {
      const headers = getAIHeaders();
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
      const res = await fetch(`${API_BASE}/api/ai/grammar-check/history?resumeId=${resumeId}`, {
        headers: { ...headers },
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || "获取历史记录失败");
      setHistoryRecords(body.data ?? body);
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

  async function handleCheck() {
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const headers = getAIHeaders();
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
      const res = await fetch(`${API_BASE}/api/ai/grammar-check`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ resumeId, resumeData }),
      });
      const body = await res.json();
      if (!res.ok || !body.success) throw new Error(body.message || "检查失败");
      setResult(body.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "检查失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  function handleApplyOne(issue: GrammarIssue) {
    if (!onSendToChat) return;
    const message = `请根据以下语法检查结果，修复简历中的这个问题：\n\n[${issue.section}] "${issue.original}" → "${issue.suggestion}"\n\n请使用工具直接修改对应的简历模块内容。`;
    onClose();
    setTimeout(() => onSendToChat(message), 300);
  }

  function handleApplyAll() {
    if (!result || result.issues.length === 0 || !onSendToChat) return;
    const issueList = result.issues
      .map((issue, i) => `${i + 1}. [${issue.section}] "${issue.original}" → "${issue.suggestion}"`)
      .join("\n");
    const message = `请根据以下语法检查结果，逐一修复简历中的问题：\n\n${issueList}\n\n请使用工具直接修改对应的简历模块内容。`;
    onClose();
    setTimeout(() => onSendToChat(message), 300);
  }

  function severityBadge(severity: string) {
    switch (severity) {
      case "high": return "bg-destructive/10 text-destructive";
      case "medium": return "bg-warning/15 text-warning";
      case "low": return "bg-primary/10 text-primary";
      default: return "bg-muted text-muted-foreground";
    }
  }

  function severityLabel(severity: string) {
    switch (severity) {
      case "high": return "严重";
      case "medium": return "中等";
      case "low": return "轻微";
      default: return severity;
    }
  }

  function typeBadge(type: string) {
    switch (type) {
      case "grammar": return "bg-accent text-accent-foreground";
      case "spelling": return "bg-warning/15 text-warning";
      case "style": return "bg-primary/10 text-primary";
      case "punctuation": return "bg-accent/20 text-accent";
      default: return "bg-muted text-muted-foreground";
    }
  }

  function typeLabel(type: string) {
    switch (type) {
      case "grammar": return "语法";
      case "spelling": return "拼写";
      case "style": return "风格";
      case "punctuation": return "标点";
      default: return type;
    }
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

  function parseIssues(issuesStr: string): GrammarIssue[] {
    try {
      return JSON.parse(issuesStr);
    } catch {
      return [];
    }
  }

  const remainingCount = result ? result.issues.length : 0;

  return (
    <Dialog open onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-[1600px] w-[95vw] max-h-[90vh] gap-0 overflow-hidden flex flex-col">
        <DialogHeader className="border-b border-border px-6 py-5 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <SpellCheck className="size-5" /> 语法与写作检查
          </DialogTitle>
        </DialogHeader>
        <div className="flex border-b border-border shrink-0">
          <button
            onClick={() => setTab("check")}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === "check"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <SpellCheck className="size-4" /> 检查
          </button>
          <button
            onClick={() => setTab("history")}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === "history"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <History className="size-4" /> 历史记录
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
          {tab === "check" && (
          <>
          {!result && !loading && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <SpellCheck className="size-12 text-muted-foreground mb-4" />
              <p className="text-base text-muted-foreground mb-5">检查简历中的语法、拼写和写作问题</p>
              <Button onClick={handleCheck} size="lg">开始检查</Button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="size-10 animate-spin text-primary mb-4" />
              <p className="text-base text-muted-foreground">正在分析简历内容...</p>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 px-4 py-3 text-base text-destructive">{error}</div>
          )}

          {result && (
            <div className="space-y-6">
              {/* Score bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base font-medium text-foreground">写作质量</span>
                  <span className="text-xl font-bold text-foreground">{result.score}/100</span>
                </div>
                <div className="h-3.5 w-full overflow-hidden bg-muted">
                  <div
                    className={`h-full transition-all duration-500 ${scoreBarColor(result.score)}`}
                    style={{ width: `${result.score}%` }}
                  />
                </div>
              </div>

              {/* Issues count + Apply All */}
              <div className="flex items-center justify-between text-base">
                <span className="text-muted-foreground">
                  共发现 <span className="font-semibold text-foreground">{result.issues.length}</span> 个问题
                </span>
                {remainingCount > 0 && resumeId && onSendToChat && (
                  <Button onClick={handleApplyAll} className="gap-1.5">
                    <Wand2 className="size-4" />
                    全部应用 ({remainingCount})
                  </Button>
                )}
              </div>

              {/* Issues list */}
              {result.issues.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {result.issues.map((issue, i) => (
                      <div key={i} className="border p-5 transition-colors border-border">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-sm text-muted-foreground">{issue.section}</span>
                          <span className={`px-2.5 py-0.5 text-xs font-medium ${typeBadge(issue.type)}`}>
                            {typeLabel(issue.type)}
                          </span>
                          <span className={`px-2.5 py-0.5 text-xs font-medium ${severityBadge(issue.severity)}`}>
                            {severityLabel(issue.severity)}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="min-w-0">
                            <p className="text-xs text-muted-foreground/70 mb-1">原文</p>
                            <p className="text-sm text-foreground bg-destructive/10 px-3 py-2 break-words whitespace-pre-wrap line-clamp-3">
                              {issue.original}
                            </p>
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-muted-foreground/70 mb-1">建议</p>
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
                  <p className="text-base text-muted-foreground">未发现明显问题，写作质量很好！</p>
                </div>
              )}

              {/* Summary */}
              {result.summary && (
                <div className="bg-muted/50 p-5">
                  <h3 className="text-base font-semibold text-foreground mb-2">总结</h3>
                  <p className="text-base text-muted-foreground leading-relaxed">{result.summary}</p>
                </div>
              )}

              {/* Re-check button */}
              <Button onClick={handleCheck} disabled={loading} variant="outline" className="w-full" size="lg">
                重新检查
              </Button>
            </div>
          )}
          </>
          )}

          {tab === "history" && (
          <>
            {historyLoading && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="size-10 animate-spin text-primary mb-4" />
                <p className="text-base text-muted-foreground">正在加载历史记录...</p>
              </div>
            )}

            {historyError && (
              <div className="bg-destructive/10 px-4 py-3 text-base text-destructive">{historyError}</div>
            )}

            {!historyLoading && !historyError && historyRecords.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <History className="size-12 text-muted-foreground mb-4" />
                <p className="text-base text-muted-foreground">暂无历史检查记录</p>
              </div>
            )}

            {!historyLoading && !historyError && historyRecords.length > 0 && (
              <div className="space-y-3">
                {historyRecords.map((record) => {
                  const issues = parseIssues(record.issues);
                  const isExpanded = expandedRecordId === record.id;
                  const date = new Date(record.createdAt);
                  const dateStr = date.toLocaleDateString("zh-CN", {
                    year: "numeric", month: "2-digit", day: "2-digit",
                    hour: "2-digit", minute: "2-digit",
                  });

                  return (
                    <div key={record.id} className="border border-border">
                      <button
                        onClick={() => setExpandedRecordId(isExpanded ? null : record.id)}
                        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-muted/30 transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                        )}
                        <span className="text-sm text-muted-foreground w-36 shrink-0">{dateStr}</span>
                        <span className={`text-lg font-bold w-20 text-center ${scoreTextColor(record.score)}`}>
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
                            <span className={`text-sm font-semibold ${scoreTextColor(record.score)}`}>
                              得分: {record.score}/100
                            </span>
                          </div>
                          {record.summary && (
                            <p className="text-sm text-muted-foreground">{record.summary}</p>
                          )}
                          {issues.length > 0 ? (
                            <div className="space-y-3">
                              {issues.map((issue, i) => (
                                <div key={i} className="border border-border p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs text-muted-foreground">{issue.section}</span>
                                    <span className={`px-2 py-0.5 text-xs font-medium ${typeBadge(issue.type)}`}>
                                      {typeLabel(issue.type)}
                                    </span>
                                    <span className={`px-2 py-0.5 text-xs font-medium ${severityBadge(issue.severity)}`}>
                                      {severityLabel(issue.severity)}
                                    </span>
                                  </div>
                                  <div className="space-y-1.5">
                                    <div>
                                      <p className="text-xs text-muted-foreground/70 mb-0.5">原文</p>
                                      <p className="text-sm text-foreground bg-destructive/10 px-3 py-1.5 break-words whitespace-pre-wrap line-clamp-3">
                                        {issue.original}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground/70 mb-0.5">建议</p>
                                      <p className="text-sm text-foreground bg-success/10 px-3 py-1.5 break-words whitespace-pre-wrap line-clamp-3">
                                        {issue.suggestion}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">无详细问题数据</p>
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
