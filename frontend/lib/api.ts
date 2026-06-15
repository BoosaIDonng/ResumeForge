import { resumeStorage, jobStorage, applicationStorage, interviewStorage, shareStorage, globalSearch } from './storage';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// ============ Backward-compatible CRUD wrappers (localStorage) ============

export async function apiGet<T>(path: string): Promise<T> {
  // Resume CRUD
  if (path === '/api/resumes') return resumeStorage.getAll() as any;
  if (path.match(/^\/api\/resumes\/[^/]+\/share$/)) {
    const resumeId = path.split('/api/resumes/')[1]?.split('/')[0];
    const share = shareStorage.getByResumeId(resumeId!);
    if (!share) throw new Error('未找到分享信息');
    return { id: share.id, resumeId: share.resumeId, token: share.token, hasPassword: !!share.password, viewCount: share.viewCount, active: share.active } as any;
  }
  if (path.startsWith('/api/resumes/')) {
    const id = path.split('/api/resumes/')[1]?.split('/')[0];
    const r = resumeStorage.getById(id!);
    if (!r) throw new Error('Not found');
    return r as any;
  }
  // Job CRUD
  if (path === '/api/jobs') return jobStorage.getAll() as any;
  if (path.startsWith('/api/jobs/')) {
    const id = path.split('/api/jobs/')[1]?.split('/')[0];
    const j = jobStorage.getById(id!);
    if (!j) throw new Error('Not found');
    return j as any;
  }
  // Application CRUD
  if (path === '/api/applications') return applicationStorage.getAll() as any;
  if (path.startsWith('/api/applications/stats')) return applicationStorage.getStats() as any;
  // Interview CRUD
  if (path === '/api/interviews') return interviewStorage.getAll() as any;
  if (path.match(/\/api\/interviews\/[^/]+\/messages$/)) {
    const id = path.split('/api/interviews/')[1]?.split('/')[0];
    const interview = interviewStorage.getById(id!);
    if (!interview) throw new Error('Not found');
    // Convert messages to ChatMessage format
    return interview.messages.map((m, i) => ({
      id: Date.now() + i,
      sessionId: id,
      role: m.role,
      content: m.content,
      createdAt: m.createdAt,
    })) as any;
  }
  if (path.match(/\/api\/interviews\/[^/]+\/feedback$/)) {
    const id = path.split('/api/interviews/')[1]?.split('/')[0];
    const interview = interviewStorage.getById(id!);
    if (!interview) throw new Error('Not found');
    if (!interview.feedback) throw new Error('反馈尚未生成');
    return interview.feedback as any;
  }
  if (path.startsWith('/api/interviews/')) {
    const id = path.split('/api/interviews/')[1]?.split('/')[0];
    const interview = interviewStorage.getById(id!);
    if (!interview) throw new Error('Not found');
    // Return in the shape { session, questions } expected by the page
    return {
      session: {
        id: interview.id,
        resumeId: interview.resumeId ?? '',
        jobId: interview.jobId ?? '',
        role: interview.role,
        level: interview.level,
        type: interview.type,
        techStack: interview.techStack,
        questionCount: interview.questions.length,
        status: interview.status,
        createdAt: interview.createdAt,
      },
      questions: interview.questions.map((q, i) => ({
        id: `${interview.id}_q${i}`,
        sessionId: interview.id,
        sortOrder: i,
        question: q.question,
        answer: q.answer ?? null,
        createdAt: interview.createdAt,
        answeredAt: q.answer ? interview.updatedAt : null,
      })),
    } as any;
  }
  // Share
  if (path.match(/^\/api\/share\/[^/]+/)) {
    const token = path.split('/api/share/')[1]?.split('?')[0];
    const share = shareStorage.getByToken(token!);
    if (!share) throw new Error('分享链接不存在或已失效');
    // Check password if required
    const passwordMatch = path.match(/[?&]password=([^&]+)/);
    if (share.password) {
      if (!passwordMatch || decodeURIComponent(passwordMatch[1]) !== share.password) {
        throw new Error('密码错误');
      }
    }
    shareStorage.incrementView(token!);
    const resume = resumeStorage.getById(share.resumeId);
    if (!resume) throw new Error('简历不存在');
    return {
      title: resume.title,
      resumeData: typeof resume.resumeData === 'string' ? resume.resumeData : JSON.stringify(resume.resumeData),
      template: 'default',
      viewCount: share.viewCount + 1,
    } as any;
  }
  // Search
  if (path.startsWith('/api/search')) {
    const qMatch = path.match(/[?&]q=([^&]+)/);
    if (!qMatch) return [] as any;
    const query = decodeURIComponent(qMatch[1]);
    return globalSearch(query) as any;
  }
  // Task status (stub - tasks don't exist in localStorage mode)
  if (path.startsWith('/api/tasks/')) {
    return { id: path.split('/api/tasks/')[1], status: 'SUCCEEDED', progress: 100 } as any;
  }
  // Analysis reports (not stored in localStorage - stub)
  if (path.startsWith('/api/analysis/reports/')) {
    throw new Error('分析报告功能需要后端支持');
  }
  // Optimization proposals (not stored in localStorage - stub)
  if (path.startsWith('/api/optimization/proposals/')) {
    throw new Error('优化方案功能需要后端支持');
  }
  // Templates (needs backend)
  if (path === '/api/templates') {
    const res = await fetch(`${API_BASE}/api/templates`);
    if (!res.ok) throw new Error('加载模板失败');
    const data = await res.json();
    return (data.data || data) as any;
  }
  throw new Error(`Unknown GET path: ${path}`);
}

