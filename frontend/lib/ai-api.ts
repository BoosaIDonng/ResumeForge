/**
 * AI-enhanced API functions for the resume editor.
 * AI operations hit the backend; results are mirrored to localStorage.
 */
import { getAIHeaders } from './ai-settings';
import { resumeStorage, versionStorage } from './storage';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

// ============================================================
// Section Optimize (pure AI — no localStorage side-effects)
// ============================================================

export interface SectionOptimizeRequest {
  sectionType: string;
  currentContent: string;
  goal: string;
  jobDescription?: string;
  userInstructions?: string;
}

export interface SectionOptimizeChange {
  field: string;
  before: string;
  after: string;
  reason: string;
}

export interface SectionOptimizeResponse {
  optimizedContent: string;
  changes: SectionOptimizeChange[];
  scoreBefore: number | null;
  scoreAfter: number | null;
}

export async function optimizeSection(req: SectionOptimizeRequest): Promise<SectionOptimizeResponse> {
  const res = await fetch(`${BASE}/api/ai/optimize-section`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAIHeaders() },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`优化失败 (${res.status})`);
  const data = await res.json();
  return data.data;
}

// ============================================================
// AI Chat (synchronous)
// ============================================================

export interface ToolCallResult {
  type: string;
  description: string;
  params: Record<string, unknown>;
  status?: 'pending' | 'success';
}

export interface AiChatResponse {
  reply: string;
  toolCalls: ToolCallResult[];
}

export async function aiChat(
  resumeData: string | undefined,
  message: string,
  history?: { role: string; content: string }[]
): Promise<AiChatResponse> {
  const body: Record<string, unknown> = { message };
  if (resumeData) body.resumeData = resumeData;
  if (history && history.length > 0) body.conversationHistory = history;

  const res = await fetch(`${BASE}/api/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAIHeaders() },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || `AI 聊天失败 (${res.status})`);
  return {
    reply: json.data?.reply ?? '',
    toolCalls: json.data?.toolCalls ?? [],
  };
}

// ============================================================
// ToolChat Stream (SSE — real function-calling, recommended)
// ============================================================

export type StreamEventType =
  | 'text'
  | 'tool_start'
  | 'tool_result'
  | 'resume_update'
  | 'done'
  | 'error';

export interface StreamEvent {
  type: StreamEventType;
  content?: string;
  tool?: string;
  args?: string | Record<string, unknown>;
  result?: string;
  reply?: string;
  toolCalls?: { tool: string; args: Record<string, unknown>; result: string }[];
  resumeModified?: boolean;
  resumeData?: string;
  message?: string;
}

/**
 * 流式 ToolChat（POST + ReadableStream 解析 SSE）。
 * 返回 AbortController 供调用方中断请求。
 */
export function streamToolChat(
  params: {
    resumeData?: string;
    message: string;
    history?: { role: string; content: string }[];
  },
  onEvent: (event: StreamEvent) => void,
  onError: (err: Error) => void,
  onComplete: () => void,
): AbortController {
  const controller = new AbortController();

  (async () => {
    let res: Response;
    try {
      res = await fetch(`${BASE}/api/ai/tool-chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
          ...getAIHeaders(),
        },
        body: JSON.stringify({
          message: params.message,
          resumeData: params.resumeData,
          history: params.history,
        }),
        signal: controller.signal,
      });
    } catch (e) {
      if ((e as Error).name !== 'AbortError') onError(e as Error);
      return;
    }

    if (!res.ok || !res.body) {
      let msg = `流式请求失败 (${res.status})`;
      try {
        const errBody = await res.json();
        if (errBody?.message) msg = errBody.message;
      } catch {
        // 响应体非 JSON，使用默认错误信息
      }
      onError(new Error(msg));
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let sepIdx: number;
        while ((sepIdx = buffer.indexOf('\n\n')) >= 0) {
          const rawEvent = buffer.slice(0, sepIdx);
          buffer = buffer.slice(sepIdx + 2);

          for (const line of rawEvent.split('\n')) {
            if (!line.startsWith('data:')) continue;
            const data = line.slice(5).trim();
            if (!data) continue;
            try {
              const event = JSON.parse(data) as StreamEvent;
              onEvent(event);
              if (event.type === 'done' || event.type === 'error') {
                onComplete();
                return;
              }
            } catch {
              // 跳过无法解析的行
            }
          }
        }
      }
      onComplete();
    } catch (e) {
      if ((e as Error).name !== 'AbortError') onError(e as Error);
    }
  })();

  return controller;
}

