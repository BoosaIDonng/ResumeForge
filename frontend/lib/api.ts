import type { ApiResponse } from "@/lib/types";
import { getAIHeaders } from "@/lib/ai-settings";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, { cache: "no-store" });
  const body = (await response.json()) as ApiResponse<T>;
  if (!response.ok || !body.success) throw new Error(body.message);
  return body.data;
}

export async function apiPost<T>(path: string, payload: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = (await response.json()) as ApiResponse<T>;
  if (!response.ok || !body.success) throw new Error(body.message);
  return body.data;
}

export async function apiPut<T>(path: string, payload: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = (await response.json()) as ApiResponse<T>;
  if (!response.ok || !body.success) throw new Error(body.message);
  return body.data;
}

export async function apiDelete<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "DELETE",
  });
  const body = (await response.json()) as ApiResponse<T>;
  if (!response.ok || !body.success) throw new Error(body.message);
  return body.data;
}

export async function apiPostWithAI<T>(path: string, payload: unknown): Promise<T> {
  const aiHeaders = getAIHeaders();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...aiHeaders },
    body: JSON.stringify(payload),
  });
  const body = (await response.json()) as ApiResponse<T>;
  if (!response.ok || !body.success) throw new Error(body.message);
  return body.data;
}

export function apiSSE(
  path: string,
  body: Record<string, unknown>,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: Error) => void
): AbortController {
  const controller = new AbortController();

  fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: controller.signal,
  })
    .then(async (res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        onChunk(decoder.decode(value, { stream: true }));
      }
      onDone();
    })
    .catch((err) => {
      if (err.name !== "AbortError") onError(err);
    });

  return controller;
}
