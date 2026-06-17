'use client';
import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  User,
  FileText,
  Link2,
  Briefcase,
  FolderKanban,
  GraduationCap,
  Wrench,
  Languages,
  Award,
  LayoutGrid,
  Palette,
  GripVertical,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
} from 'lucide-react';
import type { ResumeData } from '@/components/resume/resumeData';
import { MODULE_REGISTRY } from '@/components/resume/resumeData';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ============================================================
// Icon map
// ============================================================

const ICON_MAP: Record<string, React.ElementType> = {
  basics: User,
  summary: FileText,
  profiles: Link2,
  experience: Briefcase,
  projects: FolderKanban,
  education: GraduationCap,
  skills: Wrench,
  languages: Languages,
  certifications: Award,
  awards: Award,
  customSections: LayoutGrid,
  design: Palette,
};

function getLabel(id: string): string {
  return MODULE_REGISTRY.find(m => m.id === id)?.label || id;
}

function isRemovable(id: string): boolean {
  return MODULE_REGISTRY.find(m => m.id === id)?.removable ?? true;
}

// ============================================================
// Visibility helper
// ============================================================

function isSectionHidden(sectionId: string, data: ResumeData): boolean {
  if (sectionId === 'summary') return data.summary.hidden;
  if (sectionId === 'customSections') return data.customSections.every(s => s.hidden);
  const section = data.sections[sectionId as keyof typeof data.sections];
  return section?.hidden ?? false;
}

// ============================================================
// Item count helper
// ============================================================

function getItemCount(sectionId: string, data: ResumeData): number {
  switch (sectionId) {
    case 'basics': return 1;
    case 'summary': return data.summary.content ? 1 : 0;
    case 'profiles': return data.sections.profiles.items.length;
    case 'experience': return data.sections.experience.items.length;
    case 'projects': return data.sections.projects.items.length;
    case 'education': return data.sections.education.items.length;
    case 'skills': return data.sections.skills.items.length;
    case 'languages': return data.sections.languages.items.length;
    case 'certifications': return data.sections.certifications.items.length;
    case 'awards': return data.sections.awards.items.length;
    case 'customSections': return data.customSections.length;
    case 'design': return 1;
    default: return 0;
  }
}

// ============================================================
// Single sidebar item (inner UI)
// ============================================================

interface SidebarItemProps {
  id: string;
  data: ResumeData;
  isActive: boolean;
  isHidden: boolean;
  showRemove: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
  isDragging?: boolean;
  isOver?: boolean;
  dragHandleProps?: Record<string, any>;
}

function SidebarItem({
  id, data, isActive, isHidden, showRemove, canMoveUp, canMoveDown,
  onSelect, onRemove, onMoveUp, onMoveDown, onToggleVisibility, onRename,
  isDragging, isOver, dragHandleProps,
}: SidebarItemProps) {
  const Icon = ICON_MAP[id] || FileText;
  const count = getItemCount(id, data);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function startRename() {
    if (id !== 'customSections') return;
    setEditValue(getLabel(id));
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }

  function commitRename() {
    const trimmed = editValue.trim();
    if (trimmed) onRename(id, trimmed);
    setEditing(false);
  }

  return (
    <div
      onClick={() => !editing && onSelect(id)}
      onDoubleClick={() => startRename()}
      className={cn(
        'group flex items-center gap-2 px-2 py-2 mx-1 rounded-lg cursor-pointer transition-all',
        'border-t-2',
        isActive
          ? 'bg-primary/5 text-primary border-primary/10'
          : 'text-muted-foreground hover:bg-muted/50 border-transparent',
        isOver && 'border-primary/80 bg-primary/5',
        isDragging && 'opacity-50 shadow-lg',
        isHidden && 'opacity-50'
      )}
    >
      {/* Drag handle */}
      <div {...dragHandleProps} className="hidden lg:block">
        <GripVertical className="size-3.5 text-border cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
      </div>

      {/* Icon */}
      <Icon className={cn(
        'size-4 shrink-0',
        isActive ? 'text-primary' : 'text-muted-foreground/60'
      )} />

      {/* Label + badges */}
      <div className="flex-1 flex items-center justify-between min-w-0">
        {editing ? (
          <input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename();
              if (e.key === 'Escape') setEditing(false);
            }}
            className="w-full h-5 text-sm bg-background border border-primary px-1 outline-none"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className={cn('text-sm truncate hidden lg:inline', isActive && 'font-medium')} title={getLabel(id)}>
            {getLabel(id)}
          </span>
        )}
        <div className="flex items-center gap-1">
          {count > 0 && (
            <Badge variant={isActive ? 'default' : 'secondary'} className="h-5 min-w-5 text-[10px] px-1.5 hidden lg:flex">
              {count}
            </Badge>
          )}
          {/* Visibility toggle */}
          <button
            onClick={(e) => { e.stopPropagation(); onToggleVisibility(id); }}
            className="opacity-0 group-hover:opacity-100 text-muted-foreground/60 hover:text-foreground transition-all p-0.5 hidden lg:block"
            title={isHidden ? "显示此模块" : "隐藏此模块"}
          >
            {isHidden ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
          </button>
          {showRemove && (
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(id); }}
              className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 text-muted-foreground/60 hover:text-destructive transition-all p-0.5 rounded hidden lg:block"
              title="移除此模块"
            >
              <X className="size-3" />
            </button>
          )}
          <div className="hidden lg:flex items-center gap-0.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); onMoveUp(id); }}
              disabled={!canMoveUp}
              className="p-0.5 text-muted-foreground/60 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="上移"
              aria-label="上移模块"
            >
              <ChevronUp className="size-3" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onMoveDown(id); }}
              disabled={!canMoveDown}
              className="p-0.5 text-muted-foreground/60 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="下移"
              aria-label="下移模块"
            >
              <ChevronDown className="size-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Sortable wrapper for sidebar items
