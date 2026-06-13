type ScoreBadgeProps = {
  label: string;
  score: number;
};

export function ScoreBadge({ label, score }: ScoreBadgeProps) {
  const color =
    score >= 80
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      : score >= 60
        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${color}`}>
      {label}: {score}
    </span>
  );
}
