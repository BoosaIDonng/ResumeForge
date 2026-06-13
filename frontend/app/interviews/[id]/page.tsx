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

  const [feedbackTaskId, setFeedbackTaskId] = useState<number | null>(null);
  const [generatingFeedback, setGeneratingFeedback] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [s, q] = await Promise.all([
          apiGet<InterviewSession>(`/api/interviews/${id}`),
          apiGet<InterviewQuestion[]>(`/api/interviews/${id}/questions`),
        ]);
        setSession(s);
        setQuestions(q.sort((a, b) => a.sortOrder - b.sortOrder));
      } catch (err) {
        setError(err instanceof Error ? err.message : "加载失败");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleAnswer = useCallback(
    async (questionId: number, answer: string) => {
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
      const result = await apiPost<{ taskId: number; status: string }>(
        `/api/interviews/${id}/feedback`,
        {}
      );
      setFeedbackTaskId(result.taskId);
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
        <p className="text-zinc-500">加载中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (feedbackTaskId) {
    return (
      <div className="max-w-lg mx-auto py-12 px-4">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
          正在生成面试反馈...
        </h1>
        <TaskProgress taskId={feedbackTaskId} onComplete={handleFeedbackComplete} />
        <p className="text-sm text-zinc-500 mt-4">
          反馈生成完成后将自动跳转到报告页面
        </p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          {session?.role} - {session?.type}
        </h1>
        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          题目 {currentIndex + 1}/{questions.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-700 mb-8">
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-300"
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
          className="rounded-lg border border-zinc-300 dark:border-zinc-600 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          上一题
        </button>

        {currentIndex < questions.length - 1 ? (
          <button
            onClick={() => setCurrentIndex((i) => i + 1)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white font-medium hover:bg-blue-700 transition-colors"
          >
            下一题
          </button>
        ) : (
          allAnswered && (
            <button
              onClick={handleGenerateFeedback}
              disabled={generatingFeedback}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                ? "bg-blue-600"
                : q.answer
                  ? "bg-green-500"
                  : "bg-zinc-300 dark:bg-zinc-600"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
