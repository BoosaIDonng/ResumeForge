export type ApiResponse<T> = {
  success: boolean;
  code: string;
  message: string;
  data: T;
};

export type Resume = {
  id: number;
  title: string;
  master: boolean;
  resumeData: string;
  createdAt: string;
  updatedAt: string;
};

export type Job = {
  id: number;
  resumeId: number;
  title: string;
  company: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type AiTask = {
  id: number;
  taskType: string;
  status: "PENDING" | "RUNNING" | "SUCCEEDED" | "FAILED";
  progress: number;
  resultRefType?: string;
  resultRefId?: number;
  errorMessage?: string;
};

export type AnalysisReport = {
  id: number;
  resumeId: number;
  jobId: number;
  overallScore: number;
  atsScore: number;
  keywordMatches: string;
  missingKeywords: string;
  suggestions: string;
  summary: string;
  createdAt: string;
};

export type InterviewSession = {
  id: number;
  resumeId: number;
  jobId: number;
  role: string;
  level: string;
  type: string;
  techStack: string | null;
  questionCount: number;
  status: string;
  createdAt: string;
};

export type InterviewQuestion = {
  id: number;
  sessionId: number;
  sortOrder: number;
  question: string;
  answer: string | null;
  createdAt: string;
  answeredAt: string | null;
};

export type InterviewFeedback = {
  id: number;
  sessionId: number;
  totalScore: number;
  categoryScores: string;
  strengths: string;
  areasForImprovement: string;
  finalAssessment: string;
  improvementPlan: string;
  createdAt: string;
};

export type AiConfig = {
  baseUrl: string;
  model: string;
  temperature: number;
  maxTokens: number;
};

export type ShareInfo = {
  id: number;
  resumeId: number;
  token: string;
  hasPassword: boolean;
  viewCount: number;
  active: boolean;
};

export type PublicShareData = {
  title: string;
  resumeData: string;
  template: string;
  viewCount: number;
};

export type TemplateInfo = {
  id: string;
  name: string;
  description: string;
  preview?: string;
};

export type Application = {
  id: number;
  resumeId: number;
  company: string;
  position: string;
  status: string;
  appliedAt: string;
  notes: string | null;
  url: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ApplicationStats = {
  total: number;
  byStatus: Record<string, number>;
  recentActivity: { date: string; count: number }[];
};

export type GrammarCheckRecord = {
  id: number;
  resumeId: number;
  score: number;
  issuesCount: number;
  issues: string;
  summary: string;
  createdAt: string;
};

export type ChatMessage = {
  id: number;
  sessionId: number;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export type SearchResult = {
  type: string;
  title: string;
  subtitle: string;
  url: string;
};
