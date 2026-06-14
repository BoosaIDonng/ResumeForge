"use client";

import { useRef, useState, useCallback, type ReactNode } from "react";
import { GripVertical } from "lucide-react";

type SortableItemProps = {
  children: ReactNode;
  index: number;
  onMove: (fromIndex: number, toIndex: number) => void;
  dragHandle?: boolean;  // If true, show drag handle; if false, entire item is draggable
  className?: string;
};

export default function SortableItem({ children, index, onMove, dragHandle = true, className = "" }: SortableItemProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isOver, setIsOver] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);

  const handleDragStart = useCallback((e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
    setIsDragging(true);
  }, [index]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const fromIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
    if (!isNaN(fromIndex) && fromIndex !== index) {
      onMove(fromIndex, index);
    }
  }, [index, onMove]);

  return (
    <div
      ref={itemRef}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative transition-all ${isDragging ? "opacity-50 scale-[0.98]" : ""} ${isOver ? "border-t-2 border-primary" : ""} ${className}`}
    >
      {dragHandle && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground px-1" title="拖拽排序">
          <GripVertical className="h-3.5 w-5" />
        </div>
      )}
      {children}
    </div>
  );
}
