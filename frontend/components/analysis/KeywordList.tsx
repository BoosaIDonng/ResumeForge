type KeywordListProps = {
  keywords: string[];
  variant: "match" | "missing";
};

export function KeywordList({ keywords, variant }: KeywordListProps) {
  const pillClass =
    variant === "match"
      ? "bg-success/15 text-success"
      : "bg-destructive/10 text-destructive";

  if (keywords.length === 0) {
    return <p className="text-sm text-muted-foreground">无</p>;
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
