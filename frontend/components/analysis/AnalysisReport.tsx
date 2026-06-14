import { ScoreBadge } from "@/components/ScoreBadge";
import { KeywordList } from "@/components/analysis/KeywordList";
import type { AnalysisReport as AnalysisReportType } from "@/lib/types";

type Suggestion = {
  section: string;
  current: string;
  suggested: string;
  reason?: string;
};

type AnalysisReportProps = {
  report: AnalysisReportType;
  onOptimize: () => void;
  onInterview: () => void;
};

function parseJsonSafe<T>(raw: string | undefined, fallback: T): T {
  try {
    return JSON.parse(raw || "[]") as T;
  } catch {
    return fallback;
  }
}

export function AnalysisReport({ report, onOptimize, onInterview }: AnalysisReportProps) {
  const keywordMatches: string[] = parseJsonSafe(report.keywordMatches, []);
  const missingKeywords: string[] = parseJsonSafe(report.missingKeywords, []);
  const suggestions: Suggestion[] = parseJsonSafe(report.suggestions, []);

  const matched = keywordMatches.length;
  const missing = missingKeywords.length;
  const total = matched + missing;
  const keywordMatchPct = total > 0 ? Math.round((matched / total) * 100) : 0;
  const potentialMatchPct = total > 0 ? Math.round(((matched + missing * 0.5) / total) * 100) : 0;

  const jdMeta = parseJsonSafe<{ company?: string; role?: string; level?: string }>(
    report.summary,
    {}
  );
  const hasMeta = jdMeta.company || jdMeta.role || jdMeta.level;

  return (
    <div className="space-y-6">
      {/* Scores + Dual Progress Bars */}
      <section className="space-y-3">
        <div className="flex flex-wrap gap-3">
          <ScoreBadge label="综合评分" score={report.overallScore} />
          <ScoreBadge label="ATS" score={report.atsScore} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="border border-border p-3">
            <p className="text-xs font-medium text-muted-foreground mb-1">关键词匹配率</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-muted">
                <div
                  className="h-2 bg-success"
                  style={{ width: `${keywordMatchPct}%` }}
                />
              </div>
              <span className="text-sm font-medium text-muted-foreground w-10 text-right">
                {keywordMatchPct}%
              </span>
            </div>
          </div>
          <div className="border border-border p-3">
            <p className="text-xs font-medium text-muted-foreground mb-1">潜在匹配率</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-muted">
                <div
                  className="h-2 bg-warning"
                  style={{ width: `${potentialMatchPct}%` }}
                />
              </div>
              <span className="text-sm font-medium text-muted-foreground w-10 text-right">
                {potentialMatchPct}%
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* JD Metadata */}
      {hasMeta && (
        <section>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">
            职位信息
          </h3>
          <div className="border border-border p-3 flex flex-wrap gap-4">
            {jdMeta.company && (
              <div>
                <p className="text-xs text-muted-foreground/60">公司</p>
                <p className="text-sm text-muted-foreground">{jdMeta.company}</p>
              </div>
            )}
            {jdMeta.role && (
              <div>
                <p className="text-xs text-muted-foreground/60">职位</p>
                <p className="text-sm text-muted-foreground">{jdMeta.role}</p>
              </div>
            )}
            {jdMeta.level && (
              <div>
                <p className="text-xs text-muted-foreground/60">级别</p>
                <p className="text-sm text-muted-foreground">{jdMeta.level}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Matched Keywords */}
      <section>
        <h3 className="text-sm font-semibold text-muted-foreground mb-2">
          匹配关键词
        </h3>
        <KeywordList keywords={keywordMatches} variant="match" />
      </section>

      {/* Missing Keywords */}
      <section>
        <h3 className="text-sm font-semibold text-muted-foreground mb-2">
          缺失关键词
        </h3>
        <KeywordList keywords={missingKeywords} variant="missing" />
      </section>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">
            优化建议
          </h3>
          <div className="space-y-3">
            {suggestions.map((s, i) => (
              <div
                key={i}
                className="border border-border p-3"
              >
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  {s.section}
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground/60 mb-0.5">当前</p>
                    <p className="text-sm text-muted-foreground bg-destructive/5 px-2 py-1">
                      {s.current}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground/60 mb-0.5">建议</p>
                    <p className="text-sm text-muted-foreground bg-success/10 px-2 py-1">
                      {s.suggested}
                    </p>
                  </div>
                </div>
                {s.reason && (
                  <p className="mt-2 text-xs italic text-muted-foreground/70 flex items-start gap-1">
                    <span aria-hidden="true">💡</span>
                    {s.reason}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Summary */}
      <section>
        <h3 className="text-sm font-semibold text-muted-foreground mb-2">
          总结
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {report.summary}
        </p>
      </section>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onOptimize}
          className="bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          生成优化方案
        </button>
        <button
          onClick={onInterview}
          className="border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
        >
          开始模拟面试
        </button>
      </div>
    </div>
  );
}
