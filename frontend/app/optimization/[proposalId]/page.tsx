"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api";
import { TaskProgress } from "@/components/TaskProgress";
import { ChangePreview } from "@/components/optimization/ChangePreview";

type Change = {
  path: string;
  action: string;
  original: string;
  value: string;
  reason: string;
};

type Proposal = {
  id: number;
  analysisReportId: number;
  status: string;
  changes: string;
  appliedChanges?: string;
  rejectedChanges?: string;
  taskId?: number;
};

export default function OptimizationProposalPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const proposalId = params.proposalId as string;
  const fromTask = searchParams.get("fromTask") === "true";

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(!fromTask);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  const fetchProposal = useCallback(async () => {
    try {
      const data = await apiGet<Proposal>(
        `/api/optimization/proposals/${proposalId}`
      );
      setProposal(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载优化方案失败");
    } finally {
      setLoading(false);
    }
  }, [proposalId]);

  useEffect(() => {
    if (!fromTask) {
      let cancelled = false;
      apiGet<Proposal>(`/api/optimization/proposals/${proposalId}`)
        .then((data) => { if (!cancelled) setProposal(data); })
        .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : "加载优化方案失败"); })
        .finally(() => { if (!cancelled) setLoading(false); });
      return () => { cancelled = true; };
    }
  }, [fromTask, proposalId]);

  function handleTaskComplete() {
    fetchProposal();
  }

  async function handleApply() {
    if (!proposal) return;
    setApplying(true);
    try {
      await apiPost(`/api/optimization/proposals/${proposal.id}/apply`, {});
      await fetchProposal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "应用方案失败");
    } finally {
      setApplying(false);
    }
  }

  if (fromTask && !proposal) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
          生成优化方案中
        </h1>
        <TaskProgress
          taskId={Number(proposalId)}
          onComplete={handleTaskComplete}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <p className="text-sm text-zinc-500">加载中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      </div>
    );
  }

  if (!proposal) return null;

  const changes: Change[] = JSON.parse(proposal.changes || "[]");
  const rejectedChanges = proposal.rejectedChanges
    ? JSON.parse(proposal.rejectedChanges)
    : [];

  const isGenerated = proposal.status === "GENERATED";
  const isApplied = proposal.status === "APPLIED";

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          优化方案
        </h1>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            isApplied
              ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300"
          }`}
        >
          {proposal.status}
        </span>
      </div>

      <ChangePreview changes={changes} rejected={rejectedChanges} />

      {isGenerated && (
        <div className="mt-6">
          <button
            onClick={handleApply}
            disabled={applying}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {applying ? "应用中..." : "应用修改"}
          </button>
        </div>
      )}

      {isApplied && (
        <div className="mt-6 rounded-md bg-green-50 dark:bg-green-900/10 p-3 text-sm text-green-700 dark:text-green-300">
          优化方案已成功应用到简历。
        </div>
      )}
    </div>
  );
}
