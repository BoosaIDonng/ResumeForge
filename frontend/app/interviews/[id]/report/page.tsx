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
      <div className="mx-auto max-w-3xl px-6 py-0">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-0">
      {/* Masthead */}
      <div className="border-b-[3px] border-double border-border py-6">
        <p className="text-eyebrow mb-1">面试报告</p>
        <h1 className="text-display-sm text-foreground">面试反馈报告</h1>
      </div>

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
