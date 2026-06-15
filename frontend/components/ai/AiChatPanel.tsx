"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Bot, Send, Trash2, FilePen, Sparkles, Wrench, Plus, Loader2, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { streamToolChat, type ToolCallResult } from "@/lib/ai-api";
import { resumeStorage } from "@/lib/storage";

type Message = {
  role: "user" | "assistant";
  content: string;
  toolCalls?: ToolCallResult[];
};

type Props = {
  resumeId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResumeUpdated?: () => void;
  pendingMessage?: string | null;
  onPendingMessageConsumed?: () => void;
};

const STORAGE_PREFIX = "ai-chat-";

function loadHistory(resumeId?: string): Message[] {
  if (typeof window === "undefined") return [];
  const key = `${STORAGE_PREFIX}${resumeId ?? "general"}`;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(resumeId: string | undefined, messages: Message[]) {
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
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    saveHistory(resumeId, messages);
  }, [messages, resumeId]);

  useEffect(() => {
    if (!pendingMessage) {
      pendingSentRef.current = false;
    }
  }, [pendingMessage]);

  useEffect(() => {
    return () => controllerRef.current?.abort();
  }, []);

  const sendMessage = useCallback(async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;

    setError("");
    const userMsg: Message = { role: "user", content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    // 插入占位助手消息，流式事件逐步填充
    const placeholder: Message = { role: "assistant", content: "", toolCalls: [] };
    setMessages([...updated, placeholder]);

    const history = updated.map((m) => ({ role: m.role, content: m.content }));
    let resumeData: string | undefined;
    if (resumeId) {
      const stored = resumeStorage.getById(resumeId);
      resumeData = typeof stored?.resumeData === "string" ? stored.resumeData : JSON.stringify(stored?.resumeData);
    }

    const fullReply = { current: "" };
    const toolCallsAcc: ToolCallResult[] = [];

    controllerRef.current = streamToolChat(
      { resumeData, message: text, history },
      (event) => {
        switch (event.type) {
          case "text":
            fullReply.current += event.content ?? "";
            setMessages((prev) => {
              const arr = [...prev];
              const last = arr[arr.length - 1];
              if (last && last.role === "assistant") {
                arr[arr.length - 1] = { ...last, content: fullReply.current };
              }
              return arr;
            });
            break;

          case "tool_start": {
            const rawArgs = event.args;
            let parsedArgs: Record<string, unknown> = {};
            if (typeof rawArgs === "string") {
              try { parsedArgs = JSON.parse(rawArgs); } catch { parsedArgs = {}; }
            } else if (rawArgs && typeof rawArgs === "object") {
              parsedArgs = rawArgs;
            }
            toolCallsAcc.push({
              type: event.tool ?? "",
              description: "",
              params: parsedArgs,
              status: "pending",
            });
            setMessages((prev) => {
              const arr = [...prev];
              const last = arr[arr.length - 1];
              if (last && last.role === "assistant") {
                arr[arr.length - 1] = { ...last, toolCalls: [...toolCallsAcc] };
              }
              return arr;
            });
            break;
          }

          case "tool_result": {
            const pendingIdx = toolCallsAcc.findIndex((tc) => tc.status === "pending");
            if (pendingIdx >= 0) {
              toolCallsAcc[pendingIdx] = {
                ...toolCallsAcc[pendingIdx],
                description: event.result ?? "",
                status: "success",
              };
            } else {
              toolCallsAcc.push({
                type: event.tool ?? "",
                description: event.result ?? "",
                params: {},
                status: "success",
              });
            }
            setMessages((prev) => {
              const arr = [...prev];
              const last = arr[arr.length - 1];
              if (last && last.role === "assistant") {
                arr[arr.length - 1] = { ...last, toolCalls: [...toolCallsAcc] };
              }
              return arr;
            });
            break;
          }

          case "resume_update":
            // 简历已变更信号，done 事件会带最终 resumeData
            break;

          case "done":
            setMessages((prev) => {
              const arr = [...prev];
              const last = arr[arr.length - 1];
              if (last && last.role === "assistant") {
                arr[arr.length - 1] = {
                  ...last,
                  content: event.reply ?? (fullReply.current || "(AI 未返回文字回复)"),
                  toolCalls: [...toolCallsAcc],
                };
              }
              return arr;
            });
            if (event.resumeModified && event.resumeData && resumeId) {
              resumeStorage.update(resumeId, { resumeData: event.resumeData });
              onResumeUpdated?.();
            }
            break;

          case "error":
            setError(event.message ?? "AI 服务异常");
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last && last.role === "assistant" && !last.content && (!last.toolCalls || last.toolCalls.length === 0)) {
                return prev.slice(0, -1);
              }
              return prev;
            });
            break;
        }
      },
      (err) => {
        setError(err instanceof Error ? err.message : "发送失败");
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.role === "assistant" && !last.content && (!last.toolCalls || last.toolCalls.length === 0)) {
            return prev.slice(0, -1);
          }
          return prev;
        });
      },
      () => {
        setLoading(false);
        controllerRef.current = null;
        inputRef.current?.focus();
      },
    );
  }, [input, loading, messages, resumeId, onResumeUpdated]);

  // 外部组件（如 ResumeDiagnosisPanel、JdAnalysisDialog）触发的待发送消息
  useEffect(() => {
    if (pendingMessage && open && !loading && !pendingSentRef.current) {
      pendingSentRef.current = true;
      onPendingMessageConsumed?.();
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

                {/* 工具调用结果 */}
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="space-y-1.5">
                    {msg.toolCalls.map((tc, ti) => {
                      const Icon = TOOL_ICONS[tc.type] ?? Wrench;
                      const isPending = tc.status === "pending";
                      return (
                        <div
                          key={ti}
                          className={`rounded-lg border px-3 py-2 text-xs ${
                            isPending
                              ? "border-muted-foreground/20 bg-muted/40"
                              : "border-success/20 bg-success/5"
                          }`}
                        >
                          <div className={`flex items-center gap-1.5 font-medium ${isPending ? "text-muted-foreground" : "text-success"}`}>
                            {isPending ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Icon className="h-3.5 w-3.5" />
                            )}
                            <span>{TOOL_LABELS[tc.type] || tc.type}</span>
                            {isPending && <span className="text-muted-foreground/70">执行中…</span>}
                          </div>
                          {tc.description && (
                            <p className="mt-1 text-muted-foreground">{tc.description}</p>
                          )}
                        </div>
                      );
                    })}
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
