type Change = {
  path: string;
  action: string;
  original: string;
  value: string;
  reason: string;
};

type RejectedChange = {
  change: { path: string };
  reason: string;
};

type ChangePreviewProps = {
  changes: Change[];
  rejected?: RejectedChange[];
};

export function ChangePreview({ changes, rejected = [] }: ChangePreviewProps) {
  const rejectedPaths = new Set(rejected.map((r) => r.change.path));

  function getRejectionReason(path: string): string | undefined {
    return rejected.find((r) => r.change.path === path)?.reason;
  }

  return (
    <div className="space-y-4">
      {changes.map((change, i) => {
        const isRejected = rejectedPaths.has(change.path);
        const rejectionReason = getRejectionReason(change.path);

        return (
          <div
            key={i}
            className="rounded-md border border-zinc-200 dark:border-zinc-700 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800 px-3 py-2 border-b border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400">
                  {change.path}
                </span>
                <span className="rounded bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                  {change.action}
                </span>
              </div>
              {isRejected ? (
                <span className="rounded-full bg-red-100 dark:bg-red-900/40 px-2 py-0.5 text-xs font-medium text-red-700 dark:text-red-300">
                  已拒绝
                </span>
              ) : (
                <span className="rounded-full bg-green-100 dark:bg-green-900/40 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-300">
                  已应用
                </span>
              )}
            </div>

            {/* Before / After */}
            <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200 dark:divide-zinc-700">
              <div className="p-3 bg-red-50/50 dark:bg-red-900/5">
                <p className="text-xs text-zinc-400 mb-1">原始内容</p>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                  {change.original}
                </p>
              </div>
              <div className="p-3 bg-green-50/50 dark:bg-green-900/5">
                <p className="text-xs text-zinc-400 mb-1">修改后</p>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                  {change.value}
                </p>
              </div>
            </div>

            {/* Reason */}
            <div className="px-3 py-2 border-t border-zinc-200 dark:border-zinc-700">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                <span className="font-medium">原因：</span>
                {change.reason}
              </p>
              {isRejected && rejectionReason && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  <span className="font-medium">拒绝原因：</span>
                  {rejectionReason}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
