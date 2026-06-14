"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api";
import { AnalysisReport } from "@/components/analysis/AnalysisReport";
import type { AnalysisReport as AnalysisReportType } from "@/lib/types";

export default function AnalysisPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-3xl p-6 text-sm text-muted-foreground">加载中...</div>}>
      <AnalysisPageContent />
    </Suspense>
  );
}

function AnalysisPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const reportId = searchParams.get("reportId");

  const [report, setReport] = useState<AnalysisReportType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reportId) {
      const timer = setTimeout(() => {
        setError("缺少报告 ID");
        setLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    apiGet<AnalysisReportType>(`/api/analysis/reports/${reportId}`)
      .then(setReport)
      .catch((err) => setError(err instanceof Error ? err.message : "加载报告失败"))
      .finally(() => setLoading(false));
  }, [reportId]);

  async function handleOptimize() {
    if (!report) return;
    try {
      const result = await apiPost<{ taskId: number; status: string }>(
        "/api/optimization/proposals",
        { analysisReportId: report.id }
      );
      router.push(`/optimization/${result.taskId}?fromTask=true`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成优化方案失败");
    }
  }

  function handleInterview() {
    if (!report) return;
    router.push(
      `/interviews/new?resumeId=${report.resumeId}&jobId=${report.jobId}`
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <p className="text-sm text-muted-foreground">加载中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="rounded-md bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">
        JD 匹配分析报告
      </h1>
      <AnalysisReport
        report={report}
        onOptimize={handleOptimize}
        onInterview={handleInterview}
      />
    </div>
  );
}
