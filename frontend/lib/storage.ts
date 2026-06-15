const STORAGE_KEYS = {
  RESUMES: 'ai_resumes',
  JOBS: 'ai_jobs',
  APPLICATIONS: 'ai_applications',
  INTERVIEWS: 'ai_interviews',
  VERSIONS: 'ai_versions',
  GRAMMAR_HISTORY: 'ai_grammar_history',
  SHARES: 'ai_shares',
  SEARCH_HISTORY: 'ai_search_history',
} as const;

function load<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

export interface StoredResume {
  id: string;
  title: string;
  resumeData: any;
  createdAt: string;
  updatedAt: string;
}

export const resumeStorage = {
  getAll(): StoredResume[] { return load<StoredResume[]>(STORAGE_KEYS.RESUMES, []); },
  getById(id: string): StoredResume | undefined { return this.getAll().find(r => r.id === id); },
  create(title: string, resumeData: any): StoredResume {
    const resumes = this.getAll();
    const now = new Date().toISOString();
    const item: StoredResume = { id: generateId(), title, resumeData, createdAt: now, updatedAt: now };
    resumes.unshift(item);
    save(STORAGE_KEYS.RESUMES, resumes);
    return item;
  },
  update(id: string, data: Partial<Pick<StoredResume, 'title' | 'resumeData'>>): StoredResume | undefined {
    const resumes = this.getAll();
    const idx = resumes.findIndex(r => r.id === id);
    if (idx === -1) return undefined;
    if (data.title !== undefined) resumes[idx].title = data.title;
    if (data.resumeData !== undefined) resumes[idx].resumeData = data.resumeData;
    resumes[idx].updatedAt = new Date().toISOString();
    save(STORAGE_KEYS.RESUMES, resumes);
    return resumes[idx];
  },
  delete(id: string): boolean {
    const resumes = this.getAll();
    const filtered = resumes.filter(r => r.id !== id);
    if (filtered.length === resumes.length) return false;
    save(STORAGE_KEYS.RESUMES, filtered);
    return true;
  },
  duplicate(id: string): StoredResume | undefined {
    const orig = this.getById(id);
    if (!orig) return undefined;
    return this.create(orig.title + ' (副本)', JSON.parse(JSON.stringify(orig.resumeData)));
  },
  search(query: string): StoredResume[] {
    const q = query.toLowerCase();
    return this.getAll().filter(r => r.title.toLowerCase().includes(q));
  },
};

export interface StoredJob {
  id: string;
  resumeId?: string;
  title: string;
  company: string;
  description: string;
  createdAt: string;
}

export const jobStorage = {
  getAll(): StoredJob[] { return load<StoredJob[]>(STORAGE_KEYS.JOBS, []); },
  getById(id: string): StoredJob | undefined { return this.getAll().find(j => j.id === id); },
  create(data: Omit<StoredJob, 'id' | 'createdAt'>): StoredJob {
    const jobs = this.getAll();
    const item: StoredJob = { id: generateId(), ...data, createdAt: new Date().toISOString() };
    jobs.unshift(item);
    save(STORAGE_KEYS.JOBS, jobs);
    return item;
  },
  delete(id: string): boolean {
    const jobs = this.getAll();
    const filtered = jobs.filter(j => j.id !== id);
    if (filtered.length === jobs.length) return false;
    save(STORAGE_KEYS.JOBS, filtered);
    return true;
  },
};

export type ApplicationStatus = 'PREPARING' | 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'OFFER' | 'REJECTED' | 'WITHDRAWN';

export interface StoredApplication {
  id: string;
  resumeId?: string;
  jobId?: string;
  company: string;
  position: string;
  status: ApplicationStatus;
  appliedDate?: string;
  salaryRange?: string;
  jobUrl?: string;
  contactPerson?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const applicationStorage = {
  getAll(): StoredApplication[] { return load<StoredApplication[]>(STORAGE_KEYS.APPLICATIONS, []); },
  getById(id: string): StoredApplication | undefined { return this.getAll().find(a => a.id === id); },
  create(data: Omit<StoredApplication, 'id' | 'createdAt' | 'updatedAt'>): StoredApplication {
    const apps = this.getAll();
    const now = new Date().toISOString();
    const item: StoredApplication = { id: generateId(), ...data, createdAt: now, updatedAt: now };
    apps.unshift(item);
    save(STORAGE_KEYS.APPLICATIONS, apps);
    return item;
  },
  update(id: string, data: Partial<StoredApplication>): StoredApplication | undefined {
    const apps = this.getAll();
    const idx = apps.findIndex(a => a.id === id);
    if (idx === -1) return undefined;
    apps[idx] = { ...apps[idx], ...data, updatedAt: new Date().toISOString() };
    save(STORAGE_KEYS.APPLICATIONS, apps);
    return apps[idx];
  },
  delete(id: string): boolean {
    const apps = this.getAll();
    const filtered = apps.filter(a => a.id !== id);
    if (filtered.length === apps.length) return false;
    save(STORAGE_KEYS.APPLICATIONS, filtered);
    return true;
  },
  getStats(): { total: number; byStatus: Record<string, number>; recentActivity: { date: string; count: number }[] } {
    const apps = this.getAll();
    const byStatus: Record<string, number> = { PREPARING: 0, APPLIED: 0, SCREENING: 0, INTERVIEW: 0, OFFER: 0, REJECTED: 0, WITHDRAWN: 0 };
    apps.forEach(a => { byStatus[a.status] = (byStatus[a.status] || 0) + 1; });
    // Recent activity: last 7 days
    const now = new Date();
    const recentActivity: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = apps.filter(a => a.createdAt.startsWith(dateStr)).length;
      recentActivity.push({ date: dateStr, count });
    }
    return { total: apps.length, byStatus, recentActivity };
  },
};

