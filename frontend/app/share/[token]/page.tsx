"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { apiGet } from "@/lib/api";
import type { PublicShareData } from "@/lib/types";
import { migrateResumeData } from "@/components/resume/resumeData";
import ResumePreview from "@/components/resume/ResumePreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Lock } from "lucide-react";

export default function ShareViewPage() {
  const params = useParams();
  const token = params.token as string;

  const [data, setData] = useState<PublicShareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [password, setPassword] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (!token) return;
    loadShare();
  }, [token]);

  async function loadShare(pass?: string) {
    setLoading(true);
    setError(null);
    try {
      const url = pass
        ? `/api/share/${token}?password=${encodeURIComponent(pass)}`
        : `/api/share/${token}`;
      const result = await apiGet<PublicShareData>(url);
      setData(result);
      setPasswordRequired(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "加载失败";
      if (msg.includes("密码")) {
        setPasswordRequired(true);
        setError(null);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setVerifying(true);
    loadShare(password).finally(() => setVerifying(false));
  }

  if (loading && !passwordRequired) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/40 border-t-primary" />
          <p className="mt-3 text-sm text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <X className="h-6 w-6 text-destructive" />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (passwordRequired) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-6 w-6 text-primary" />
            </div>
          </div>
          <h2 className="mt-4 text-center text-lg font-semibold text-foreground">
            需要密码访问
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            该简历已设置访问密码
          </p>
          <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-3">
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="请输入密码"
              autoFocus
            />
            <Button
              type="submit"
              disabled={verifying || !password.trim()}
              className="w-full"
            >
              {verifying ? "验证中..." : "访问"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const resumeData = migrateResumeData(JSON.parse(data.resumeData));

  return (
    <div className="min-h-screen bg-muted">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 h-12">
          <h1 className="text-sm font-semibold text-foreground">{data.title}</h1>
          <span className="text-xs text-muted-foreground/60">
            {data.viewCount} 次查看
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-lg">
          <ResumePreview data={resumeData} />
        </div>
      </main>
    </div>
  );
}
