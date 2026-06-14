"use client";

import React, { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { apiPut } from "@/lib/api";
import type { ResumeData, CustomSection } from "./resumeData";
import SectionOptimizeButton from "@/components/ai/SectionOptimizeButton";

type Props = {
  id: number;
  title: string;
  data: ResumeData;
  onChange: (data: ResumeData) => void;
};

function newId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ============================================================
// Shared UI primitives
// ============================================================

const inputClass = "w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20";
const labelClass = "block text-xs font-medium text-muted-foreground mb-1";
const sectionClass = "space-y-3 rounded-xl border border-border p-4";
const legendClass = "px-2 text-sm font-semibold text-muted-foreground";

function MoveButtons({ index, total, onMove }: { index: number; total: number; onMove: (from: number, to: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      <button type="button" disabled={index === 0} onClick={() => onMove(index, index - 1)} className="text-muted-foreground/60 hover:text-muted-foreground disabled:opacity-30 disabled:cursor-not-allowed px-1" title="上移"><ChevronUp className="h-4 w-4" /></button>
      <button type="button" disabled={index === total - 1} onClick={() => onMove(index, index + 1)} className="text-muted-foreground/60 hover:text-muted-foreground disabled:opacity-30 disabled:cursor-not-allowed px-1" title="下移"><ChevronDown className="h-4 w-4" /></button>
    </div>
  );
}

// ============================================================
// Main component
// ============================================================

export default function ResumeForm({ id, title, data, onChange }: Props) {
  const [resumeTitle, setResumeTitle] = useState(title);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // ----------------------------------------------------------
  // Data mutation helpers
  // ----------------------------------------------------------
  function updateBasics(field: string, value: string) {
    onChange({ ...data, basics: { ...data.basics, [field]: value } });
  }
  function updateSummary(content: string) {
    onChange({ ...data, summary: { ...data.summary, content } });
  }
  function addItem<T extends { id: string }>(sectionKey: keyof ResumeData["sections"], newItem: T) {
    const section = data.sections[sectionKey] as any;
    onChange({ ...data, sections: { ...data.sections, [sectionKey]: { ...section, items: [...section.items, newItem] } } });
  }
  function removeItem(sectionKey: keyof ResumeData["sections"], index: number) {
    const section = data.sections[sectionKey] as any;
    onChange({ ...data, sections: { ...data.sections, [sectionKey]: { ...section, items: section.items.filter((_: any, i: number) => i !== index) } } });
  }
  function updateItem(sectionKey: keyof ResumeData["sections"], index: number, field: string, value: any) {
    const section = data.sections[sectionKey] as any;
    const items = section.items.map((item: any, i: number) => (i === index ? { ...item, [field]: value } : item));
    onChange({ ...data, sections: { ...data.sections, [sectionKey]: { ...section, items } } });
  }
  function moveItem(sectionKey: keyof ResumeData["sections"], fromIndex: number, toIndex: number) {
    const section = data.sections[sectionKey] as any;
    const items = [...section.items];
    const [moved] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, moved);
    onChange({ ...data, sections: { ...data.sections, [sectionKey]: { ...section, items } } });
  }
  function addCustomSection() {
    const newSection: CustomSection = { id: newId(), title: "自定义段落", type: "experience", columns: 1, hidden: false, items: [] };
    onChange({ ...data, customSections: [...data.customSections, newSection] });
  }
  function removeCustomSection(sectionId: string) {
    onChange({ ...data, customSections: data.customSections.filter((s) => s.id !== sectionId) });
  }
  function updateCustomSectionMeta(sectionId: string, field: string, value: any) {
    onChange({ ...data, customSections: data.customSections.map((s) => (s.id === sectionId ? { ...s, [field]: value } : s)) });
  }
  function addCustomSectionItem(sectionId: string) {
    onChange({ ...data, customSections: data.customSections.map((s) => s.id === sectionId ? { ...s, items: [...s.items, { id: newId() }] } : s) });
  }
  function removeCustomSectionItem(sectionId: string, index: number) {
    onChange({ ...data, customSections: data.customSections.map((s) => s.id === sectionId ? { ...s, items: s.items.filter((_: any, i: number) => i !== index) } : s) });
  }
  function updateCustomSectionItem(sectionId: string, index: number, field: string, value: any) {
    onChange({ ...data, customSections: data.customSections.map((s) => s.id === sectionId ? { ...s, items: s.items.map((item: any, i: number) => (i === index ? { ...item, [field]: value } : item)) } : s) });
  }
  function addCustomField() {
    const field = { id: newId(), text: "", link: "" };
    onChange({ ...data, basics: { ...data.basics, customFields: [...(data.basics.customFields || []), field] } });
  }
  function removeCustomField(fieldId: string) {
    onChange({ ...data, basics: { ...data.basics, customFields: (data.basics.customFields || []).filter((f) => f.id !== fieldId) } });
  }
  function updateCustomField(fieldId: string, key: string, value: string) {
    onChange({ ...data, basics: { ...data.basics, customFields: (data.basics.customFields || []).map((f) => (f.id === fieldId ? { ...f, [key]: value } : f)) } });
  }
  async function handleSave() {
    setSaving(true); setMessage("");
    try {
      await apiPut(`/api/resumes/${id}`, { title: resumeTitle, resumeData: JSON.stringify(data) });
      setMessage("保存成功"); setTimeout(() => setMessage(""), 2000);
    } catch (err) { setMessage(err instanceof Error ? err.message : "保存失败"); }
    finally { setSaving(false); }
  }

  // ----------------------------------------------------------
  // Section renderers — each returns JSX for one section
  // ----------------------------------------------------------

  function renderBasics() {
    return (
      <fieldset key="basics" id="section-basics" data-section-id="basics" className={sectionClass}>
        <legend className={legendClass}>基本信息</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><label className={labelClass}>姓名</label><input className={inputClass} placeholder="张三" value={data.basics.name} onChange={(e) => updateBasics("name", e.target.value)} /></div>
          <div><label className={labelClass}>职位头衔</label><input className={inputClass} placeholder="高级前端工程师" value={data.basics.headline} onChange={(e) => updateBasics("headline", e.target.value)} /></div>
          <div><label className={labelClass}>邮箱</label><input className={inputClass} type="email" placeholder="email@example.com" value={data.basics.email} onChange={(e) => updateBasics("email", e.target.value)} /></div>
          <div><label className={labelClass}>电话</label><input className={inputClass} placeholder="138-0000-0000" value={data.basics.phone} onChange={(e) => updateBasics("phone", e.target.value)} /></div>
          <div><label className={labelClass}>所在地</label><input className={inputClass} placeholder="北京" value={data.basics.location} onChange={(e) => updateBasics("location", e.target.value)} /></div>
          <div><label className={labelClass}>个人网站</label><input className={inputClass} placeholder="https://" value={data.basics.website} onChange={(e) => updateBasics("website", e.target.value)} /></div>
        </div>
        {(data.basics.customFields || []).map((field) => (
          <div key={field.id} className="flex items-center gap-2 mt-2">
            <input className={inputClass} placeholder="自定义字段" value={field.text} onChange={(e) => updateCustomField(field.id, "text", e.target.value)} />
            <input className={inputClass} placeholder="链接 (可选)" value={field.link || ""} onChange={(e) => updateCustomField(field.id, "link", e.target.value)} />
            <button type="button" onClick={() => removeCustomField(field.id)} className="text-xs text-destructive hover:text-destructive shrink-0">删除</button>
          </div>
        ))}
        <button type="button" onClick={addCustomField} className="text-xs text-primary hover:text-primary mt-1">+ 添加自定义字段</button>
      </fieldset>
    );
  }

  function renderSummary() {
    return (
      <fieldset key="summary" id="section-summary" data-section-id="summary" className={sectionClass}>
        <div className="flex items-center justify-between">
          <legend className={legendClass}>个人总结</legend>
          <SectionOptimizeButton sectionType="summary" currentContent={data.summary.content} onApply={(optimized) => updateSummary(optimized)} />
        </div>
        <textarea className={`${inputClass} min-h-[80px] resize-y`} placeholder="简要描述你的职业背景和核心优势..." value={data.summary.content} onChange={(e) => updateSummary(e.target.value)} />
      </fieldset>
    );
  }

  function renderProfiles() {
    return (
      <fieldset key="profiles" id="section-profiles" data-section-id="profiles" className={sectionClass}>
        <legend className={legendClass}>个人资料 (GitHub/LinkedIn)</legend>
        {data.sections.profiles.items.map((item, i) => (
          <div key={item.id} className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
            <input className={`${inputClass} w-28`} placeholder="平台" value={item.network} onChange={(e) => updateItem("profiles", i, "network", e.target.value)} />
            <input className={inputClass} placeholder="用户名" value={item.username} onChange={(e) => updateItem("profiles", i, "username", e.target.value)} />
            <input className={inputClass} placeholder="链接" value={item.url || ""} onChange={(e) => updateItem("profiles", i, "url", e.target.value)} />
            <MoveButtons index={i} total={data.sections.profiles.items.length} onMove={(f, t) => moveItem("profiles", f, t)} />
            <button type="button" onClick={() => removeItem("profiles", i)} className="text-xs text-destructive hover:text-destructive shrink-0">删除</button>
          </div>
        ))}
        <button type="button" onClick={() => addItem("profiles", { id: newId(), network: "", username: "", url: "" })} className="rounded-lg border border-dashed border-border px-3 py-1.5 text-sm text-muted-foreground hover:border-primary/80 hover:text-primary transition-colors">+ 添加个人资料</button>
      </fieldset>
    );
  }

  function renderExperience() {
    return (
      <fieldset key="experience" id="section-experience" data-section-id="experience" className={sectionClass}>
        <legend className={legendClass}>工作经历</legend>
        {data.sections.experience.items.map((item, i) => (
          <div key={item.id} className="space-y-2 rounded-lg bg-muted/50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground/60">#{i + 1}</span>
              <div className="flex items-center gap-2">
                <SectionOptimizeButton sectionType="experience" currentContent={`公司: ${item.company}\n职位: ${item.position}\n时间: ${item.period}\n描述: ${item.description}`} onApply={(optimized) => { try { const p = JSON.parse(optimized); if (p.company) updateItem("experience", i, "company", p.company); if (p.position) updateItem("experience", i, "position", p.position); if (p.description) updateItem("experience", i, "description", p.description); } catch { updateItem("experience", i, "description", optimized); } }} />
                <MoveButtons index={i} total={data.sections.experience.items.length} onMove={(f, t) => moveItem("experience", f, t)} />
                <button type="button" onClick={() => removeItem("experience", i)} className="text-xs text-destructive hover:text-destructive">删除</button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input className={inputClass} placeholder="公司名称" value={item.company} onChange={(e) => updateItem("experience", i, "company", e.target.value)} />
              <input className={inputClass} placeholder="职位" value={item.position} onChange={(e) => updateItem("experience", i, "position", e.target.value)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input className={inputClass} placeholder="时间段（如 2020.06 - 2024.01）" value={item.period} onChange={(e) => updateItem("experience", i, "period", e.target.value)} />
              <input className={inputClass} placeholder="地点 (可选)" value={item.location || ""} onChange={(e) => updateItem("experience", i, "location", e.target.value)} />
            </div>
            <textarea className={`${inputClass} min-h-[60px] resize-y`} placeholder="工作描述" value={item.description} onChange={(e) => updateItem("experience", i, "description", e.target.value)} />
          </div>
        ))}
        <button type="button" onClick={() => addItem("experience", { id: newId(), company: "", position: "", location: "", period: "", description: "" })} className="rounded-lg border border-dashed border-border px-3 py-1.5 text-sm text-muted-foreground hover:border-primary/80 hover:text-primary transition-colors">+ 添加工作经历</button>
      </fieldset>
    );
  }

  function renderProjects() {
    return (
      <fieldset key="projects" id="section-projects" data-section-id="projects" className={sectionClass}>
        <legend className={legendClass}>项目经历</legend>
        {data.sections.projects.items.map((item, i) => (
          <div key={item.id} className="space-y-2 rounded-lg bg-muted/50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground/60">#{i + 1}</span>
              <div className="flex items-center gap-2">
                <SectionOptimizeButton sectionType="projects" currentContent={`项目: ${item.name}\n描述: ${item.description}`} onApply={(optimized) => { try { const p = JSON.parse(optimized); if (p.name) updateItem("projects", i, "name", p.name); if (p.description) updateItem("projects", i, "description", p.description); } catch { updateItem("projects", i, "description", optimized); } }} />
                <MoveButtons index={i} total={data.sections.projects.items.length} onMove={(f, t) => moveItem("projects", f, t)} />
                <button type="button" onClick={() => removeItem("projects", i)} className="text-xs text-destructive hover:text-destructive">删除</button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input className={inputClass} placeholder="项目名称" value={item.name} onChange={(e) => updateItem("projects", i, "name", e.target.value)} />
              <input className={inputClass} placeholder="角色" value={item.role} onChange={(e) => updateItem("projects", i, "role", e.target.value)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input className={inputClass} placeholder="时间段 (可选)" value={item.period || ""} onChange={(e) => updateItem("projects", i, "period", e.target.value)} />
              <input className={inputClass} placeholder="链接 (可选)" value={item.website || ""} onChange={(e) => updateItem("projects", i, "website", e.target.value)} />
            </div>
            <textarea className={`${inputClass} min-h-[60px] resize-y`} placeholder="项目描述" value={item.description} onChange={(e) => updateItem("projects", i, "description", e.target.value)} />
          </div>
        ))}
        <button type="button" onClick={() => addItem("projects", { id: newId(), name: "", role: "", period: "", website: "", description: "" })} className="rounded-lg border border-dashed border-border px-3 py-1.5 text-sm text-muted-foreground hover:border-primary/80 hover:text-primary transition-colors">+ 添加项目经历</button>
      </fieldset>
    );
  }

  function renderEducation() {
    return (
      <fieldset key="education" id="section-education" data-section-id="education" className={sectionClass}>
        <legend className={legendClass}>教育经历</legend>
        {data.sections.education.items.map((item, i) => (
          <div key={item.id} className="space-y-2 rounded-lg bg-muted/50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground/60">#{i + 1}</span>
              <div className="flex items-center gap-2">
                <MoveButtons index={i} total={data.sections.education.items.length} onMove={(f, t) => moveItem("education", f, t)} />
                <button type="button" onClick={() => removeItem("education", i)} className="text-xs text-destructive hover:text-destructive">删除</button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input className={inputClass} placeholder="学校" value={item.school} onChange={(e) => updateItem("education", i, "school", e.target.value)} />
              <input className={inputClass} placeholder="学位" value={item.degree} onChange={(e) => updateItem("education", i, "degree", e.target.value)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input className={inputClass} placeholder="时间段" value={item.period} onChange={(e) => updateItem("education", i, "period", e.target.value)} />
              <input className={inputClass} placeholder="专业方向 (可选)" value={item.area || ""} onChange={(e) => updateItem("education", i, "area", e.target.value)} />
            </div>
            <textarea className={`${inputClass} min-h-[60px] resize-y`} placeholder="描述" value={item.description} onChange={(e) => updateItem("education", i, "description", e.target.value)} />
          </div>
        ))}
        <button type="button" onClick={() => addItem("education", { id: newId(), school: "", degree: "", area: "", period: "", description: "" })} className="rounded-lg border border-dashed border-border px-3 py-1.5 text-sm text-muted-foreground hover:border-primary/80 hover:text-primary transition-colors">+ 添加教育经历</button>
      </fieldset>
    );
  }

  function renderSkills() {
    return (
      <fieldset key="skills" id="section-skills" data-section-id="skills" className={sectionClass}>
        <legend className={legendClass}>技能</legend>
        {data.sections.skills.items.map((item, i) => (
          <div key={item.id} className="rounded-lg bg-muted/50 p-3 space-y-2">
            {/* Row 1: name + level + move + delete */}
            <div className="flex items-center gap-2">
              <input className={`${inputClass} flex-1`} placeholder="技能类别（如：前端开发）" value={item.name} onChange={(e) => updateItem("skills", i, "name", e.target.value)} />
              <div className="flex items-center gap-1 shrink-0">
                <label className="text-[10px] text-muted-foreground/60">等级</label>
                <input className={`${inputClass} w-14 text-center`} type="number" min={0} max={5} placeholder="0-5" value={item.level ?? ""} onChange={(e) => updateItem("skills", i, "level", e.target.value ? Number(e.target.value) : undefined)} />
              </div>
              <MoveButtons index={i} total={data.sections.skills.items.length} onMove={(f, t) => moveItem("skills", f, t)} />
              <button type="button" onClick={() => removeItem("skills", i)} className="text-xs text-destructive hover:text-destructive shrink-0">删除</button>
            </div>
            {/* Row 2: keywords as tags */}
            <div className="flex flex-wrap items-center gap-1.5">
              {item.keywords.map((kw, ki) => (
                <span key={ki} className="inline-flex items-center gap-1 rounded-full bg-primary/5 px-2.5 py-0.5 text-xs text-primary">
                  {kw}
                  <button
                    type="button"
                    onClick={() => {
                      const newKw = item.keywords.filter((_, idx) => idx !== ki);
                      updateItem("skills", i, "keywords", newKw);
                    }}
                    className="text-primary/80 hover:text-destructive ml-0.5"
                  >×</button>
                </span>
              ))}
              <input
                className="flex-1 min-w-[120px] border-0 bg-transparent text-xs text-muted-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-0"
                placeholder="输入关键词后按 Enter 添加..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const val = (e.target as HTMLInputElement).value.trim();
                    if (val && !item.keywords.includes(val)) {
                      updateItem("skills", i, "keywords", [...item.keywords, val]);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
              />
            </div>
          </div>
        ))}
        <button type="button" onClick={() => addItem("skills", { id: newId(), name: "", keywords: [], level: undefined })} className="rounded-lg border border-dashed border-border px-3 py-1.5 text-sm text-muted-foreground hover:border-primary/80 hover:text-primary transition-colors">+ 添加技能</button>
      </fieldset>
    );
  }

  function renderLanguages() {
    return (
      <fieldset key="languages" id="section-languages" data-section-id="languages" className={sectionClass}>
        <legend className={legendClass}>语言</legend>
        {data.sections.languages.items.map((item, i) => (
          <div key={item.id} className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
            <input className={inputClass} placeholder="语言名称" value={item.name} onChange={(e) => updateItem("languages", i, "name", e.target.value)} />
            <select className={inputClass} value={item.level || ""} onChange={(e) => updateItem("languages", i, "level", e.target.value)}>
              <option value="">选择水平</option>
              <option value="native">母语</option>
              <option value="fluent">流利</option>
              <option value="intermediate">中级</option>
              <option value="beginner">初级</option>
            </select>
            <MoveButtons index={i} total={data.sections.languages.items.length} onMove={(f, t) => moveItem("languages", f, t)} />
            <button type="button" onClick={() => removeItem("languages", i)} className="text-xs text-destructive hover:text-destructive shrink-0">删除</button>
          </div>
        ))}
        <button type="button" onClick={() => addItem("languages", { id: newId(), name: "", level: "" })} className="rounded-lg border border-dashed border-border px-3 py-1.5 text-sm text-muted-foreground hover:border-primary/80 hover:text-primary transition-colors">+ 添加语言</button>
      </fieldset>
    );
  }

  function renderCertifications() {
    return (
      <fieldset key="certifications" id="section-certifications" data-section-id="certifications" className={sectionClass}>
        <legend className={legendClass}>证书</legend>
        {data.sections.certifications.items.map((item, i) => (
          <div key={item.id} className="space-y-2 rounded-lg bg-muted/50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground/60">#{i + 1}</span>
              <div className="flex items-center gap-2">
                <MoveButtons index={i} total={data.sections.certifications.items.length} onMove={(f, t) => moveItem("certifications", f, t)} />
                <button type="button" onClick={() => removeItem("certifications", i)} className="text-xs text-destructive hover:text-destructive">删除</button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input className={inputClass} placeholder="证书名称" value={item.name} onChange={(e) => updateItem("certifications", i, "name", e.target.value)} />
              <input className={inputClass} placeholder="颁发机构" value={item.issuer || ""} onChange={(e) => updateItem("certifications", i, "issuer", e.target.value)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input className={inputClass} placeholder="获得日期" value={item.date || ""} onChange={(e) => updateItem("certifications", i, "date", e.target.value)} />
              <input className={inputClass} placeholder="链接 (可选)" value={item.url || ""} onChange={(e) => updateItem("certifications", i, "url", e.target.value)} />
            </div>
          </div>
        ))}
        <button type="button" onClick={() => addItem("certifications", { id: newId(), name: "", issuer: "", date: "", url: "" })} className="rounded-lg border border-dashed border-border px-3 py-1.5 text-sm text-muted-foreground hover:border-primary/80 hover:text-primary transition-colors">+ 添加证书</button>
      </fieldset>
    );
  }

  function renderAwards() {
    return (
      <fieldset key="awards" id="section-awards" data-section-id="awards" className={sectionClass}>
        <legend className={legendClass}>荣誉奖项</legend>
        {data.sections.awards.items.map((item, i) => (
          <div key={item.id} className="space-y-2 rounded-lg bg-muted/50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground/60">#{i + 1}</span>
              <div className="flex items-center gap-2">
                <MoveButtons index={i} total={data.sections.awards.items.length} onMove={(f, t) => moveItem("awards", f, t)} />
                <button type="button" onClick={() => removeItem("awards", i)} className="text-xs text-destructive hover:text-destructive">删除</button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input className={inputClass} placeholder="奖项名称" value={item.title} onChange={(e) => updateItem("awards", i, "title", e.target.value)} />
              <input className={inputClass} placeholder="颁发机构" value={item.issuer || ""} onChange={(e) => updateItem("awards", i, "issuer", e.target.value)} />
            </div>
            <input className={inputClass} placeholder="获得日期" value={item.date || ""} onChange={(e) => updateItem("awards", i, "date", e.target.value)} />
            <textarea className={`${inputClass} min-h-[40px] resize-y`} placeholder="描述 (可选)" value={item.description || ""} onChange={(e) => updateItem("awards", i, "description", e.target.value)} />
          </div>
        ))}
        <button type="button" onClick={() => addItem("awards", { id: newId(), title: "", issuer: "", date: "", description: "" })} className="rounded-lg border border-dashed border-border px-3 py-1.5 text-sm text-muted-foreground hover:border-primary/80 hover:text-primary transition-colors">+ 添加荣誉奖项</button>
      </fieldset>
    );
  }

  function renderCustomSections() {
    return (
      <div key="customSections" id="section-customSections" data-section-id="customSections">
        {data.customSections.map((section) => (
          <fieldset key={section.id} className={`${sectionClass} border-dashed`}>
            <div className="flex items-center justify-between">
              <input className="bg-transparent text-sm font-semibold text-muted-foreground outline-none border-b border-transparent hover:border-border focus:border-primary px-1" value={section.title} onChange={(e) => updateCustomSectionMeta(section.id, "title", e.target.value)} />
              <div className="flex items-center gap-2">
                <select className="text-xs bg-muted rounded px-2 py-1" value={section.type} onChange={(e) => updateCustomSectionMeta(section.id, "type", e.target.value)}>
                  <option value="experience">经历类</option>
                  <option value="education">教育类</option>
                  <option value="projects">项目类</option>
                  <option value="skills">技能类</option>
                  <option value="certifications">证书类</option>
                  <option value="awards">奖项类</option>
                </select>
                <button type="button" onClick={() => removeCustomSection(section.id)} className="text-xs text-destructive hover:text-destructive">删除段落</button>
              </div>
            </div>
            {section.items.map((item: any, i: number) => (
              <div key={item.id || i} className="flex items-center gap-2 mt-2">
                <input className={inputClass} placeholder="标题/名称" value={item.name || item.title || ""} onChange={(e) => updateCustomSectionItem(section.id, i, section.type === "awards" ? "title" : "name", e.target.value)} />
                <input className={inputClass} placeholder="描述" value={item.description || ""} onChange={(e) => updateCustomSectionItem(section.id, i, "description", e.target.value)} />
                <button type="button" onClick={() => removeCustomSectionItem(section.id, i)} className="text-xs text-destructive hover:text-destructive shrink-0">删除</button>
              </div>
            ))}
            <button type="button" onClick={() => addCustomSectionItem(section.id)} className="rounded-lg border border-dashed border-border px-3 py-1.5 text-sm text-muted-foreground hover:border-primary/80 hover:text-primary transition-colors mt-2">+ 添加条目</button>
          </fieldset>
        ))}
        <button type="button" onClick={addCustomSection} className="w-full rounded-lg border-2 border-dashed border-border px-3 py-3 text-sm font-medium text-muted-foreground hover:border-primary/80 hover:text-primary transition-colors">+ 添加自定义段落</button>
      </div>
    );
  }

  // ----------------------------------------------------------
  // Renderer map — section ID → render function
  // ----------------------------------------------------------

  const RENDERERS: Record<string, () => React.ReactNode> = {
    basics: renderBasics,
    summary: renderSummary,
    profiles: renderProfiles,
    experience: renderExperience,
    projects: renderProjects,
    education: renderEducation,
    skills: renderSkills,
    languages: renderLanguages,
    certifications: renderCertifications,
    awards: renderAwards,
    customSections: renderCustomSections,
  };

  // ----------------------------------------------------------
  // Render: title + sections in enabledSections order + save
  // ----------------------------------------------------------

  return (
    <div className="w-full space-y-6 p-5">
      {/* Title — always first */}
      <div>
        <label className={labelClass}>简历标题</label>
        <input className={inputClass} value={resumeTitle} onChange={(e) => setResumeTitle(e.target.value)} />
      </div>

      {/* Sections rendered in the exact order of enabledSections */}
      {data.enabledSections.map((sectionId) => {
        const renderer = RENDERERS[sectionId];
        return renderer ? renderer() : null;
      })}

      {/* Save — always last */}
      <div className="sticky bottom-0 flex items-center gap-3 border-t border-border bg-background py-4">
        <button type="button" onClick={handleSave} disabled={saving} className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          {saving ? "保存中..." : "保存简历"}
        </button>
        {message && <span className={`text-sm font-medium ${message.includes("成功") ? "text-success" : "text-destructive"}`}>{message}</span>}
      </div>
    </div>
  );
}
