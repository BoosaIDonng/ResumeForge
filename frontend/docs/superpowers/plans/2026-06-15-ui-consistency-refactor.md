# UI 一致性重构计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将全部前端页面和组件统一到编辑风（Editorial）设计系统，消除两套设计语言并存的问题。

**Architecture:** 分 6 个阶段按优先级推进：P0 紧急修复 → P1 Token 一致性 → P1 页面布局统一 → P2 shadcn 组件迁移 → P2 视觉细节 → P3 收尾。每个 Task 产出独立可验证的改动。

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4, shadcn/ui (Base UI), TypeScript

**Design System Reference (`globals.css`):**
- `--radius: 0rem`（全局直角）
- `--font-heading: "Lora"`（衬线标题字体）
- `--primary: oklch(0.48 0.16 28)`（酒红/burgundy）
- 语义 Token: `--success`, `--warning`, `--destructive`, `--accent-strong`
- 工具类: `.text-display`, `.text-display-sm`, `.text-eyebrow`, `.rule-double`, `.rule-section`

---

## Phase 1: P0 — 紧急修复

### Task 1: 重写 DataBackup.tsx

**Files:**
- Modify: `components/DataBackup.tsx`

- [ ] **Step 1: 重写组件，使用 shadcn Button + AlertDialog + Toast**

将整个文件替换为以下内容：

```tsx
'use client';

import { useState } from 'react';
import { Download, Upload, Trash2 } from 'lucide-react';
import { dataTransfer } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function DataBackup() {
  const [importing, setImporting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleExport = () => {
    const json = dataTransfer.exportAll();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-resume-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('数据已导出');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      dataTransfer.importAll(text);
      toast.success('导入成功，页面将刷新');
      setTimeout(() => window.location.reload(), 800);
    } catch {
      toast.error('导入失败：文件格式错误');
    } finally {
      setImporting(false);
    }
  };

  const handleClear = () => {
    dataTransfer.clearAll();
    toast.success('数据已清除，页面将刷新');
    setTimeout(() => window.location.reload(), 800);
  };

  return (
    <div className="space-y-4 border-b border-border p-6">
      <div>
        <h3 className="text-display-sm text-foreground">数据管理</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          所有数据保存在浏览器本地。清除浏览器数据会丢失简历，请定期备份。
        </p>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4" />
          导出数据
        </Button>
        <Button variant="outline" size="sm" asChild disabled={importing}>
          <label className="cursor-pointer">
            <Upload className="h-4 w-4" />
            {importing ? '导入中...' : '导入数据'}
            <input type="file" accept=".json" onChange={handleImport} className="hidden" disabled={importing} />
          </label>
        </Button>
        <Button variant="destructive" size="sm" onClick={() => setConfirmOpen(true)}>
          <Trash2 className="h-4 w-4" />
          清除所有
        </Button>
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setConfirmOpen(false)}>
          <div className="w-full max-w-sm border border-border bg-popover p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-heading font-bold text-foreground">确认清除</h3>
            <p className="mt-2 text-sm text-muted-foreground">确定要清除所有数据吗？此操作不可恢复。</p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setConfirmOpen(false)}>取消</Button>
              <Button variant="destructive" size="sm" onClick={handleClear}>确认清除</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 验证构建**

Run: `npx tsc --noEmit && npx next build`
Expected: 0 errors, build succeeds

- [ ] **Step 3: Commit**

```bash
git add components/DataBackup.tsx
git commit -m "fix: rewrite DataBackup with shadcn components and design tokens"
```

---

## Phase 2: P1 — Token 一致性

### Task 2: 统一 Primary Hover（5个文件）

**Files:**
- Modify: `components/analysis/AnalysisReport.tsx`
- Modify: `components/interview/InterviewQuestionCard.tsx`
- Modify: `components/ai/VersionHistoryPanel.tsx`
- Modify: `components/TaskProgress.tsx`
- Modify: `components/resume/ResumeForm.tsx`

- [ ] **Step 1: 全局替换 `hover:bg-primary/90` → `hover:bg-primary-hover`**

在 5 个文件中，将所有 `hover:bg-primary/90` 替换为 `hover:bg-primary-hover`。

具体位置（按文件）：

1. `components/analysis/AnalysisReport.tsx` — 搜索 `hover:bg-primary/90`，替换为 `hover:bg-primary-hover`
2. `components/interview/InterviewQuestionCard.tsx` — 同上
3. `components/ai/VersionHistoryPanel.tsx` — 同上
4. `components/TaskProgress.tsx` — 同上
5. `components/resume/ResumeForm.tsx` — 同上

- [ ] **Step 2: 验证构建**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "fix: standardize primary hover color to primary-hover token"
```