export interface StoredInterview {
  id: string;
  resumeId?: string;
  jobId?: string;
  role: string;
  level: string;
  type: string;
  techStack: string;
  status: string;
  messages: { role: string; content: string; createdAt: string }[];
  questions: { question: string; answer?: string }[];
  feedback?: any;
  createdAt: string;
  updatedAt: string;
}

export const interviewStorage = {
  getAll(): StoredInterview[] { return load<StoredInterview[]>(STORAGE_KEYS.INTERVIEWS, []); },
  getById(id: string): StoredInterview | undefined { return this.getAll().find(i => i.id === id); },
  create(data: Omit<StoredInterview, 'id' | 'createdAt' | 'updatedAt' | 'messages' | 'questions'>): StoredInterview {
    const interviews = this.getAll();
    const now = new Date().toISOString();
    const item: StoredInterview = { id: generateId(), ...data, messages: [], questions: [], createdAt: now, updatedAt: now };
    interviews.unshift(item);
    save(STORAGE_KEYS.INTERVIEWS, interviews);
    return item;
  },
  update(id: string, data: Partial<StoredInterview>): StoredInterview | undefined {
    const interviews = this.getAll();
    const idx = interviews.findIndex(i => i.id === id);
    if (idx === -1) return undefined;
    interviews[idx] = { ...interviews[idx], ...data, updatedAt: new Date().toISOString() };
    save(STORAGE_KEYS.INTERVIEWS, interviews);
    return interviews[idx];
  },
  addMessage(id: string, role: string, content: string): void {
    const interview = this.getById(id);
    if (!interview) return;
    interview.messages.push({ role, content, createdAt: new Date().toISOString() });
    this.update(id, { messages: interview.messages });
  },
  addQuestion(id: string, question: string): void {
    const interview = this.getById(id);
    if (!interview) return;
    interview.questions.push({ question });
    this.update(id, { questions: interview.questions });
  },
  answerQuestion(id: string, questionIndex: number, answer: string): void {
    const interview = this.getById(id);
    if (!interview || !interview.questions[questionIndex]) return;
    interview.questions[questionIndex].answer = answer;
    this.update(id, { questions: interview.questions });
  },
  setFeedback(id: string, feedback: any): void {
    this.update(id, { feedback, status: 'COMPLETED' });
  },
  delete(id: string): boolean {
    const interviews = this.getAll();
    const filtered = interviews.filter(i => i.id !== id);
    if (filtered.length === interviews.length) return false;
    save(STORAGE_KEYS.INTERVIEWS, filtered);
    return true;
  },
};

// ============ Share Storage ============

export interface StoredShare {
  id: string;
  resumeId: string;
  token: string;
  password?: string;
  viewCount: number;
  active: boolean;
  createdAt: string;
}

export const shareStorage = {
  getAll(): StoredShare[] { return load<StoredShare[]>(STORAGE_KEYS.SHARES, []); },
  getByResumeId(resumeId: string): StoredShare | undefined {
    return this.getAll().find(s => s.resumeId === resumeId && s.active);
  },
  getByToken(token: string): StoredShare | undefined {
    return this.getAll().find(s => s.token === token && s.active);
  },
  create(resumeId: string, password?: string): StoredShare {
    const shares = this.getAll();
    // Deactivate existing share for this resume
    shares.forEach(s => { if (s.resumeId === resumeId) s.active = false; });
    const item: StoredShare = {
      id: generateId(),
      resumeId,
      token: generateId() + generateId(),
      password,
      viewCount: 0,
      active: true,
      createdAt: new Date().toISOString(),
    };
    shares.push(item);
    save(STORAGE_KEYS.SHARES, shares);
    return item;
  },
  incrementView(token: string): void {
    const shares = this.getAll();
    const share = shares.find(s => s.token === token);
    if (share) {
      share.viewCount++;
      save(STORAGE_KEYS.SHARES, shares);
    }
  },
  deleteByResumeId(resumeId: string): void {
    const shares = this.getAll();
    shares.forEach(s => { if (s.resumeId === resumeId) s.active = false; });
    save(STORAGE_KEYS.SHARES, shares);
  },
};

// ============ Grammar Check History ============

export interface StoredGrammarRecord {
  id: number;
  resumeId: string;
  score: number;
  issuesCount: number;
  issues: string;
  summary: string;
  createdAt: string;
}

