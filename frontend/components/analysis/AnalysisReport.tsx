import { ScoreBadge } from "@/components/ScoreBadge";
import { KeywordList } from "@/components/analysis/KeywordList";
import type { AnalysisReport as AnalysisReportType } from "@/lib/types";

type Suggestion = {
  section: string;
  current: string;
  suggested: string;
};

type AnalysisReportProps = {
  report: AnalysisReportType;
  onOptimize: () => void;
  onInterview: () => void;
};

export function AnalysisReport({ report, onOptimize, onInterview }: AnalysisReportProps) {
  const keywordMatches: string[] = JSON.parse(report.keywordMatches || "[]");
  const missingKeywords: string[] = JSON.parse(report.missingKeywords || "[]");
  const suggestions: Suggestion[] = JSON.parse(report.suggestions || "[]");

  return (
    <div className="space-y-6">
      {/* Scores */}
      <div className="flex flex-wrap gap-3">
        <ScoreBadge label="综合评分" score={report.overallScore} />
        <ScoreBadge label="ATS" score={report.atsScore} />
      </div>

      {/* Keyword Matches */}
      <section>
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
          匹配关键词
        </h3>
        <KeywordList keywords={keywordMatches} variant="match" />
      </section>

      {/* Missing Keywords */}
      <section>
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
          缺失关键词
        </h3>
        <KeywordList keywords={missingKeywords} variant="missing" />
      </section>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
            优化建议
          </h3>
          <div className="space-y-3">
            {suggestions.map((s, i) => (
              <div
                key={i}
                className="rounded-md border border-zinc-200 dark:border-zinc-700 p-3"
              >
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                  {s.section}
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-zinc-400 mb-0.5">当前</p>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 bg-red-50 dark:bg-red-900/10 rounded px-2 py-1">
                      {s.current}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400 mb-0.5">建议</p>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 bg-green-50 dark:bg-green-900/10 rounded px-2 py-1">
                      {s.suggested}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Summary */}
      <section>
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
          总结
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {report.summary}
        </p>
      </section>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onOptimize}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          生成优化方案
        </button>
        <button
          onClick={onInterview}
          className="rounded-md border border-zinc-300 dark:border-zinc-600 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          开始模拟面试
        </button>
      </div>
    </div>
  );
}
