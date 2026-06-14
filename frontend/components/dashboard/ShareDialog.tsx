"use client";

import { useState, useEffect } from "react";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import type { ShareInfo } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock, Eye } from "lucide-react";

type Props = {
  open: boolean;
  resumeId: number | null;
  onClose: () => void;
};

export default function ShareDialog({ open, resumeId, onClose }: Props) {
  const [shareInfo, setShareInfo] = useState<ShareInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [enabling, setEnabling] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !resumeId) {
      setShareInfo(null);
      setPassword("");
      setCopied(false);
      setError(null);
      return;
    }
    setLoading(true);
    apiGet<ShareInfo>(`/api/resumes/${resumeId}/share`)
      .then(setShareInfo)
      .catch(() => setShareInfo(null))
      .finally(() => setLoading(false));
  }, [open, resumeId]);

  if (!open || !resumeId) return null;

  const shareUrl = shareInfo
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/share/${shareInfo.token}`
    : "";

  async function handleEnable() {
    setEnabling(true);
    setError(null);
    try {
      const info = await apiPost<ShareInfo>(`/api/resumes/${resumeId}/share`, {
        password: password.trim() || null,
      });
      setShareInfo(info);
    } catch (err) {
      setError(err instanceof Error ? err.message : "开启分享失败");
    } finally {
      setEnabling(false);
    }
  }

  async function handleDisable() {
    setDisabling(true);
    setError(null);
    try {
      await apiDelete(`/api/resumes/${resumeId}/share`);
      setShareInfo(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "关闭分享失败");
    } finally {
      setDisabling(false);
    }
  }

  function handleCopy() {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>分享简历</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
          </div>
        ) : shareInfo ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">分享已开启</span>
              <button
                onClick={handleDisable}
                disabled={disabling}
                className="rounded-lg border border-destructive/20 px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
              >
                {disabling ? "关闭中..." : "关闭分享"}
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground">
                分享链接
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  value={shareUrl}
                  readOnly
                  className="flex-1 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground"
                />
                <Button onClick={handleCopy}>
                  {copied ? "已复制" : "复制"}
                </Button>
              </div>
            </div>

            {shareInfo.hasPassword && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="h-4 w-4" />
                已设置访问密码
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              已访问 {shareInfo.viewCount} 次
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              开启分享后，其他人可以通过链接查看你的简历
            </p>

            <div>
              <label className="block text-sm font-medium text-muted-foreground">
                访问密码（可选）
              </label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="留空则无需密码"
                className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <Button className="w-full" onClick={handleEnable} disabled={enabling}>
              {enabling ? "开启中..." : "开启分享"}
            </Button>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
