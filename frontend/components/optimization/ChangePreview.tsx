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
            className="rounded-md border border-border overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-muted/50 px-3 py-2 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-muted-foreground">
                  {change.path}
                </span>
                <span className="rounded bg-border px-1.5 py-0.5 text-xs text-muted-foreground">
                  {change.action}
                </span>
              </div>
              {isRejected ? (
                <span className="border border-border bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                  已拒绝
                </span>
              ) : (
                <span className="border border-border bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
                  已应用
                </span>
              )}
            </div>

            {/* Before / After */}
            <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">
              <div className="p-3 bg-destructive/5">
                <p className="text-xs text-muted-foreground/60 mb-1">原始内容</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {change.original}
                </p>
              </div>
              <div className="p-3 bg-success/5">
                <p className="text-xs text-muted-foreground/60 mb-1">修改后</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {change.value}
                </p>
              </div>
            </div>

            {/* Reason */}
            <div className="px-3 py-2 border-t border-border">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">原因：</span>
                {change.reason}
              </p>
              {isRejected && rejectionReason && (
                <p className="text-xs text-destructive mt-1">
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
