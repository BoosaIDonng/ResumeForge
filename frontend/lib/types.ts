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
  createdAt: string;
};