### Task 3: 修复 Toggle 开关 bg-white（2个文件）

**Files:**
- Modify: `app/settings/page.tsx`
- Modify: `components/SettingsDialog.tsx`

- [ ] **Step 1: 替换 settings/page.tsx 中的 bg-white**

在 `app/settings/page.tsx` 中，找到 toggle 开关的 knob：
```
bg-white shadow
```
替换为：
```
bg-primary-foreground shadow
```

- [ ] **Step 2: 替换 SettingsDialog.tsx 中的 bg-white**

在 `components/SettingsDialog.tsx` 中，执行相同替换：`bg-white` → `bg-primary-foreground`（仅 toggle knob 处）。

- [ ] **Step 3: 验证构建**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "fix: replace hardcoded bg-white in toggle switches with token"
```

---

## Phase 3: P1 — 页面标题与布局统一

### Task 4: 统一 interviews/new 页面标题

**Files:**
- Modify: `app/interviews/new/page.tsx`

- [ ] **Step 1: 将 TaskProgress 加载态标题改为编辑风**

找到（约 line 87-88）：
```tsx
<div className="max-w-lg mx-auto py-12 px-4">
  <h1 className="text-2xl font-bold text-foreground mb-6">
    正在生成面试题目
  </h1>
```
替换为：
```tsx
<div className="mx-auto max-w-3xl px-6 py-0">
  <div className="border-b-[3px] border-double border-border py-6">
    <p className="text-eyebrow mb-1">面试准备</p>
    <h1 className="text-display-sm text-foreground">正在生成面试题目</h1>
  </div>
  <div className="border-b border-border py-6">
```

- [ ] **Step 2: 将主表单标题改为编辑风**

找到（约 line 102-107）：
```tsx
<div className="max-w-lg mx-auto py-10 px-4">
  <h1 className="text-2xl font-bold text-foreground mb-2">
    创建模拟面试
  </h1>
  <p className="text-sm text-muted-foreground mb-8">选择面试官人格和参数，AI 将根据简历和 JD 生成针对性问题</p>
```
替换为：
```tsx
<div className="mx-auto max-w-3xl px-6 py-0">
  {/* Masthead */}
  <div className="border-b-[3px] border-double border-border py-6">
    <p className="text-eyebrow mb-1">面试准备</p>
    <h1 className="text-display-sm text-foreground">创建模拟面试</h1>
  </div>
  <p className="text-sm text-muted-foreground py-4">选择面试官人格和参数，AI 将根据简历和 JD 生成针对性问题</p>
