"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";
import type { Resume } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (resume: Resume) => void;
};

const templates = [
  { id: "default", name: "默认", color: "bg-primary", desc: "简洁清晰的默认模板" },
  { id: "modern", name: "现代", color: "bg-accent", desc: "时尚现代的设计风格" },
  { id: "classic", name: "经典", color: "bg-success", desc: "传统专业的经典布局" },
  { id: "minimal", name: "简约", color: "bg-muted-foreground", desc: "极简风格突出内容" },
];

export default function CreateResumeDialog({ open, onClose, onCreate }: Props) {
  const [title, setTitle] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("default");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleCreate() {
    if (!title.trim()) {
      setError("请输入简历标题");
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const resume = await apiPost<Resume>("/api/resumes", {
        title: title.trim(),
        master: false,
      });
      onCreate(resume);
      setTitle("");
      setSelectedTemplate("default");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建失败");
    } finally {
      setCreating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>新建简历</DialogTitle>
        </DialogHeader>

        <div>
          <label className="block text-sm font-medium text-muted-foreground">
            简历标题
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例如：前端工程师简历"
            className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
            }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground">
            选择模板
          </label>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTemplate(t.id)}
                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all ${
                  selectedTemplate === t.id
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <div className={`h-16 w-full rounded ${t.color} opacity-80`} />
                <span className="text-sm font-medium text-foreground">{t.name}</span>
                <span className="text-xs text-muted-foreground">{t.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button
            onClick={handleCreate}
            disabled={creating}
          >
            {creating ? "创建中..." : "创建"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
