/**
 * AI-enhanced API functions for the resume editor.
 * These are NEW endpoints that don't conflict with existing api.ts.
 */
import { getAIHeaders } from './ai-settings';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

// ============================================================
// Section Optimize
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
// Tool Chat (AI with direct resume modification)
// ============================================================

export interface ToolCallResult {
  tool: string;
  args: Record<string, unknown>;
  result: string;
}

export interface ToolChatResponse {
  reply: string;
  toolCalls: ToolCallResult[];
  resumeModified: boolean;
  resumeData?: Record<string, unknown>;
}

export async function toolChat(
  resumeId: number,
  message: string,
  history?: { role: string; content: string }[]
): Promise<ToolChatResponse> {
  const res = await fetch(`${BASE}/api/ai/tool-chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAIHeaders() },
    body: JSON.stringify({ resumeId, message, history }),
  });
  if (!res.ok) throw new Error(`AI 聊天失败 (${res.status})`);
  const data = await res.json();
  return data.data;
}

// ============================================================
// Quality Score
// ============================================================

export interface SectionScore {
  sectionType: string;
  sectionName: string;
  score: number;
  feedback: string;
}

export interface QualitySuggestion {
  priority: string;
  section: string;
  message: string;
  example: string;
}

export interface QualityScoreResponse {
  overallScore: number;
  sectionScores: SectionScore[];
  suggestions: QualitySuggestion[];
  summary: string;
}

export async function getQualityScore(resumeId: number): Promise<QualityScoreResponse> {
  const res = await fetch(`${BASE}/api/resumes/${resumeId}/quality-score`, {
    headers: { ...getAIHeaders() },
  });
  if (!res.ok) throw new Error(`评分失败 (${res.status})`);
  const data = await res.json();
  return data.data;
}

// ============================================================
// Version History
// ============================================================

export interface VersionInfo {
  id: number;
  resumeId: number;
  title: string;
  versionNumber: number;
  changeDescription: string;
  createdAt: string;
}

export async function listVersions(resumeId: number): Promise<VersionInfo[]> {
  const res = await fetch(`${BASE}/api/resumes/${resumeId}/versions`);
  if (!res.ok) throw new Error(`获取版本失败 (${res.status})`);
  const data = await res.json();
  return data.data;
}

export async function createVersion(resumeId: number, description: string): Promise<VersionInfo> {
  const res = await fetch(`${BASE}/api/resumes/${resumeId}/versions?description=${encodeURIComponent(description)}`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(`创建版本失败 (${res.status})`);
  const data = await res.json();
  return data.data;
}

export async function restoreVersion(resumeId: number, versionId: number): Promise<unknown> {
  const res = await fetch(`${BASE}/api/resumes/${resumeId}/versions/${versionId}/restore`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(`恢复版本失败 (${res.status})`);
  const data = await res.json();
  return data.data;
}

// ============================================================
// DOCX Import
// ============================================================

export async function importDocx(file: File): Promise<{ id: number; title: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${BASE}/api/import/docx`, {
    method: 'POST',
    headers: { ...getAIHeaders() },
    body: formData,
  });
  if (!res.ok) throw new Error(`DOCX 导入失败 (${res.status})`);
  const data = await res.json();
  return data.data;
}
