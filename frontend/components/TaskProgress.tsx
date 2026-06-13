"use client";

import { useEffect, useRef, useState } from "react";

type TaskProgressProps = {
  taskId: number;
  onComplete?: () => void;
};

export function TaskProgress({ taskId, onComplete }: TaskProgressProps) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>("PENDING");
  const retriesRef = useRef(0);
  const maxRetries = 3;

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let closed = false;

    function connect() {
      if (closed) return;
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
      eventSource = new EventSource(`${baseUrl}/api/tasks/${taskId}/events`);

      eventSource.onmessage = (event) => {
        retriesRef.current = 0;
        const data = JSON.parse(event.data) as { taskId: number; status: string; progress: number };
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

    return () => {
      closed = true;
      eventSource?.close();
    };
  }, [taskId, onComplete]);

  const statusConfig: Record<string, { label: string; color: string; barColor: string }> = {
    PENDING: { label: "排队中", color: "text-zinc-500", barColor: "bg-zinc-400" },
    RUNNING: { label: "处理中", color: "text-blue-600 dark:text-blue-400", barColor: "bg-blue-500" },
    SUCCEEDED: { label: "完成", color: "text-emerald-600 dark:text-emerald-400", barColor: "bg-emerald-500" },
    FAILED: { label: "失败", color: "text-red-600 dark:text-red-400", barColor: "bg-red-500" },
  };

  const config = statusConfig[status] ?? statusConfig.PENDING;

  return (
    <div className="w-full rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-zinc-500 dark:text-zinc-400">任务 #{taskId}</span>
        <span className={`font-medium ${config.color}`}>{config.label}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${config.barColor}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-zinc-400 mt-1.5">{progress}%</p>
    </div>
  );
}
