import React from "react";

type Props = {
  columns?: 1 | 2 | 3;
  children: React.ReactNode;
};

export function FieldWrapper({ columns = 2, children }: Props) {
  const gridClass = columns === 1 ? "grid-cols-1" : columns === 3 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 sm:grid-cols-2";
  return <div className={`grid ${gridClass} gap-3`}>{children}</div>;
}
