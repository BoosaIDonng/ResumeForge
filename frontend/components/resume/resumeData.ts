export type CustomField = {
  id: string;
  text: string;
  link?: string;
};

export type ProfileItem = {
  id?: string;
  network: string;
  username: string;
  url?: string;
};

export type ExperienceItem = {
  id?: string;
  company: string;
  position: string;
  period: string;
  location?: string;
  description?: string;
};

export type ProjectItem = {
  id?: string;
  name: string;
  role: string;
  period?: string;
  website?: string;
  description?: string;
};

export type EducationItem = {
  id?: string;
  school: string;
  degree: string;
  area?: string;
  period: string;
  description?: string;
};

export type SkillItem = {
  id?: string;
  name: string;
  keywords: string[];
  level?: number;
};

export type LanguageItem = {
  id?: string;
  name: string;
  level?: string;
};

export type CertificationItem = {
  id?: string;
  name: string;
  issuer?: string;
  date?: string;
  url?: string;
};

export type AwardItem = {
  id?: string;
  title: string;
  issuer?: string;
  date?: string;
  description?: string;
};

export type ResumeSection<T> = {
  title: string;
  hidden: boolean;
  items: T[];
};

export type CustomSection = {
  id: string;
  title: string;
  type: string;
  columns?: number;
  hidden?: boolean;
  items: any[];
};

// ============================================================
// Module registry — single source of truth for all available modules
// ============================================================

export interface ModuleDef {
  id: string;
  label: string;
  /** Whether this module is enabled by default for new resumes */
  defaultEnabled: boolean;
  /** Whether this module can be removed (basics/design are always on) */
  removable: boolean;
}

export const MODULE_REGISTRY: ModuleDef[] = [
  { id: 'basics', label: '基本信息', defaultEnabled: true, removable: false },
  { id: 'summary', label: '个人总结', defaultEnabled: true, removable: true },
  { id: 'profiles', label: '社交链接', defaultEnabled: false, removable: true },
  { id: 'experience', label: '工作经历', defaultEnabled: true, removable: true },
  { id: 'projects', label: '项目经历', defaultEnabled: true, removable: true },
  { id: 'education', label: '教育经历', defaultEnabled: true, removable: true },
  { id: 'skills', label: '技能', defaultEnabled: true, removable: true },
  { id: 'languages', label: '语言', defaultEnabled: false, removable: true },
  { id: 'certifications', label: '证书', defaultEnabled: false, removable: true },
  { id: 'awards', label: '奖项', defaultEnabled: false, removable: true },
  { id: 'customSections', label: '自定义模块', defaultEnabled: false, removable: true },
  { id: 'design', label: '设计设置', defaultEnabled: true, removable: false },
];

/** Get all module IDs that can be added (not always-on) */
export const REMOVABLE_MODULE_IDS = MODULE_REGISTRY.filter(m => m.removable).map(m => m.id);
/** Get all module IDs that are always enabled */
export const FIXED_MODULE_IDS = MODULE_REGISTRY.filter(m => !m.removable).map(m => m.id);

export type ResumeData = {
  basics: {
    name: string;
    headline: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    customFields?: CustomField[];
  };
  summary: {
    title: string;
    content: string;
    hidden: boolean;
  };
  sections: {
    profiles: ResumeSection<ProfileItem>;
    experience: ResumeSection<ExperienceItem>;
    projects: ResumeSection<ProjectItem>;
    education: ResumeSection<EducationItem>;
    skills: ResumeSection<SkillItem>;
    languages: ResumeSection<LanguageItem>;
    certifications: ResumeSection<CertificationItem>;
    awards: ResumeSection<AwardItem>;
  };
  customSections: CustomSection[];
  /** Ordered list of enabled module IDs. Controls what the editor renders. */
  enabledSections: string[];
  metadata: {
    template: string;
    language: string;
    design?: {
      colors?: {
        primary?: string;
        text?: string;
        background?: string;
      };
    };
    typography?: {
      body?: {
        fontFamily?: string;
      };
    };
  };
};