```

- [ ] **Step 3: 验证构建**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 4: Commit**

```bash
git add app/interviews/new/page.tsx
git commit -m "fix: apply editorial heading style to interviews/new page"
```

### Task 5: 统一 interviews/[id] 页面标题

**Files:**
- Modify: `app/interviews/[id]/page.tsx`

- [ ] **Step 1: 将标题改为编辑风**

找到所有 `text-2xl font-bold text-foreground` 的 `<h1>`，替换为 `text-display-sm text-foreground`。

在第一个 `<h1>` 之前添加报头结构：
```tsx
<p className="text-eyebrow mb-1">模拟面试</p>
```

将页面外层容器从 `max-w-2xl mx-auto py-8 px-4` 改为 `mx-auto max-w-3xl px-6 py-0`。

在每个标题区域添加 `border-b-[3px] border-double border-border py-6` 包裹。

- [ ] **Step 2: 验证构建**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 3: Commit**

```bash
git add app/interviews/[id]/page.tsx
git commit -m "fix: apply editorial heading style to interview session page"
```

### Task 6: 统一 interviews/[id]/report 页面标题

**Files:**
- Modify: `app/interviews/[id]/report/page.tsx`

- [ ] **Step 1: 将标题改为编辑风**

找到 `text-2xl font-bold text-foreground`，替换为：
```tsx
<p className="text-eyebrow mb-1">面试报告</p>
<h1 className="text-display-sm text-foreground">面试反馈</h1>
```

将页面外层容器统一为 `mx-auto max-w-3xl px-6 py-0`，添加 `border-b-[3px] border-double border-border py-6` 报头。

- [ ] **Step 2: 验证 + Commit**

Run: `npx tsc --noEmit`
```bash
git add app/interviews/[id]/report/page.tsx
git commit -m "fix: apply editorial heading style to interview report page"
```

### Task 7: 统一 optimization/[proposalId] 页面标题

**Files:**
- Modify: `app/optimization/[proposalId]/page.tsx`

- [ ] **Step 1: 将标题改为编辑风**

找到所有 `text-2xl font-bold text-foreground`，替换为 `text-display-sm text-foreground`。

在标题前添加 `<p className="text-eyebrow mb-1">优化方案</p>`。

将页面外层容器统一为 `mx-auto max-w-3xl px-6 py-0`，添加 `border-double` 报头。

- [ ] **Step 2: 验证 + Commit**

Run: `npx tsc --noEmit`
```bash
git add app/optimization/[proposalId]/page.tsx
git commit -m "fix: apply editorial heading style to optimization page"
```

### Task 8: 统一 jobs/[id]/analysis 页面标题

**Files:**
- Modify: `app/jobs/[id]/analysis/page.tsx`

- [ ] **Step 1: 将标题改为编辑风**

找到 `text-2xl font-bold text-foreground`，替换为 `text-display-sm text-foreground`。

在标题前添加 `<p className="text-eyebrow mb-1">JD 分析</p>`。

将页面外层容器统一为 `mx-auto max-w-3xl px-6 py-0`，添加 `border-double` 报头。

- [ ] **Step 2: 验证 + Commit**

Run: `npx tsc --noEmit`
```bash
git add app/jobs/[id]/analysis/page.tsx
git commit -m "fix: apply editorial heading style to analysis report page"
```

---

## Phase 4: P2 — shadcn 组件迁移

### Task 9: 迁移核心页面的原生 button → shadcn Button

**Files:**
- Modify: `components/analysis/AnalysisReport.tsx`
- Modify: `components/interview/InterviewQuestionCard.tsx`
- Modify: `components/TaskProgress.tsx`
- Modify: `components/dashboard/TourOverlay.tsx`
- Modify: `components/dashboard/ResumeCard.tsx`
- Modify: `components/dashboard/ResumeListItem.tsx`

- [ ] **Step 1: AnalysisReport.tsx — 替换原生 button**

添加 import：
```tsx
import { Button } from "@/components/ui/button";
```

将原生 `<button className="... bg-primary text-primary-foreground hover:bg-primary-hover ...">` 替换为：
```tsx
<Button variant="default" size="sm">
```

将原生 `<button className="... border border-border ... hover:bg-muted ...">` 替换为：
```tsx
<Button variant="outline" size="sm">
```

- [ ] **Step 2: InterviewQuestionCard.tsx — 替换原生 button**

同上模式。添加 `Button` import，将 `<button>` 替换为 `<Button>`。

- [ ] **Step 3: TaskProgress.tsx — 替换原生 button**

同上模式。

- [ ] **Step 4: TourOverlay.tsx — 替换底部导航 button**

将 tooltip 中的 `<button>` 替换为 `<Button variant="default" size="sm">`。

- [ ] **Step 5: ResumeCard.tsx — 替换下拉菜单和操作按钮**

将自定义下拉菜单替换为 shadcn `DropdownMenu`：
```tsx
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
```

用 `<DropdownMenu>` + `<DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>` + `<DropdownMenuContent>` 替换手动 `<div>` 下拉。

将内联重命名 input 和操作按钮保留原生（因为它们需要特殊交互），但视觉上使用 token。

- [ ] **Step 6: ResumeListItem.tsx — 同 ResumeCard 处理**

同 Step 5 的模式。

- [ ] **Step 7: 验证构建**

Run: `npx tsc --noEmit && npx next build`
Expected: 0 errors, build succeeds

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "refactor: migrate raw buttons to shadcn Button in core components"
```

