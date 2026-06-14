"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Bot, Send, Trash2, Check, FilePen, Sparkles, Wrench, Plus, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { getAIHeaders } from "@/lib/ai-settings";
import { toolChat, type ToolCallResult, type ToolChatResponse } from "@/lib/ai-api";

type Message = {
  role: "user" | "assistant";
  content: string;
  toolCalls?: ToolCallResult[];
  resumeModified?: boolean;
};

type Props = {
  resumeId?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResumeUpdated?: () => void;
  pendingMessage?: string | null;
  onPendingMessageConsumed?: () => void;
};

const STORAGE_PREFIX = "ai-chat-";

function loadHistory(resumeId?: number): Message[] {
  if (typeof window === "undefined") return [];
  const key = `${STORAGE_PREFIX}${resumeId ?? "general"}`;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(resumeId: number | undefined, messages: Message[]) {
  if (typeof window === "undefined") return;
  const key = `${STORAGE_PREFIX}${resumeId ?? "general"}`;
  localStorage.setItem(key, JSON.stringify(messages.slice(-50)));
}

const TOOL_LABELS: Record<string, string> = {
  update_section: "修改栏目",
  rewrite_text: "改写文字",
  add_skills: "添加技能",
  add_item: "添加条目",
};

const TOOL_ICONS: Record<string, LucideIcon> = {
  update_section: FilePen,
  rewrite_text: Sparkles,
  add_skills: Wrench,
  add_item: Plus,
};

export default function AiChatPanel({ resumeId, open, onOpenChange, onResumeUpdated, pendingMessage, onPendingMessageConsumed }: Props) {
  const [messages, setMessages] = useState<Message[]>(() => loadHistory(resumeId));
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pendingSentRef = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    saveHistory(resumeId, messages);
  }, [messages, resumeId]);

  // Reset the pending flag when a new pendingMessage arrives
  useEffect(() => {
    if (!pendingMessage) {
      pendingSentRef.current = false;
    }
  }, [pendingMessage]);

  const sendMessage = useCallback(async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;

    setError("");
    const userMsg: Message = { role: "user", content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      let response: ToolChatResponse;

      if (resumeId) {
        // Use tool-calling endpoint when we have a resume
        const history = updated.slice(0, -1).map((m) => ({ role: m.role, content: m.content }));
        response = await toolChat(resumeId, text, history);
      } else {
        // Fallback to basic chat
        const headers = getAIHeaders();
        const payload = { messages: updated.map((m) => ({ role: m.role, content: m.content })), resumeId };
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080"}/api/ai/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...headers },
          body: JSON.stringify(payload),
        });
        const body = await res.json();
        if (!res.ok || !body.success) throw new Error(body.message || "请求失败");
        response = { reply: body.data?.content ?? body.data ?? "", toolCalls: [], resumeModified: false };
      }

      const assistantMsg: Message = {
        role: "assistant",
        content: response.reply || "(AI 未返回文字回复)",
        toolCalls: response.toolCalls,
        resumeModified: response.resumeModified,
      };
      setMessages((prev) => [...prev, assistantMsg]);

      // If resume was modified, trigger reload
      if (response.resumeModified && onResumeUpdated) {
        onResumeUpdated();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "发送失败");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [input, loading, messages, resumeId]);

  // Auto-send pending message from external components (e.g. GrammarCheckPanel)
  useEffect(() => {
    if (pendingMessage && open && !loading && !pendingSentRef.current) {
      pendingSentRef.current = true;
      onPendingMessageConsumed?.();
      // Use setTimeout to ensure the panel is fully open before sending
      setTimeout(() => {
        sendMessage(pendingMessage);
      }, 100);
    }
  }, [pendingMessage, open, loading]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function clearHistory() {
    setMessages([]);
    saveHistory(resumeId, []);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-md p-0 gap-0">
        <SheetHeader className="flex-row items-center justify-between border-b pr-12 py-3">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <SheetTitle>AI 助手</SheetTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={clearHistory} className="text-xs text-muted-foreground">
            <Trash2 className="h-3.5 w-3.5" />
            清空
          </Button>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-12">
              <Bot className="h-12 w-12 mb-3 opacity-40" />
              <p className="text-sm">你好！我是 AI 简历助手</p>
              <p className="text-xs mt-1">可以帮你优化简历、回答问题、提供建议</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[85%] space-y-2`}>
                <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}>
                  <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                </div>

                {/* Tool call results */}
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="space-y-1.5">
                    {msg.toolCalls.map((tc, ti) => (
                      <div key={ti} className="rounded-lg border border-success/20 bg-success/5 px-3 py-2 text-xs">
                        <div className="flex items-center gap-1.5 font-medium text-success">
                          {(() => { const Icon = TOOL_ICONS[tc.tool] ?? Wrench; return <Icon className="h-3.5 w-3.5" />; })()}
                          <span>{TOOL_LABELS[tc.tool] || tc.tool}</span>
                        </div>
                        <p className="mt-1 text-muted-foreground">{tc.result}</p>
                      </div>
                    ))}
                    {msg.resumeModified && (
                      <div className="flex items-center gap-1 text-[10px] text-success">
                        <Check className="size-3" />
                        <span>简历已更新，编辑器已同步</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-muted px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {error && (
          <div className="border-t border-destructive/20 bg-destructive/5 px-4 py-2 text-xs text-destructive">
            {error}
          </div>
        )}

        <div className="border-t p-3">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入消息... (Enter 发送, Shift+Enter 换行)"
              rows={1}
              className="flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/20 min-h-[44px] max-h-32"
            />
            <Button
              size="icon"
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
