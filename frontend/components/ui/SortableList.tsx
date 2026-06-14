"use client";

import { useCallback, type ReactNode } from "react";
import SortableItem from "./SortableItem";

type SortableListProps<T> = {
  items: T[];
  onReorder: (items: T[]) => void;
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor: (item: T, index: number) => string;
  className?: string;
  itemClassName?: string;
};

export default function SortableList<T>({ items, onReorder, renderItem, keyExtractor, className = "", itemClassName = "" }: SortableListProps<T>) {
  const handleMove = useCallback((fromIndex: number, toIndex: number) => {
    const newItems = [...items];
    const [moved] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, moved);
    onReorder(newItems);
  }, [items, onReorder]);

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item, index) => (
        <SortableItem
          key={keyExtractor(item, index)}
          index={index}
          onMove={handleMove}
          className={itemClassName}
        >
          {renderItem(item, index)}
        </SortableItem>
      ))}
    </div>
  );
}
