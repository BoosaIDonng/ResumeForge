import type { ResumeData } from "@/components/resume/resumeData";

export function calcCompleteness(data: ResumeData): number {
  const checks: { label: string; filled: boolean; weight: number }[] = [
    { label: "name", filled: !!data.basics.name, weight: 15 },
    { label: "headline", filled: !!data.basics.headline, weight: 10 },
    { label: "contact", filled: !!(data.basics.email || data.basics.phone), weight: 10 },
    { label: "summary", filled: !!(data.summary?.content?.trim()), weight: 10 },
    { label: "experience", filled: (data.sections.experience?.items?.length ?? 0) > 0, weight: 20 },
    { label: "projects", filled: (data.sections.projects?.items?.length ?? 0) > 0, weight: 10 },
    { label: "education", filled: (data.sections.education?.items?.length ?? 0) > 0, weight: 10 },
    { label: "skills", filled: (data.sections.skills?.items?.length ?? 0) > 0, weight: 10 },
    { label: "extra", filled: (data.sections.certifications?.items?.length ?? 0) > 0 || (data.sections.awards?.items?.length ?? 0) > 0 || (data.sections.languages?.items?.length ?? 0) > 0, weight: 5 },
  ];

  const total = checks.reduce((sum, c) => sum + c.weight, 0);
  const filled = checks.reduce((sum, c) => sum + (c.filled ? c.weight : 0), 0);
  return Math.round((filled / total) * 100);
}

export function parseResumeDataSafe(raw: string): ResumeData | null {
  try {
    return JSON.parse(raw) as ResumeData;
  } catch {
    return null;
  }
}

export function getPreviewName(raw: string): string {
  const data = parseResumeDataSafe(raw);
  return data?.basics?.name || "";
}

export function getPreviewHeadline(raw: string): string {
  const data = parseResumeDataSafe(raw);
  return data?.basics?.headline || "";
}

export function getPreviewSummary(raw: string, maxLen = 60): string {
  const data = parseResumeDataSafe(raw);
  if (!data) return "";
  const text = data.summary?.content?.trim()
    || data.sections.experience?.items?.[0]?.description?.trim()
    || "";
  if (!text) return "";
  return text.length > maxLen ? text.slice(0, maxLen) + "…" : text;
}

export function getExperienceCount(raw: string): number {
  const data = parseResumeDataSafe(raw);
  return data?.sections.experience?.items?.length ?? 0;
}
