export type ResumeData = {
  basics: {
    name: string;
    headline: string;
    email: string;
    phone: string;
    location: string;
    website: string;
  };
  summary: { content: string };
  sections: {
    experience: { items: Array<{ company: string; position: string; period: string; description: string }> };
    projects: { items: Array<{ name: string; role: string; description: string }> };
    education: { items: Array<{ school: string; degree: string; period: string; description: string }> };
    skills: { items: string[] };
  };
  customSections: unknown[];
  metadata: { template: string; language: string };
};

export function parseResumeData(json: string): ResumeData {
  return JSON.parse(json) as ResumeData;
}

export function emptyResumeData(): ResumeData {
  return {
    basics: { name: "", headline: "", email: "", phone: "", location: "", website: "" },
    summary: { content: "" },
    sections: {
      experience: { items: [] },
      projects: { items: [] },
      education: { items: [] },
      skills: { items: [] },
    },
    customSections: [],
    metadata: { template: "default", language: "zh" },
  };
}
