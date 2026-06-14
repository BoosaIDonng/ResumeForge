'use client';
import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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
} from 'lucide-react';
import type { ResumeData } from '@/components/resume/resumeData';
import { MODULE_REGISTRY } from '@/components/resume/resumeData';

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

function getIcon(id: string): React.ElementType {
  return ICON_MAP[id] || FileText;
}

function getLabel(id: string): string {
  return MODULE_REGISTRY.find(m => m.id === id)?.label || id;
}

function isRemovable(id: string): boolean {
  return MODULE_REGISTRY.find(m => m.id === id)?.removable ?? true;
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
// Single sidebar item
// ============================================================

interface SidebarItemProps {
  id: string;
  data: ResumeData;
  isActive: boolean;
  isDragOver: boolean;
  showRemove: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragOver: (e: React.DragEvent, id: string) => void;
  onDrop: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
}

function SidebarItem({
  id, data, isActive, isDragOver, showRemove, canMoveUp, canMoveDown,
  onSelect, onRemove, onMoveUp, onMoveDown,
  onDragStart, onDragOver, onDrop, onDragEnd,
}: SidebarItemProps) {
  const Icon = getIcon(id);
  const count = getItemCount(id, data);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, id)}
      onDragOver={(e) => onDragOver(e, id)}
      onDrop={(e) => onDrop(e, id)}
      onDragEnd={onDragEnd}
      onClick={() => onSelect(id)}
      className={cn(
        'group flex items-center gap-2 px-2 py-2 mx-1 rounded-lg cursor-pointer transition-all',
        'border-t-2',
        isActive
          ? 'bg-primary/5 text-primary border-primary/10'
          : 'text-muted-foreground hover:bg-muted/50 border-transparent',
        isDragOver && 'border-primary/80 bg-primary/5'
      )}
    >
      {/* Drag handle */}
      <GripVertical className="size-3.5 text-border cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity shrink-0 hidden lg:block" />

      {/* Icon */}
      <Icon className={cn(
        'size-4 shrink-0',
        isActive ? 'text-primary' : 'text-muted-foreground/60'
      )} />

      {/* Label + badges */}
      <div className="flex-1 flex items-center justify-between min-w-0">
        <span className={cn('text-sm truncate hidden lg:inline', isActive && 'font-medium')} title={getLabel(id)}>
          {getLabel(id)}
        </span>
        <div className="flex items-center gap-1">
          {count > 0 && (
            <Badge variant={isActive ? 'default' : 'secondary'} className="h-5 min-w-5 text-[10px] px-1.5 hidden lg:flex">
              {count}
            </Badge>
          )}
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
// Main component
// ============================================================

interface Props {
  data: ResumeData;
  activeSection: string;
  onSelect: (sectionId: string) => void;
  onReorder: (enabledSections: string[]) => void;
  onEnable: (sectionId: string) => void;
  onDisable: (sectionId: string) => void;
}

