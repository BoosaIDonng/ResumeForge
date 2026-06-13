"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import type { InterviewFeedback } from "@/lib/types";
import { FeedbackReport } from "@/components/interview/FeedbackReport";

export default function InterviewReportPage() {
  const params = useParams();
  const id = params.id as string;

  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await apiGet<InterviewFeedback>(
          `/api/interviews/${id}/feedback`
        );
        setFeedback(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "加载反馈失败");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

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

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-8">
        面试反馈报告
      </h1>

      {feedback && <FeedbackReport feedback={feedback} />}

      <div className="mt-10 pt-6 border-t border-zinc-200 dark:border-zinc-700">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          返回仪表盘
        </Link>
      </div>
    </div>
  );
}