export async function apiPost<T>(path: string, body: any): Promise<T> {
  // Resume create/copy
  if (path === '/api/resumes') {
    return resumeStorage.create(body.title || '未命名', body.resumeData || {}) as any;
  }
  if (path.match(/\/api\/resumes\/[^/]+\/copy/)) {
    const id = path.split('/api/resumes/')[1]?.split('/')[0];
    return resumeStorage.duplicate(id!) as any;
  }
  // Share enable
  if (path.match(/^\/api\/resumes\/[^/]+\/share$/)) {
    const resumeId = path.split('/api/resumes/')[1]?.split('/')[0];
    const share = shareStorage.create(resumeId!, body.password || undefined);
    return { id: share.id, resumeId: share.resumeId, token: share.token, hasPassword: !!share.password, viewCount: share.viewCount, active: share.active } as any;
  }
  // Job create
  if (path === '/api/jobs') {
    return jobStorage.create(body) as any;
  }
  // Application create
  if (path === '/api/applications') {
    return applicationStorage.create(body) as any;
  }
  // Interview create
  if (path === '/api/interviews') {
    const interview = interviewStorage.create({
      resumeId: body.resumeId,
      jobId: body.jobId,
      role: body.role,
      level: body.level,
      type: body.type,
      techStack: body.techStack || '',
      status: 'CREATED',
    });
    // Store questions if provided
    if (body.questions && Array.isArray(body.questions)) {
      body.questions.forEach((q: string) => interviewStorage.addQuestion(interview.id, q));
    }
    return { sessionId: interview.id, taskId: null, status: interview.status } as any;
  }
  // Interview chat
  if (path.match(/\/api\/interviews\/[^/]+\/chat$/)) {
    const id = path.split('/api/interviews/')[1]?.split('/')[0];
    interviewStorage.addMessage(id!, 'user', body.message);
    return { message: 'ok' } as any;
  }
  // Interview answer
  if (path.match(/\/api\/interviews\/[^/]+\/answers$/)) {
    const id = path.split('/api/interviews/')[1]?.split('/')[0];
    const interview = interviewStorage.getById(id!);
    if (interview) {
      const qIdx = interview.questions.findIndex((_, i) => `${id}_q${i}` === String(body.questionId));
      if (qIdx >= 0) {
        interviewStorage.answerQuestion(id!, qIdx, body.answer);
      }
    }
    return { success: true } as any;
  }
  // Interview feedback generation
  if (path.match(/\/api\/interviews\/[^/]+\/feedback$/)) {
    // In localStorage mode, feedback needs to be generated by AI
    // Return a stub taskId - the actual AI call should be made separately
    return { taskId: null, status: 'PENDING' } as any;
  }
  // JD match analysis (needs backend)
  if (path === '/api/analysis/jd-match') {
    const res = await fetch(`${API_BASE}/api/analysis/jd-match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    return data.data || data;
  }
  // Optimization proposals (needs backend)
  if (path.match(/^\/api\/optimization\/proposals\/[^/]+\/apply$/)) {
    throw new Error('优化方案应用功能需要后端支持');
  }
  if (path === '/api/optimization/proposals') {
    throw new Error('优化方案生成功能需要后端支持');
  }
  // For AI endpoints, fall through to real API
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return data.data || data;
}

export async function apiPut<T>(path: string, body: any): Promise<T> {
  if (path.startsWith('/api/resumes/')) {
    const id = path.split('/api/resumes/')[1]?.split('/')[0];
    return resumeStorage.update(id!, body) as any;
  }
  if (path.startsWith('/api/applications/')) {
    const id = path.split('/api/applications/')[1]?.split('/')[0];
    return applicationStorage.update(id!, body) as any;
  }
  if (path.startsWith('/api/interviews/')) {
    const id = path.split('/api/interviews/')[1]?.split('/')[0];
    return interviewStorage.update(id!, body) as any;
  }
  throw new Error(`Unknown PUT path: ${path}`);
}

export async function apiDelete<T>(path: string): Promise<T> {
  // Share delete
  if (path.match(/^\/api\/resumes\/[^/]+\/share$/)) {
    const resumeId = path.split('/api/resumes/')[1]?.split('/')[0];
    shareStorage.deleteByResumeId(resumeId!);
    return { success: true } as any;
  }
  if (path.startsWith('/api/resumes/')) {
    const id = path.split('/api/resumes/')[1]?.split('/')[0];
    resumeStorage.delete(id!);
    return { success: true } as any;
  }
  if (path.startsWith('/api/jobs/')) {
    const id = path.split('/api/jobs/')[1]?.split('/')[0];
    jobStorage.delete(id!);
    return { success: true } as any;
  }
  if (path.startsWith('/api/applications/')) {
    const id = path.split('/api/applications/')[1]?.split('/')[0];
    applicationStorage.delete(id!);
    return { success: true } as any;
  }
  if (path.startsWith('/api/interviews/')) {
    const id = path.split('/api/interviews/')[1]?.split('/')[0];
    interviewStorage.delete(id!);
    return { success: true } as any;
  }
  throw new Error(`Unknown DELETE path: ${path}`);
}

export function apiSSE(
  path: string,
  body: any,
  onMessage: (data: any) => void,
  onComplete?: () => void,
  onError?: (err: Error) => void,
): AbortController {
  const controller = new AbortController();
  (async () => {
    try {
      const res = await fetch(`${API_BASE}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const reader = res.body?.getReader();
      if (!reader) { onComplete?.(); return; }
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        for (const line of text.split('\n')) {
          if (line.startsWith('data: ')) {
            try { onMessage(JSON.parse(line.slice(6))); } catch {}
          }
        }
      }
      onComplete?.();
    } catch (err: any) {
      if (err.name !== 'AbortError') onError?.(err);
    }
  })();
  return controller;
}

// ============ Template listing (needs backend) ============

export async function getTemplates() {
  const res = await fetch(`${API_BASE}/api/templates`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return data.data || data;
}