export default function EditorSidebar({ data, activeSection, onSelect, onReorder, onEnable, onDisable }: Props) {
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragFromRef = useRef<string | null>(null);
  const dragSourceAreaRef = useRef<'enabled' | 'available' | null>(null);

  const enabledSections = data.enabledSections.filter(id => id !== 'design');
  const availableSections = MODULE_REGISTRY
    .filter(m => !enabledSections.includes(m.id) && m.removable)
    .map(m => m.id);

  // Drag handlers
  const handleDragStart = useCallback((e: React.DragEvent, id: string, area: 'enabled' | 'available') => {
    dragFromRef.current = id;
    dragSourceAreaRef.current = area;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragFromRef.current && dragFromRef.current !== id) {
      setDragOverId(id);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, toId: string, targetArea: 'enabled' | 'available') => {
    e.preventDefault();
    const fromId = dragFromRef.current;
    const sourceArea = dragSourceAreaRef.current;
    if (!fromId) return;

    // Case 1: Reorder within enabled area
    if (sourceArea === 'enabled' && targetArea === 'enabled') {
      const fromIdx = enabledSections.indexOf(fromId);
      const toIdx = enabledSections.indexOf(toId);
      if (fromIdx !== -1 && toIdx !== -1 && fromIdx !== toIdx) {
        const newOrder = [...enabledSections];
        newOrder.splice(fromIdx, 1);
        newOrder.splice(toIdx, 0, fromId);
        onReorder(newOrder);
      }
    }
    // Case 2: Drag from available to enabled → enable at drop position
    else if (sourceArea === 'available' && targetArea === 'enabled') {
      const toIdx = enabledSections.indexOf(toId);
      const newOrder = [...enabledSections];
      newOrder.splice(toIdx, 0, fromId);
      onReorder(newOrder);
    }
    // Case 3: Drag from enabled to available → disable
    else if (sourceArea === 'enabled' && targetArea === 'available') {
      onDisable(fromId);
    }

    setDragOverId(null);
    dragFromRef.current = null;
    dragSourceAreaRef.current = null;
  }, [enabledSections, onReorder, onDisable]);

  const handleDragEnd = useCallback(() => {
    setDragOverId(null);
    dragFromRef.current = null;
    dragSourceAreaRef.current = null;
  }, []);

  // Move handlers (alternative to drag-and-drop for touch/keyboard)
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

        <div
          onDragOver={(e) => { e.preventDefault(); }}
          onDrop={(e) => {
            // Drop on empty enabled area (not on a specific item)
            if (dragSourceAreaRef.current === 'available' && !dragOverId) {
              e.preventDefault();
              const fromId = dragFromRef.current;
              if (fromId) {
                onEnable(fromId);
              }
              setDragOverId(null);
              dragFromRef.current = null;
              dragSourceAreaRef.current = null;
            }
          }}
        >
          {enabledSections.map((id, idx) => (
            <SidebarItem
              key={id}
              id={id}
              data={data}
              isActive={activeSection === id}
              isDragOver={dragOverId === id}
              showRemove={isRemovable(id)}
              canMoveUp={idx > 0}
              canMoveDown={idx < enabledSections.length - 1}
              onSelect={onSelect}
              onRemove={onDisable}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              onDragStart={(e, sid) => handleDragStart(e, sid, 'enabled')}
              onDragOver={handleDragOver}
              onDrop={(e, sid) => handleDrop(e, sid, 'enabled')}
              onDragEnd={handleDragEnd}
            />
          ))}
        </div>

        {/* ====== Available modules (lower area) ====== */}
        {availableSections.length > 0 && (
          <>
            <div className="hidden lg:block px-3 pt-4 pb-1 mt-2 mx-2 border-t border-border">
              <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">可添加模块</span>
            </div>

            <div
              onDragOver={(e) => { e.preventDefault(); }}
              onDrop={(e) => {
                // Drop on empty available area → disable
                if (dragSourceAreaRef.current === 'enabled' && !dragOverId) {
                  e.preventDefault();
                  const fromId = dragFromRef.current;
                  if (fromId) {
                    onDisable(fromId);
                  }
                  setDragOverId(null);
                  dragFromRef.current = null;
                  dragSourceAreaRef.current = null;
                }
              }}
            >
              {availableSections.map((id) => {
                const Icon = getIcon(id);
                return (
                  <div
                    key={id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, id, 'available')}
                    onDragOver={(e) => handleDragOver(e, id)}
                    onDrop={(e) => handleDrop(e, id, 'available')}
                    onDragEnd={handleDragEnd}
                    onClick={() => onEnable(id)}
                    className={cn(
                      'group flex items-center gap-2 px-2 py-2 mx-1 rounded-lg cursor-pointer transition-all',
                      'border-t-2 border-transparent',
                      'text-muted-foreground/60 hover:text-primary hover:bg-primary/5',
                      dragOverId === id && 'border-primary/80 bg-primary/5'
                    )}
                  >
                    <Plus className="size-3.5 text-border shrink-0" />
                    <Icon className="size-4 text-muted-foreground/60 shrink-0" />
                    <span className="text-sm truncate hidden lg:inline" title={getLabel(id)}>{getLabel(id)}</span>
                  </div>
                );
              })}
            </div>
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