### Task 10: 迁移 AI 组件的原生 input/select/textarea → shadcn 组件

**Files:**
- Modify: `components/ai/GenerateResumeDialog.tsx`
- Modify: `components/ai/CoverLetterDialog.tsx`
- Modify: `components/ai/JdAnalysisDialog.tsx`
- Modify: `components/ai/TranslateDialog.tsx`

- [ ] **Step 1: GenerateResumeDialog.tsx**

添加 import：
```tsx
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
```

删除 `inputClass` 变量定义。

将原生 `<input className={inputClass} ...>` 替换为 `<Input .../>`。
将原生 `<textarea className={...} ...>` 替换为 `<Textarea .../>`。
将原生 `<select>` 替换为 shadcn `<Select>` 组件模式：
```tsx
<Select value={language} onValueChange={setLanguage}>
  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
  <SelectContent>
    <SelectItem value="zh">中文</SelectItem>
    ...
  </SelectContent>
</Select>
```

将原生 `<label>` 替换为 `<Label>`。

- [ ] **Step 2: CoverLetterDialog.tsx**

同 Step 1 模式，替换 textarea、select。

- [ ] **Step 3: JdAnalysisDialog.tsx**

同 Step 1 模式，替换 textarea。

- [ ] **Step 4: TranslateDialog.tsx**

此文件的 language/mode 选择器使用自定义 `<button>` 样式选择器，保留现有模式（视觉上已 token 合规），仅替换普通 input/textarea（如果有的话）。

- [ ] **Step 5: 验证构建**

Run: `npx tsc --noEmit && npx next build`
Expected: 0 errors

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor: migrate AI dialog inputs to shadcn Input/Textarea/Select"
```

### Task 11: 迁移页面级原生表单元素

**Files:**
- Modify: `app/jobs/new/page.tsx`
- Modify: `app/interviews/new/page.tsx`
- Modify: `app/settings/page.tsx`
- Modify: `app/share/[token]/page.tsx`
- Modify: `app/applications/page.tsx`

- [ ] **Step 1: 在每个文件中添加 shadcn form imports**

```tsx
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
```

（仅添加该文件实际用到的类型）

- [ ] **Step 2: 逐文件替换原生元素**

对每个文件：
1. 删除本地 `inputClass` / `labelClass` 变量定义
2. 将 `<input className={inputClass} ...>` 替换为 `<Input .../>`
3. 将 `<textarea className={...} ...>` 替换为 `<Textarea .../>`
4. 将 `<label className={labelClass}>` 替换为 `<Label>`
5. 保留原生 `<select>` 暂不迁移（shadcn Select 的 API 变化较大，可单独处理）

- [ ] **Step 3: 验证构建**

Run: `npx tsc --noEmit && npx next build`
Expected: 0 errors

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor: migrate page-level form elements to shadcn Input/Textarea/Label"
```

---

## Phase 5: P2 — 视觉细节统一

### Task 12: 统一 ScoreBadge 和状态标签为直角

**Files:**
- Modify: `components/ScoreBadge.tsx`
- Modify: `components/optimization/ChangePreview.tsx`
- Modify: `components/interview/InterviewQuestionCard.tsx`

- [ ] **Step 1: ScoreBadge.tsx — 移除 rounded-full**

找到 `rounded-full`，替换为空（移除该 class），添加 `border border-border` 使其变为方形带边框标签。

将：
```
className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ..."
```
改为：
```
className="inline-flex items-center border border-border px-2 py-0.5 text-xs font-bold tabular-nums ..."
```

- [ ] **Step 2: ChangePreview.tsx — 移除状态标签 rounded-full**

找到 status badge 中的 `rounded-full`，替换为方形样式 `border border-border`。

- [ ] **Step 3: InterviewQuestionCard.tsx — 序号标签直角化**

找到 number badge 中的 `rounded-full`，移除或替换为直角。

- [ ] **Step 4: 验证构建 + Commit**

Run: `npx tsc --noEmit`
```bash
git add -A
git commit -m "fix: replace rounded-full badges with square editorial style"
```

### Task 13: 替换 AnalysisReport 中的 emoji 为 lucide 图标

**Files:**
- Modify: `components/analysis/AnalysisReport.tsx`

