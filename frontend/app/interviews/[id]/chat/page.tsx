"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { apiGet, apiSSE } from "@/lib/api";
import type { ChatMessage } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Square, Wifi, WifiOff } from "lucide-react";

type ConnectionStatus = "connected" | "streaming" | "error";

export default function InterviewChatPage() {
  const params = useParams();
  const id = params.id as string;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<ConnectionStatus>("connected");

  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const streamingIdRef = useRef<number | null>(null);

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiGet<ChatMessage[]>(`/api/interviews/${id}/messages`);
        setMessages(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "加载消息失败");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || status === "streaming") return;

    const userMsg: ChatMessage = {
      id: Date.now(),
      sessionId: id,
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };

    const assistantId = Date.now() + 1;
    const assistantMsg: ChatMessage = {
      id: assistantId,
      sessionId: id,
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
    setStatus("streaming");
    streamingIdRef.current = assistantId;

    abortRef.current = apiSSE(
      `/api/interviews/${id}/chat`,
      { message: text },
      (chunk) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: m.content + chunk } : m
          )
        );
      },
      () => {
        setStatus("connected");
        streamingIdRef.current = null;
      },
      (err) => {
        setStatus("error");
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: m.content || `错误: ${err.message}` }
              : m
          )
        );
        streamingIdRef.current = null;
      }
    );
  }, [id, input, status]);

  const handleCancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStatus("connected");
    streamingIdRef.current = null;
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-4rem)] border-x border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h1 className="text-lg font-bold text-foreground font-heading">
          面试对话
        </h1>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {status === "streaming" ? (
            <>
              <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
              回复中...
            </>
          ) : status === "error" ? (
            <>
              <WifiOff className="w-3.5 h-3.5 text-destructive" />
              连接异常
            </>
          ) : (
            <>
              <Wifi className="w-3.5 h-3.5 text-success" />
              已连接
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            <p className="text-sm">发送消息开始面试对话</p>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 border ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-foreground border-border"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap break-words">
                {msg.content}
                {msg.role === "assistant" &&
                  msg.id === streamingIdRef.current &&
                  status === "streaming" && (
                    <span className="inline-block w-2 h-4 ml-0.5 bg-foreground animate-pulse align-text-bottom" />
                  )}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="border-t border-border px-4 py-3">
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息... (Enter 发送, Shift+Enter 换行)"
            className="min-h-10 max-h-32 resize-none"
            disabled={status === "streaming"}
          />
          {status === "streaming" ? (
            <Button
              variant="destructive"
              size="icon"
              onClick={handleCancel}
              title="停止生成"
            >
              <Square className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!input.trim()}
              title="发送"
            >
              <Send className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
