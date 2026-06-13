"use client";

import { useEffect, useState } from "react";

type TaskProgressProps = {
  taskId: number;
  onComplete?: () => void;
};

export function TaskProgress({ taskId, onComplete }: TaskProgressProps) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>("PENDING");

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
    const eventSource = new EventSource(`${baseUrl}/api/tasks/${taskId}/events`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data) as { taskId: number; status: string; progress: number };
      setProgress(data.progress);
      setStatus(data.status);

      if (data.status === "SUCCEEDED" || data.status === "FAILED") {
        eventSource.close();
        if (data.status === "SUCCEEDED" && onComplete) {
          onComplete();
        }
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => eventSource.close();
  }, [taskId, onComplete]);

  const barColor =
    status === "FAILED" ? "bg-red-500" : status === "SUCCEEDED" ? "bg-green-500" : "bg-blue-500";

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-zinc-600 dark:text-zinc-400">Task #{taskId}</span>
        <span className="font-medium text-zinc-900 dark:text-zinc-100">{status}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-700">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-zinc-500 mt-1">{progress}%</p>
    </div>
  );
}