// ============================================================

function SortableSidebarItem({
  id, data, isActive, isHidden, showRemove, canMoveUp, canMoveDown,
  onSelect, onRemove, onMoveUp, onMoveDown, onToggleVisibility, onRename,
}: Omit<SidebarItemProps, 'isDragging' | 'isOver' | 'dragHandleProps'>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <SidebarItem
        id={id}
        data={data}
        isActive={isActive}
        isHidden={isHidden}
        showRemove={showRemove}
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
        onSelect={onSelect}
        onRemove={onRemove}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onToggleVisibility={onToggleVisibility}
        onRename={onRename}
        isDragging={isDragging}
        isOver={isOver}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

// ============================================================
// Main component
// ============================================================

interface Props {
  data: ResumeData;
  activeSection: string;
  onSelect: (sectionId: string) => void;
  onReorder: (enabledSections: string[]) => void;
  onEnable: (sectionId: string) => void;
  onDisable: (sectionId: string) => void;
  onToggleVisibility: (sectionId: string) => void;
  onRename: (sectionId: string, newTitle: string) => void;
}

export default function EditorSidebar({ data, activeSection, onSelect, onReorder, onEnable, onDisable, onToggleVisibility, onRename }: Props) {
  const enabledSections = data.enabledSections.filter(id => id !== 'design');
  const availableSections = MODULE_REGISTRY
    .filter(m => !enabledSections.includes(m.id) && m.removable)
    .map(m => m.id);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Move handlers (keyboard-accessible alternative)
  const handleMoveUp = useCallback((id: string) => {
    const idx = enabledSections.indexOf(id);
    if (idx <= 0) return;
    const newOrder = [...enabledSections];
    [newOrder[idx - 1], newOrder[idx]] = [newOrder[idx], newOrder[idx - 1]];
    onReorder(newOrder);
  }, [enabledSections, onReorder]);

  const handleMoveDown = useCallback((id: string) => {
    const idx = enabledSections.indexOf(id);
    if (idx === -1 || idx >= enabledSections.length - 1) return;
    const newOrder = [...enabledSections];
    [newOrder[idx], newOrder[idx + 1]] = [newOrder[idx + 1], newOrder[idx]];
    onReorder(newOrder);
  }, [enabledSections, onReorder]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    // Case 1: Reorder within enabled sections
    if (enabledSections.includes(active.id as string) && enabledSections.includes(over.id as string)) {
      if (active.id !== over.id) {
        const oldIndex = enabledSections.indexOf(active.id as string);
        const newIndex = enabledSections.indexOf(over.id as string);
        const newOrder = [...enabledSections];
        newOrder.splice(oldIndex, 1);
        newOrder.splice(newIndex, 0, active.id as string);
        onReorder(newOrder);
      }
    }
    // Case 2: Available section dropped on enabled → enable
    else if (availableSections.includes(active.id as string) && enabledSections.includes(over.id as string)) {
      const toIdx = enabledSections.indexOf(over.id as string);
      const newOrder = [...enabledSections];
      newOrder.splice(toIdx, 0, active.id as string);
      onReorder(newOrder);
    }
  }

  function handleDragOver(event: DragOverEvent) {
    // Enable visual feedback is handled by isOver in SortableSidebarItem
  }

  return (
    <nav className="flex flex-col w-14 lg:w-48 shrink-0 border-r border-border bg-background overflow-hidden">
      {/* Header */}
      <div className="hidden lg:flex items-center gap-2 px-3 py-3 border-b border-border">
        <LayoutGrid className="size-4 text-muted-foreground/60" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">模块导航</span>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {/* ====== Enabled modules (upper area) ====== */}
        <div className="hidden lg:block px-3 pt-2 pb-1">
          <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">已启用模块</span>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} onDragOver={handleDragOver}>
          <SortableContext items={enabledSections} strategy={verticalListSortingStrategy}>
            {enabledSections.map((id, idx) => (
              <SortableSidebarItem
                key={id}
                id={id}
                data={data}
                isActive={activeSection === id}
                isHidden={isSectionHidden(id, data)}
                showRemove={isRemovable(id)}
                canMoveUp={idx > 0}
                canMoveDown={idx < enabledSections.length - 1}
                onSelect={onSelect}
                onRemove={onDisable}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                onToggleVisibility={onToggleVisibility}
                onRename={onRename}
              />
            ))}
          </SortableContext>
        </DndContext>

        {/* ====== Available modules (lower area) ====== */}
        {availableSections.length > 0 && (
          <>
            <div className="hidden lg:block px-3 pt-4 pb-1 mt-2 mx-2 border-t border-border">
              <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">可添加模块</span>
            </div>

            {availableSections.map((id) => {
              const Icon = ICON_MAP[id] || FileText;
              return (
                <div
                  key={id}
                  onClick={() => onEnable(id)}
                  className={cn(
                    'group flex items-center gap-2 px-2 py-2 mx-1 rounded-lg cursor-pointer transition-all',
                    'border-t-2 border-transparent',
                    'text-muted-foreground/60 hover:text-primary hover:bg-primary/5'
                  )}
                >
                  <Plus className="size-3.5 text-border shrink-0" />
                  <Icon className="size-4 text-muted-foreground/60 shrink-0" />
                  <span className="text-sm truncate hidden lg:inline" title={getLabel(id)}>{getLabel(id)}</span>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="hidden lg:flex items-center justify-between px-3 py-2 border-t border-border">
        <span className="text-[10px] text-muted-foreground/60">
          {enabledSections.length} / {MODULE_REGISTRY.filter(m => m.id !== 'design').length} 模块已启用
        </span>
      </div>
    </nav>
  );
}
