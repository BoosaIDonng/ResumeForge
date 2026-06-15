"use client";

import { useEffect, useRef, useState } from "react";
import { apiPost } from "@/lib/api";
import { Button } from "@/components/ui/button";
import type { AiTask } from "@/lib/types";

type TaskProgressProps = {
  taskId: string | number;
  onComplete?: () => void;
  onRetry?: (newTaskId: string | number) => void;
};

export function TaskProgress({ taskId, onComplete, onRetry }: TaskProgressProps) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>("PENDING");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const retriesRef = useRef(0);
  const maxRetries = 3;

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let closed = false;

    function connect() {
      if (closed) return;
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
      eventSource = new EventSource(`${baseUrl}/api/tasks/${taskId}/events`);

      eventSource.onmessage = (event) => {
        retriesRef.current = 0;
        const data = JSON.parse(event.data) as { taskId: string | number; status: string; progress: number };
        setProgress(data.progress);
        setStatus(data.status);

        if (data.status === "SUCCEEDED" || data.status === "FAILED") {
          eventSource?.close();
          if (data.status === "SUCCEEDED" && onComplete) {
            onComplete();
          }
        }
      };

      eventSource.onerror = () => {
        eventSource?.close();
        if (!closed && retriesRef.current < maxRetries) {
          retriesRef.current++;
          setTimeout(connect, 2000 * retriesRef.current);
        }
      };
    }

    connect();

    if (status === "FAILED") {
      fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}/api/tasks/${taskId}`)
        .then((res) => res.json())
        .then((body: { data?: AiTask }) => {
          if (body.data?.errorMessage) setErrorMessage(body.data.errorMessage);
        })
        .catch(() => {});
    }

    return () => {
      closed = true;
      eventSource?.close();
    };
  }, [taskId, onComplete, status]);

  async function handleRetry() {
    setRetrying(true);
    try {
      const newTask = await apiPost<AiTask>(`/api/tasks/${taskId}/retry`, {});
      if (onRetry) {
        onRetry(newTask.id);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "重试失败");
    } finally {
      setRetrying(false);
    }
  }

  const statusConfig: Record<string, { label: string; color: string; barColor: string }> = {
    PENDING: { label: "排队中", color: "text-muted-foreground", barColor: "bg-muted-foreground/60" },
    RUNNING: { label: "处理中", color: "text-primary", barColor: "bg-primary" },
    SUCCEEDED: { label: "完成", color: "text-success", barColor: "bg-success" },
    FAILED: { label: "失败", color: "text-destructive", barColor: "bg-destructive" },
  };

  const config = statusConfig[status] ?? statusConfig.PENDING;

  return (
    <div className="w-full rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-muted-foreground">任务 #{taskId}</span>
        <span className={`font-medium ${config.color}`}>{config.label}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${config.barColor}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground/60 mt-1.5">{progress}%</p>
      {status === "FAILED" && (
        <div className="mt-3 space-y-2">
          {errorMessage && (
            <p className="text-xs text-destructive bg-destructive/5 rounded-md px-3 py-2">
              {errorMessage}
            </p>
          )}
          <Button
            onClick={handleRetry}
            disabled={retrying}
            className="w-full"
          >
            {retrying ? "重试中..." : "重试任务"}
          </Button>
        </div>
      )}
    </div>
  );
}
