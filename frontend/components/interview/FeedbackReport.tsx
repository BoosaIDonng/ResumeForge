"use client";

import type { InterviewFeedback } from "@/lib/types";
import { ScoreBadge } from "@/components/ScoreBadge";

type CategoryScore = {
  name: string;
  score: number;
  comment: string;
};

type FeedbackReportProps = {
  feedback: InterviewFeedback;
};

export function FeedbackReport({ feedback }: FeedbackReportProps) {
  const categoryScores: CategoryScore[] = JSON.parse(feedback.categoryScores);
  const strengths: string[] = JSON.parse(feedback.strengths);
  const areasForImprovement: string[] = JSON.parse(feedback.areasForImprovement);

  return (
    <div className="space-y-8">
      {/* Total Score */}
      <div className="flex flex-col items-center gap-3 py-6">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
          综合评分
        </p>
        <div className="text-5xl font-bold text-zinc-900 dark:text-zinc-100">
          {feedback.totalScore}
          <span className="text-2xl text-zinc-400">/100</span>
        </div>
        <ScoreBadge label="总分" score={feedback.totalScore} />
      </div>

      {/* Category Scores */}
      <section>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          分项评分
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {categoryScores.map((cat) => (
            <div
              key={cat.name}
              className="rounded-lg border border-zinc-200 dark:border-zinc-700 p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {cat.name}
                </span>
                <ScoreBadge label="" score={cat.score} />
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {cat.comment}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Strengths */}
      <section>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
          优势
        </h2>
        <ul className="space-y-2">
          {strengths.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300"
            >
              <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Areas for Improvement */}
      <section>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
          待提升
        </h2>
        <ul className="space-y-2">
          {areasForImprovement.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300"
            >
              <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-amber-600 dark:text-amber-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Final Assessment */}
      <section>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
          总结评价
        </h2>
        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
          {feedback.finalAssessment}
        </p>
      </section>
    </div>
  );
}
