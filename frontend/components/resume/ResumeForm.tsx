"use client";

import { useState } from "react";
import { apiPut } from "@/lib/api";
import type { ResumeData } from "./resumeData";

type Props = {
  id: number;
  title: string;
  data: ResumeData;
  onChange: (data: ResumeData) => void;
};

export default function ResumeForm({ id, title, data, onChange }: Props) {
  const [resumeTitle, setResumeTitle] = useState(title);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function updateBasics(field: keyof ResumeData["basics"], value: string) {
    onChange({ ...data, basics: { ...data.basics, [field]: value } });
  }

  function updateSummary(content: string) {
    onChange({ ...data, summary: { content } });
  }

  function updateSkills(value: string) {
    const items = value.split(",").map((s) => s.trim()).filter(Boolean);
    onChange({ ...data, sections: { ...data.sections, skills: { items } } });
  }

  function addExperience() {
    const items = [...data.sections.experience.items, { company: "", position: "", period: "", description: "" }];
    onChange({ ...data, sections: { ...data.sections, experience: { items } } });
  }

  function removeExperience(index: number) {
    const items = data.sections.experience.items.filter((_, i) => i !== index);
    onChange({ ...data, sections: { ...data.sections, experience: { items } } });
  }

  function updateExperience(index: number, field: string, value: string) {
    const items = data.sections.experience.items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChange({ ...data, sections: { ...data.sections, experience: { items } } });
  }

  function addProject() {
    const items = [...data.sections.projects.items, { name: "", role: "", description: "" }];
    onChange({ ...data, sections: { ...data.sections, projects: { items } } });
  }

  function removeProject(index: number) {
    const items = data.sections.projects.items.filter((_, i) => i !== index);
    onChange({ ...data, sections: { ...data.sections, projects: { items } } });
  }

  function updateProject(index: number, field: string, value: string) {
    const items = data.sections.projects.items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChange({ ...data, sections: { ...data.sections, projects: { items } } });
  }

  function addEducation() {
    const items = [...data.sections.education.items, { school: "", degree: "", period: "", description: "" }];
    onChange({ ...data, sections: { ...data.sections, education: { items } } });
  }

  function removeEducation(index: number) {
    const items = data.sections.education.items.filter((_, i) => i !== index);
    onChange({ ...data, sections: { ...data.sections, education: { items } } });
  }

  function updateEducation(index: number, field: string, value: string) {
    const items = data.sections.education.items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChange({ ...data, sections: { ...data.sections, education: { items } } });
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    try {
      await apiPut(`/api/resumes/${id}`, { title: resumeTitle, resumeData: JSON.stringify(data) });
      setMessage("保存成功");
      setTimeout(() => setMessage(""), 2000);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:bg-zinc-800";
  const labelClass = "block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1";

  return (
    <div className="w-full space-y-6 p-5">
      {/* Title */}
      <div>
        <label className={labelClass}>简历标题</label>
        <input className={inputClass} value={resumeTitle} onChange={(e) => setResumeTitle(e.target.value)} />
      </div>

      {/* Basics */}
      <fieldset className="space-y-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
        <legend className="px-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">基本信息</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>姓名</label>
            <input className={inputClass} placeholder="张三" value={data.basics.name} onChange={(e) => updateBasics("name", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>职位头衔</label>
            <input className={inputClass} placeholder="高级前端工程师" value={data.basics.headline} onChange={(e) => updateBasics("headline", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>邮箱</label>
            <input className={inputClass} type="email" placeholder="email@example.com" value={data.basics.email} onChange={(e) => updateBasics("email", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>电话</label>
            <input className={inputClass} placeholder="138-0000-0000" value={data.basics.phone} onChange={(e) => updateBasics("phone", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>所在地</label>
            <input className={inputClass} placeholder="北京" value={data.basics.location} onChange={(e) => updateBasics("location", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>个人网站</label>
            <input className={inputClass} placeholder="https://" value={data.basics.website} onChange={(e) => updateBasics("website", e.target.value)} />
          </div>
        </div>
      </fieldset>

      {/* Summary */}
      <fieldset className="space-y-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
        <legend className="px-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">个人总结</legend>
        <textarea
          className={`${inputClass} min-h-[80px] resize-y`}
          placeholder="简要描述你的职业背景和核心优势..."
          value={data.summary.content}
          onChange={(e) => updateSummary(e.target.value)}
        />
      </fieldset>

      {/* Experience */}
      <fieldset className="space-y-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
        <legend className="px-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">工作经历</legend>
        {data.sections.experience.items.map((item, i) => (
          <div key={i} className="space-y-2 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input className={inputClass} placeholder="公司名称" value={item.company} onChange={(e) => updateExperience(i, "company", e.target.value)} />
              <input className={inputClass} placeholder="职位" value={item.position} onChange={(e) => updateExperience(i, "position", e.target.value)} />
            </div>
            <input className={inputClass} placeholder="时间段（如 2020.06 - 2024.01）" value={item.period} onChange={(e) => updateExperience(i, "period", e.target.value)} />
            <textarea className={`${inputClass} min-h-[60px] resize-y`} placeholder="工作描述" value={item.description} onChange={(e) => updateExperience(i, "description", e.target.value)} />
            <button type="button" onClick={() => removeExperience(i)} className="text-xs text-red-500 hover:text-red-700 transition-colors">删除</button>
          </div>
        ))}
        <button type="button" onClick={addExperience} className="rounded-lg border border-dashed border-zinc-300 px-3 py-1.5 text-sm text-zinc-500 hover:border-blue-400 hover:text-blue-600 transition-colors dark:border-zinc-600 dark:text-zinc-400">
          + 添加工作经历
        </button>
      </fieldset>

      {/* Projects */}
      <fieldset className="space-y-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
        <legend className="px-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">项目经历</legend>
        {data.sections.projects.items.map((item, i) => (
          <div key={i} className="space-y-2 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input className={inputClass} placeholder="项目名称" value={item.name} onChange={(e) => updateProject(i, "name", e.target.value)} />
              <input className={inputClass} placeholder="角色" value={item.role} onChange={(e) => updateProject(i, "role", e.target.value)} />
            </div>
            <textarea className={`${inputClass} min-h-[60px] resize-y`} placeholder="项目描述" value={item.description} onChange={(e) => updateProject(i, "description", e.target.value)} />
            <button type="button" onClick={() => removeProject(i)} className="text-xs text-red-500 hover:text-red-700 transition-colors">删除</button>
          </div>
        ))}
        <button type="button" onClick={addProject} className="rounded-lg border border-dashed border-zinc-300 px-3 py-1.5 text-sm text-zinc-500 hover:border-blue-400 hover:text-blue-600 transition-colors dark:border-zinc-600 dark:text-zinc-400">
          + 添加项目
        </button>
      </fieldset>

      {/* Education */}
      <fieldset className="space-y-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
        <legend className="px-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">教育经历</legend>
        {data.sections.education.items.map((item, i) => (
          <div key={i} className="space-y-2 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input className={inputClass} placeholder="学校" value={item.school} onChange={(e) => updateEducation(i, "school", e.target.value)} />
              <input className={inputClass} placeholder="学位" value={item.degree} onChange={(e) => updateEducation(i, "degree", e.target.value)} />
            </div>
            <input className={inputClass} placeholder="时间段" value={item.period} onChange={(e) => updateEducation(i, "period", e.target.value)} />
            <textarea className={`${inputClass} min-h-[60px] resize-y`} placeholder="描述" value={item.description} onChange={(e) => updateEducation(i, "description", e.target.value)} />
            <button type="button" onClick={() => removeEducation(i)} className="text-xs text-red-500 hover:text-red-700 transition-colors">删除</button>
          </div>
        ))}
        <button type="button" onClick={addEducation} className="rounded-lg border border-dashed border-zinc-300 px-3 py-1.5 text-sm text-zinc-500 hover:border-blue-400 hover:text-blue-600 transition-colors dark:border-zinc-600 dark:text-zinc-400">
          + 添加教育经历
        </button>
      </fieldset>

      {/* Skills */}
      <fieldset className="space-y-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
        <legend className="px-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">技能</legend>
        <textarea
          className={`${inputClass} min-h-[60px] resize-y`}
          placeholder="用逗号分隔，如：Java, Spring Boot, React, TypeScript"
          value={data.sections.skills.items.join(", ")}
          onChange={(e) => updateSkills(e.target.value)}
        />
      </fieldset>

      {/* Save button */}
      <div className="sticky bottom-0 flex items-center gap-3 border-t border-zinc-200 bg-white py-4 dark:border-zinc-700 dark:bg-zinc-900">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? "保存中..." : "保存简历"}
        </button>
        {message && (
          <span className={`text-sm font-medium ${message.includes("成功") ? "text-emerald-600" : "text-red-500"}`}>
            {message}
          </span>
        )}
      </div>
    </div>
  );
}