function newId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/** Migrate old-format resume data to the new schema */
export function migrateResumeData(old: any): ResumeData {
  const defaults = emptyResumeData();

  // Migrate items: add id if missing
  function ensureIds(items: any[]): any[] {
    if (!Array.isArray(items)) return [];
    return items.map((item) => (item.id ? item : { ...item, id: newId() }));
  }

  // Migrate skills from flat string[] to SkillItem[]
  function migrateSkills(oldSkills: any): ResumeSection<SkillItem> {
    if (!oldSkills) return defaults.sections.skills;
    const items = Array.isArray(oldSkills.items) ? oldSkills.items : [];
    const migrated = items.map((item: any) => {
      if (typeof item === "string") {
        return { id: newId(), name: item, keywords: [item], level: undefined };
      }
      return { id: item.id || newId(), name: item.name || "", keywords: item.keywords || [item.name || ""], level: item.level };
    });
    return { title: oldSkills.title || "技能", hidden: oldSkills.hidden || false, items: migrated };
  }

  // Migrate enabledSections: if missing, infer from data
  let enabledSections: string[] = old.enabledSections;
  if (!Array.isArray(enabledSections) || enabledSections.length === 0) {
    enabledSections = ['basics', 'summary'];
    // Add sections that have content or are not hidden
    const sectionKeys = ['profiles', 'experience', 'projects', 'education', 'skills', 'languages', 'certifications', 'awards'];
    for (const key of sectionKeys) {
      const section = old.sections?.[key];
      if (section && (!section.hidden || (Array.isArray(section.items) && section.items.length > 0))) {
        enabledSections.push(key);
      }
    }
    if (old.customSections && old.customSections.length > 0) {
      enabledSections.push('customSections');
    }
    enabledSections.push('design');
  }

  return {
    basics: {
      name: old.basics?.name || "",
      headline: old.basics?.headline || "",
      email: old.basics?.email || "",
      phone: old.basics?.phone || "",
      location: old.basics?.location || "",
      website: old.basics?.website || old.basics?.url || "",
      customFields: old.basics?.customFields || [],
    },
    summary: {
      title: old.summary?.title || "个人总结",
      content: old.summary?.content || old.basics?.summary || "",
      hidden: old.summary?.hidden || false,
    },
    sections: {
      profiles: old.sections?.profiles
        ? { title: "个人资料", hidden: false, ...old.sections.profiles, items: ensureIds(old.sections.profiles.items) }
        : defaults.sections.profiles,
      experience: old.sections?.experience
        ? { title: "工作经历", hidden: false, ...old.sections.experience, items: ensureIds(old.sections.experience.items) }
        : defaults.sections.experience,
      projects: old.sections?.projects
        ? { title: "项目经历", hidden: false, ...old.sections.projects, items: ensureIds(old.sections.projects.items) }
        : defaults.sections.projects,
      education: old.sections?.education
        ? { title: "教育经历", hidden: false, ...old.sections.education, items: ensureIds(old.sections.education.items) }
        : defaults.sections.education,
      skills: migrateSkills(old.sections?.skills),
      languages: old.sections?.languages
        ? { title: "语言", hidden: false, ...old.sections.languages, items: ensureIds(old.sections.languages.items) }
        : defaults.sections.languages,
      certifications: old.sections?.certifications
        ? { title: "证书", hidden: false, ...old.sections.certifications, items: ensureIds(old.sections.certifications.items) }
        : defaults.sections.certifications,
      awards: old.sections?.awards
        ? { title: "荣誉奖项", hidden: false, ...old.sections.awards, items: ensureIds(old.sections.awards.items) }
        : defaults.sections.awards,
    },
    customSections: (old.customSections || []).map((s: any) => ({
      id: s.id || newId(),
      title: s.title || "自定义段落",
      type: s.type || "experience",
      columns: s.columns || 1,
      hidden: s.hidden || false,
      items: ensureIds(s.items),
    })),
    enabledSections,
    metadata: {
      template: old.metadata?.template || "default",
      language: old.metadata?.language || "zh",
      design: old.metadata?.design,
      typography: old.metadata?.typography,
    },
  };
}

export function parseResumeData(json: string): ResumeData {
  const raw = JSON.parse(json);
  return migrateResumeData(raw);
}

export function emptyResumeData(): ResumeData {
  return {
    basics: {
      name: "",
      headline: "",
      email: "",
      phone: "",
      location: "",
      website: "",
      customFields: [],
    },
    summary: { title: "个人总结", content: "", hidden: false },
    sections: {
      profiles: { title: "个人资料", hidden: false, items: [] },
      experience: { title: "工作经历", hidden: false, items: [] },
      projects: { title: "项目经历", hidden: false, items: [] },
      education: { title: "教育经历", hidden: false, items: [] },
      skills: { title: "技能", hidden: false, items: [] },
      languages: { title: "语言", hidden: false, items: [] },
      certifications: { title: "证书", hidden: false, items: [] },
      awards: { title: "荣誉奖项", hidden: false, items: [] },
    },
    customSections: [],
    enabledSections: ['basics', 'summary', 'experience', 'projects', 'education', 'skills', 'design'],
    metadata: { template: "default", language: "zh" },
  };
}
