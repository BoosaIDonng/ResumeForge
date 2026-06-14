"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import type { InterviewFeedback } from "@/lib/types";
import { FeedbackReport } from "@/components/interview/FeedbackReport";
import { ArrowLeft } from "lucide-react";

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
        <p className="text-muted-foreground">加载中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold text-foreground mb-8">
        面试反馈报告
      </h1>

      {feedback && <FeedbackReport feedback={feedback} />}

      <div className="mt-10 pt-6 border-t border-border">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          返回仪表盘
        </Link>
      </div>
    </div>
  );
}
