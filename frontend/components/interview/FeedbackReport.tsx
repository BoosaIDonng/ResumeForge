"use client";

import { Check, AlertCircle } from "lucide-react";
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
  const improvementPlan: string[] = feedback.improvementPlan
    ? JSON.parse(feedback.improvementPlan)
    : [];

  return (
    <div className="space-y-8">
      {/* Total Score */}
      <div className="flex flex-col items-center gap-3 py-6">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          综合评分
        </p>
        <div className="text-5xl font-bold text-foreground">
          {feedback.totalScore}
          <span className="text-2xl text-muted-foreground/60">/100</span>
        </div>
        <ScoreBadge label="总分" score={feedback.totalScore} />
      </div>

      {/* Category Scores */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          分项评分
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {categoryScores.map((cat) => (
            <div
              key={cat.name}
              className="rounded-lg border border-border p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-foreground">
                  {cat.name}
                </span>
                <ScoreBadge label="" score={cat.score} />
              </div>
              <p className="text-sm text-muted-foreground">
                {cat.comment}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Strengths */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-3">
          优势
        </h2>
        <ul className="space-y-2">
          {strengths.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-muted-foreground"
            >
              <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-success/15 flex items-center justify-center">
                <Check className="w-3 h-3 text-success" aria-hidden="true" />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Areas for Improvement */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-3">
          待提升
        </h2>
        <ul className="space-y-2">
          {areasForImprovement.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-muted-foreground"
            >
              <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-warning/15 flex items-center justify-center">
                <AlertCircle className="w-3 h-3 text-warning" aria-hidden="true" />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Final Assessment */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-3">
          总结评价
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          {feedback.finalAssessment}
        </p>
      </section>

      {/* Improvement Plan / Learning Suggestions */}
      {improvementPlan.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">
            后续学习建议
          </h2>
          <ul className="space-y-2">
            {improvementPlan.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {i + 1}
                </span>
                {item}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
