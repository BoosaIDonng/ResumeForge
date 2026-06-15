export type ApiResponse<T> = {
  success: boolean;
  code: string;
  message: string;
  data: T;
};

export type Resume = {
  id: string;
  title: string;
  master?: boolean;
  resumeData: string;
  createdAt: string;
  updatedAt: string;
};

export type Job = {
  id: string;
  resumeId: string;
  title: string;
  company: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type AiTask = {
  id: string;
  taskType: string;
  status: "PENDING" | "RUNNING" | "SUCCEEDED" | "FAILED";
  progress: number;
  resultRefType?: string;
  resultRefId?: string;
  errorMessage?: string;
};

export type AnalysisReport = {
  id: string;
  resumeId: string;
  jobId: string;
  overallScore: number;
  atsScore: number;
  keywordMatches: string;
  missingKeywords: string;
  suggestions: string;
  summary: string;
  createdAt: string;
};

export type InterviewSession = {
  id: string;
  resumeId: string;
  jobId: string;
  role: string;
  level: string;
  type: string;
  techStack: string | null;
  questionCount: number;
  status: string;
  createdAt: string;
};

export type InterviewQuestion = {
  id: string;
  sessionId: string;
  sortOrder: number;
  question: string;
  answer: string | null;
  createdAt: string;
  answeredAt: string | null;
};

export type InterviewFeedback = {
  id: string;
  sessionId: string;
  totalScore: number;
  categoryScores: string;
  strengths: string;
  areasForImprovement: string;
  finalAssessment: string;
  improvementPlan: string;
  createdAt: string;
};

export type ShareInfo = {
  id: string;
  resumeId: string;
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

export type Application = {
  id: string;
  resumeId: string;
  company: string;
  position: string;
  status: string;
  appliedDate: string;
  notes: string | null;
  jobUrl: string | null;
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
  resumeId: string;
  score: number;
  issuesCount: number;
  issues: string;
  summary: string;
  createdAt: string;
};

export type DiagnosisRecord = GrammarCheckRecord;

export type ChatMessage = {
  id: number;
  sessionId: string;
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
