type KeywordListProps = {
  keywords: string[];
  variant: "match" | "missing";
};

export function KeywordList({ keywords, variant }: KeywordListProps) {
  const pillClass =
    variant === "match"
      ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
      : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";

  if (keywords.length === 0) {
    return <p className="text-sm text-zinc-500">无</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {keywords.map((keyword) => (
        <span
          key={keyword}
          className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${pillClass}`}
        >
          {keyword}
        </span>
      ))}
    </div>
  );
}
