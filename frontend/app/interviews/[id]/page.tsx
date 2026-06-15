"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api";
import type { InterviewSession, InterviewQuestion } from "@/lib/types";
import { InterviewQuestionCard } from "@/components/interview/InterviewQuestionCard";
import { TaskProgress } from "@/components/TaskProgress";

export default function InterviewSessionPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [feedbackTaskId, setFeedbackTaskId] = useState<string | null>(null);
  const [generatingFeedback, setGeneratingFeedback] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const detail = await apiGet<{ session: InterviewSession; questions: InterviewQuestion[] }>(
          `/api/interviews/${id}`
        );
        setSession(detail.session);
        setQuestions(detail.questions.sort((a, b) => a.sortOrder - b.sortOrder));
      } catch (err) {
        setError(err instanceof Error ? err.message : "加载失败");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleAnswer = useCallback(
    async (questionId: string, answer: string) => {
      await apiPost(`/api/interviews/${id}/answers`, { questionId, answer });
      setQuestions((prev) =>
        prev.map((q) => (q.id === questionId ? { ...q, answer, answeredAt: new Date().toISOString() } : q))
      );
    },
    [id]
  );

  const allAnswered = questions.length > 0 && questions.every((q) => q.answer);

  const handleGenerateFeedback = async () => {
    setGeneratingFeedback(true);
    try {
      const result = await apiPost<{ taskId: string | null; status: string }>(
        `/api/interviews/${id}/feedback`,
        {}
      );
      if (result.taskId) {
        setFeedbackTaskId(result.taskId);
      } else {
        // No task system in localStorage mode - redirect to report directly
        router.push(`/interviews/${id}/report`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成反馈失败");
      setGeneratingFeedback(false);
    }
  };

  const handleFeedbackComplete = () => {
    router.push(`/interviews/${id}/report`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-0">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (feedbackTaskId) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-0">
        <h1 className="text-display-sm text-foreground mb-6">
          正在生成面试反馈...
        </h1>
        <TaskProgress taskId={feedbackTaskId} onComplete={handleFeedbackComplete} />
        <p className="text-sm text-muted-foreground mt-4">
          反馈生成完成后将自动跳转到报告页面
        </p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="mx-auto max-w-3xl px-6 py-0">
      {/* Masthead */}
      <div className="border-b-[3px] border-double border-border py-6">
        <p className="text-eyebrow mb-1">模拟面试</p>
        <div className="flex items-center justify-between">
          <h1 className="text-display-sm text-foreground">
            {session?.role} - {session?.type}
          </h1>
          <span className="text-sm font-medium text-muted-foreground">
            题目 {currentIndex + 1}/{questions.length}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full rounded-full bg-muted mb-8">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {currentQuestion && (
        <InterviewQuestionCard
          key={currentQuestion.id}
          question={currentQuestion}
          index={currentIndex}
          onAnswer={handleAnswer}
        />
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => setCurrentIndex((i) => i - 1)}
          disabled={currentIndex === 0}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          上一题
        </button>

        {currentIndex < questions.length - 1 ? (
          <button
            onClick={() => setCurrentIndex((i) => i + 1)}
            className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground font-medium hover:bg-primary-hover transition-colors"
          >
            下一题
          </button>
        ) : (
          allAnswered && (
            <button
              onClick={handleGenerateFeedback}
              disabled={generatingFeedback}
              className="rounded-lg bg-success px-4 py-2 text-sm text-success-foreground font-medium hover:bg-success/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              生成面试反馈
            </button>
          )
        )}
      </div>

      {/* Answered indicator dots */}
      <div className="flex items-center justify-center gap-2 mt-8">
        {questions.map((q, i) => (
          <button
            key={q.id}
            onClick={() => setCurrentIndex(i)}
            aria-label={`跳转到题目 ${i + 1}`}
            className={`w-3 h-3 rounded-full transition-colors ${
              i === currentIndex
                ? "bg-primary"
                : q.answer
                  ? "bg-success"
                  : "bg-muted-foreground/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