export const grammarHistoryStorage = {
  getByResumeId(resumeId: string): StoredGrammarRecord[] {
    return load<StoredGrammarRecord[]>(STORAGE_KEYS.GRAMMAR_HISTORY, [])
      .filter(r => r.resumeId === resumeId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  add(record: StoredGrammarRecord): void {
    const all = load<StoredGrammarRecord[]>(STORAGE_KEYS.GRAMMAR_HISTORY, []);
    all.push(record);
    // Keep max 100 records
    if (all.length > 100) all.splice(0, all.length - 100);
    save(STORAGE_KEYS.GRAMMAR_HISTORY, all);
  },
};

// ============ Version History ============

export interface StoredVersion {
  id: string;
  resumeId: string;
  title: string;
  resumeData: any;
  versionNumber: number;
  changeDescription?: string;
  createdAt: string;
}

export const versionStorage = {
  getByResumeId(resumeId: string): StoredVersion[] {
    return load<StoredVersion[]>(STORAGE_KEYS.VERSIONS, [])
      .filter(v => v.resumeId === resumeId)
      .sort((a, b) => b.versionNumber - a.versionNumber);
  },
  create(resumeId: string, title: string, resumeData: any, changeDescription?: string): StoredVersion {
    const all = load<StoredVersion[]>(STORAGE_KEYS.VERSIONS, []);
    const existing = all.filter(v => v.resumeId === resumeId);
    const versionNumber = existing.length > 0 ? Math.max(...existing.map(v => v.versionNumber)) + 1 : 1;
    const item: StoredVersion = {
      id: generateId(),
      resumeId,
      title,
      resumeData,
      versionNumber,
      changeDescription,
      createdAt: new Date().toISOString(),
    };
    all.push(item);
    const trimmed = all
      .filter(v => v.resumeId === resumeId)
      .sort((a, b) => b.versionNumber - a.versionNumber)
      .slice(0, 50);
    const otherVersions = all.filter(v => v.resumeId !== resumeId);
    save(STORAGE_KEYS.VERSIONS, [...otherVersions, ...trimmed]);
    return item;
  },
  deleteByResumeId(resumeId: string): void {
    const all = load<StoredVersion[]>(STORAGE_KEYS.VERSIONS, []);
    save(STORAGE_KEYS.VERSIONS, all.filter(v => v.resumeId !== resumeId));
  },
};

// ============ Global Search ============

export function globalSearch(query: string): { type: string; title: string; subtitle: string; url: string }[] {
  const q = query.toLowerCase();
  const results: { type: string; title: string; subtitle: string; url: string }[] = [];

  resumeStorage.getAll().forEach(r => {
    if (r.title.toLowerCase().includes(q)) {
      results.push({ type: 'resume', title: r.title, subtitle: `创建于 ${new Date(r.createdAt).toLocaleDateString('zh-CN')}`, url: `/resumes/${r.id}/edit` });
    }
  });

  jobStorage.getAll().forEach(j => {
    if (j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q)) {
      results.push({ type: 'job', title: j.title, subtitle: j.company, url: `/jobs/${j.id}/analysis` });
    }
  });

  applicationStorage.getAll().forEach(a => {
    if (a.company.toLowerCase().includes(q) || a.position.toLowerCase().includes(q)) {
      results.push({ type: 'application', title: `${a.position} - ${a.company}`, subtitle: a.status, url: '/applications' });
    }
  });

  interviewStorage.getAll().forEach(i => {
    if (i.role.toLowerCase().includes(q) || i.techStack?.toLowerCase().includes(q)) {
      results.push({ type: 'interview', title: `${i.role} · ${i.level}`, subtitle: i.type, url: `/interviews/${i.id}` });
    }
  });

  return results;
}

// ============ Data Backup ============

export const dataTransfer = {
  exportAll(): string {
    return JSON.stringify({
      resumes: resumeStorage.getAll(),
      jobs: jobStorage.getAll(),
      applications: applicationStorage.getAll(),
      interviews: interviewStorage.getAll(),
      versions: load<StoredVersion[]>(STORAGE_KEYS.VERSIONS, []),
      grammarHistory: load<StoredGrammarRecord[]>(STORAGE_KEYS.GRAMMAR_HISTORY, []),
      shares: shareStorage.getAll(),
      exportedAt: new Date().toISOString(),
    }, null, 2);
  },
  importAll(json: string) {
    const data = JSON.parse(json);
    if (data.resumes) save(STORAGE_KEYS.RESUMES, data.resumes);
    if (data.jobs) save(STORAGE_KEYS.JOBS, data.jobs);
    if (data.applications) save(STORAGE_KEYS.APPLICATIONS, data.applications);
    if (data.interviews) save(STORAGE_KEYS.INTERVIEWS, data.interviews);
    if (data.versions) save(STORAGE_KEYS.VERSIONS, data.versions);
    if (data.grammarHistory) save(STORAGE_KEYS.GRAMMAR_HISTORY, data.grammarHistory);
    if (data.shares) save(STORAGE_KEYS.SHARES, data.shares);
  },
  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  },
};
