type ScoreBadgeProps = {
  label: string;
  score: number;
};

export function ScoreBadge({ label, score }: ScoreBadgeProps) {
  const color =
    score >= 80
      ? "bg-success/10 text-success"
      : score >= 60
        ? "bg-warning/10 text-warning"
        : "bg-destructive/10 text-destructive";

  return (
    <span className={`inline-flex items-center gap-1 border border-border px-2 py-0.5 text-sm font-medium tabular-nums ${color}`}>
      {label}: {score}
    </span>
  );
}