- [ ] **Step 1: 替换 emoji 💡 为 lucide Lightbulb**

添加 import（如果不存在）：
```tsx
import { Lightbulb } from "lucide-react";
```

找到 emoji `💡` 的使用位置，替换为：
```tsx
<Lightbulb className="h-4 w-4 text-warning" />
```

- [ ] **Step 2: 验证 + Commit**

Run: `npx tsc --noEmit`
```bash
git add components/analysis/AnalysisReport.tsx
git commit -m "fix: replace emoji with lucide icon in AnalysisReport"
```

### Task 14: 清理 EnrichmentRegenerateButton 多余 rounded-none

**Files:**
- Modify: `components/ai/EnrichmentRegenerateButton.tsx`

- [ ] **Step 1: 移除所有 rounded-none**

由于全局 `--radius: 0rem`，所有 `rounded-lg`/`rounded-md` 已自动解析为 `0rem`。移除所有显式 `rounded-none` class。

- [ ] **Step 2: 验证 + Commit**

Run: `npx tsc --noEmit`
```bash
git add components/ai/EnrichmentRegenerateButton.tsx
git commit -m "cleanup: remove redundant rounded-none overrides"
```

---

## Phase 6: P3 — 收尾

### Task 15: 统一页面宽度

**Files:**
- Modify: `app/interviews/new/page.tsx`
- Modify: `app/interviews/[id]/page.tsx`
- Modify: `app/interviews/[id]/report/page.tsx`
- Modify: `app/optimization/[proposalId]/page.tsx`
- Modify: `app/jobs/[id]/analysis/page.tsx`

- [ ] **Step 1: 统一外层容器**

列表/表单页：`mx-auto max-w-3xl px-6 py-0`
详情/报告页：`mx-auto max-w-3xl px-6 py-0`

将所有 `max-w-lg mx-auto py-12 px-4` / `max-w-2xl mx-auto py-8 px-4` 替换为上述统一值。

- [ ] **Step 2: 验证 + Commit**

Run: `npx tsc --noEmit && npx next build`
```bash
git add -A
git commit -m "fix: standardize page container widths across all pages"
```

### Task 16: 统一 label 样式

**Files:**
- Modify: `app/interviews/new/page.tsx`（以及其他未使用 `tracking-wide uppercase` 的页面）

- [ ] **Step 1: 迁移到 shadcn Label**

在 Phase 4 Task 11 中已迁移大部分。此步骤确保所有剩余的 `<label>` 元素使用 shadcn `<Label>` 组件。

- [ ] **Step 2: 最终全量验证**

Run: `npx tsc --noEmit && npx next build`
Expected: 0 errors, all 13 routes compile

- [ ] **Step 3: 最终 Commit**

```bash
git add -A
git commit -m "fix: complete UI consistency refactor - all labels unified"
```

---

## Verification Checklist

完成所有 Task 后，逐项检查：

- [ ] `npx tsc --noEmit` — 0 errors
- [ ] `npx next build` — 全部路由编译成功
- [ ] Dashboard 页面 — 标题使用 `text-display` + `text-eyebrow` + `border-double`
- [ ] 面试/优化/分析页面 — 标题样式与 Dashboard 一致
- [ ] 所有页面 — primary 按钮 hover 使用 `bg-primary-hover`
- [ ] 所有页面 — 无 `bg-blue-600`/`bg-red-600`/`bg-green-600` 硬编码
- [ ] 所有 toggle 开关 — knob 使用 `bg-primary-foreground`
- [ ] 所有 badge/标签 — 直角方形（非 `rounded-full`）
- [ ] shadcn `Button`/`Input`/`Textarea`/`Label` 组件被广泛使用
- [ ] 无多余的 `rounded-none` 覆盖

## File Impact Summary

| Phase | 文件数量 | 变更类型 |
|-------|---------|---------|
| Phase 1 (P0) | 1 | 完全重写 |
| Phase 2 (P1) | 7 | Token 替换 |
| Phase 3 (P1) | 5 | 标题+布局重构 |
| Phase 4 (P2) | ~15 | 组件迁移 |
| Phase 5 (P2) | 4 | 视觉细节 |
| Phase 6 (P3) | 5 | 布局统一 |
| **Total** | **~30 files** | |