// ============================================================
// Version History (localStorage-backed)
// ============================================================

export interface VersionInfo {
  id: string;
  resumeId: string;
  title: string;
  versionNumber: number;
  changeDescription: string;
  createdAt: string;
}

export async function listVersions(resumeId: string): Promise<VersionInfo[]> {
  return versionStorage.getByResumeId(resumeId).map((v) => ({
    id: v.id,
    resumeId: v.resumeId,
    title: v.title,
    versionNumber: v.versionNumber,
    changeDescription: v.changeDescription ?? '',
    createdAt: v.createdAt,
  }));
}

export async function createVersion(resumeId: string, description: string): Promise<VersionInfo> {
  const resume = resumeStorage.getById(resumeId);
  if (!resume) throw new Error('简历不存在');
  const v = versionStorage.create(resumeId, description, resume.resumeData);
  return {
    id: v.id,
    resumeId: v.resumeId,
    title: v.title,
    versionNumber: v.versionNumber,
    changeDescription: v.changeDescription ?? '',
    createdAt: v.createdAt,
  };
}

export async function restoreVersion(resumeId: string, versionId: string): Promise<unknown> {
  const versions = versionStorage.getByResumeId(resumeId);
  const version = versions.find(v => v.id === versionId);
  if (!version) throw new Error('版本不存在');
  resumeStorage.update(resumeId, { resumeData: version.resumeData, title: version.title });
  return { success: true };
}

// ============================================================
// File Import via parse-resume (backend AI → localStorage mirror)
// ============================================================

export async function importDocx(file: File): Promise<{ id: string; title: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${BASE}/api/ai/parse-resume`, {
    method: 'POST',
    headers: { ...getAIHeaders() },
    body: formData,
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || `导入失败 (${res.status})`);
  const result = json.data;
  const title = result?.basics?.name
    ? `${result.basics.name}的简历`
    : file.name.replace(/\.(docx|pdf)$/i, '');
  const created = resumeStorage.create(
    title,
    result ? JSON.stringify(result) : '{}'
  );
  return { id: created.id, title: created.title };
}

// ============================================================
// Diff Apply (AI operation → mirror result to localStorage)
// ============================================================

export interface DiffApplyChange {
  path: string;
  action: string;
  original: string;
  value: string;
  reason: string;
}

export interface DiffApplyResult {
  applied: { path: string; action: string }[];
  rejected: { path: string; reason: string }[];
  warnings: { path: string; message: string }[];
}

export async function applyDiff(resumeId: string, changes: DiffApplyChange[]): Promise<DiffApplyResult> {
  const res = await fetch(`${BASE}/api/ai/diff/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAIHeaders() },
    body: JSON.stringify({ resumeId, changes }),
  });
  if (!res.ok) throw new Error(`应用失败 (${res.status})`);
  const data = await res.json();
  const result = data.data;
  if (result?.resumeData) {
    resumeStorage.update(resumeId, { resumeData: JSON.stringify(result.resumeData) });
  }
  return result;
}

// ============================================================
// Enrichment Regeneration (pure AI)
// ============================================================

export interface EnrichmentRegenerateRequest {
  itemType: string;
  itemId: string;
  userInstruction: string;
}

export interface EnrichmentRegenerateResponse {
  enrichedContent: string;
  changes: { field: string; before: string; after: string; reason: string }[];
}

export async function regenerateEnrichment(
  resumeId: string,
  req: EnrichmentRegenerateRequest
): Promise<EnrichmentRegenerateResponse> {
  const resume = resumeStorage.getById(resumeId);
  if (!resume) throw new Error('简历不存在');
  const res = await fetch(`${BASE}/api/ai/enrichment/regenerate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAIHeaders() },
    body: JSON.stringify({
      resumeData: resume.resumeData,
      itemType: req.itemType,
      itemId: req.itemId,
      userInstruction: req.userInstruction,
    }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || `重新生成失败 (${res.status})`);
  // 后端返回 { enhancements: [{ originalDescription, enhancedDescription, ... }] }
  const item = json.data?.enhancements?.[0];
  const enhanced: string[] = item?.enhancedDescription ?? [];
  const original: string[] = item?.originalDescription ?? [];
  return {
    enrichedContent: enhanced.join('\n'),
    changes: enhanced.map((after, i) => ({
      field: `第 ${i + 1} 条`,
      before: original[i] ?? '',
      after,
      reason: '基于你的反馈重写',
    })),
  };
}
