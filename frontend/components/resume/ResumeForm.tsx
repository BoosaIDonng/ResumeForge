"use client";

import React, { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { resumeStorage } from "@/lib/storage";
import type { ResumeData, CustomSection } from "./resumeData";
import SectionOptimizeButton from "@/components/ai/SectionOptimizeButton";
import { FieldWrapper, EditableText, EditableRichText, EditableDate, EditableList, EditableSelect } from "@/components/editor/fields";
import { Label } from "@/components/ui/label";

type Props = {
  id: string;
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

const sectionClass = "space-y-3 border border-border p-4";
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
  function handleSave() {
    setSaving(true); setMessage("");
    try {
      resumeStorage.update(id, { title: resumeTitle, resumeData: data });
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
        <FieldWrapper columns={2}>
          <EditableText label="姓名" value={data.basics.name} onChange={(v) => updateBasics("name", v)} placeholder="张三" />
          <EditableText label="职位头衔" value={data.basics.headline} onChange={(v) => updateBasics("headline", v)} placeholder="高级前端工程师" />
          <EditableText label="年龄" value={data.basics.age || ""} onChange={(v) => updateBasics("age", v)} placeholder="28" />
          <EditableSelect label="性别" value={data.basics.gender || ""} onChange={(v) => updateBasics("gender", v)} options={[{ label: "男", value: "男" }, { label: "女", value: "女" }]} placeholder="选择性别" />
          <EditableSelect label="政治面貌" value={data.basics.politicalStatus || ""} onChange={(v) => updateBasics("politicalStatus", v)} options={[{ label: "群众", value: "群众" }, { label: "团员", value: "团员" }, { label: "党员", value: "党员" }]} placeholder="选择" />
          <EditableText label="民族" value={data.basics.ethnicity || ""} onChange={(v) => updateBasics("ethnicity", v)} placeholder="汉族" />
          <EditableText label="籍贯" value={data.basics.hometown || ""} onChange={(v) => updateBasics("hometown", v)} placeholder="北京" />
          <EditableSelect label="婚姻状况" value={data.basics.maritalStatus || ""} onChange={(v) => updateBasics("maritalStatus", v)} options={[{ label: "未婚", value: "未婚" }, { label: "已婚", value: "已婚" }]} placeholder="选择" />
          <EditableText label="工作年限" value={data.basics.yearsOfExperience || ""} onChange={(v) => updateBasics("yearsOfExperience", v)} placeholder="5年" />
          <EditableSelect label="学历层次" value={data.basics.educationLevel || ""} onChange={(v) => updateBasics("educationLevel", v)} options={[{ label: "大专", value: "大专" }, { label: "本科", value: "本科" }, { label: "硕士", value: "硕士" }, { label: "博士", value: "博士" }]} placeholder="选择" />
          <EditableText label="邮箱" value={data.basics.email} onChange={(v) => updateBasics("email", v)} type="email" placeholder="email@example.com" />
          <EditableText label="电话" value={data.basics.phone} onChange={(v) => updateBasics("phone", v)} type="tel" placeholder="138-0000-0000" />
          <EditableText label="微信" value={data.basics.wechat || ""} onChange={(v) => updateBasics("wechat", v)} placeholder="微信号" />
          <EditableText label="所在地" value={data.basics.location} onChange={(v) => updateBasics("location", v)} placeholder="北京" />
        </FieldWrapper>
        <div className="mt-3">
          <EditableText label="个人网站" value={data.basics.website} onChange={(v) => updateBasics("website", v)} placeholder="https://" />
        </div>
        {/* Custom fields */}
        {(data.basics.customFields || []).map((field) => (
          <div key={field.id} className="flex items-center gap-2 mt-2">
            <EditableText label="" value={field.text} onChange={(v) => updateCustomField(field.id, "text", v)} placeholder="自定义字段" className="flex-1" />
            <EditableText label="" value={field.link || ""} onChange={(v) => updateCustomField(field.id, "link", v)} placeholder="链接" className="flex-1" />
            <button type="button" onClick={() => removeCustomField(field.id)} className="text-xs text-destructive hover:text-destructive shrink-0 mt-5">删除</button>
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
        <EditableRichText label="" value={data.summary.content} onChange={(v) => updateSummary(v)} rows={3} placeholder="简要描述你的职业背景和核心优势..." />
      </fieldset>
    );
  }

  function renderProfiles() {
    return (
      <fieldset key="profiles" id="section-profiles" data-section-id="profiles" className={sectionClass}>
        <legend className={legendClass}>个人资料 (GitHub/LinkedIn)</legend>
        {data.sections.profiles.items.map((item, i) => (
          <div key={item.id} className="flex items-center gap-2 bg-muted/50 p-3">
            <EditableText label="" value={item.network} onChange={(v) => updateItem("profiles", i, "network", v)} placeholder="平台" className="w-28" />
            <EditableText label="" value={item.username} onChange={(v) => updateItem("profiles", i, "username", v)} placeholder="用户名" className="flex-1" />
            <EditableText label="" value={item.url || ""} onChange={(v) => updateItem("profiles", i, "url", v)} placeholder="链接" className="flex-1" />
            <MoveButtons index={i} total={data.sections.profiles.items.length} onMove={(f, t) => moveItem("profiles", f, t)} />
            <button type="button" onClick={() => removeItem("profiles", i)} className="text-xs text-destructive hover:text-destructive shrink-0">删除</button>
          </div>
        ))}
        <button type="button" onClick={() => addItem("profiles", { id: newId(), network: "", username: "", url: "" })} className="border border-dashed border-border px-3 py-1.5 text-sm text-muted-foreground hover:border-primary/80 hover:text-primary transition-colors">+ 添加个人资料</button>
      </fieldset>
    );
  }

  function renderExperience() {
    return (
      <fieldset key="experience" id="section-experience" data-section-id="experience" className={sectionClass}>
        <legend className={legendClass}>工作经历</legend>
        {data.sections.experience.items.map((item, i) => (
          <div key={item.id} className="space-y-3 border border-border p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">#{i + 1}</span>
              <div className="flex items-center gap-2">
                <SectionOptimizeButton sectionType="experience" currentContent={`公司: ${item.company}\n职位: ${item.position}\n描述: ${item.description}`} onApply={(optimized) => { try { const p = JSON.parse(optimized); if (p.company) updateItem("experience", i, "company", p.company); if (p.position) updateItem("experience", i, "position", p.position); if (p.description) updateItem("experience", i, "description", p.description); } catch { updateItem("experience", i, "description", optimized); } }} />
                <MoveButtons index={i} total={data.sections.experience.items.length} onMove={(f, t) => moveItem("experience", f, t)} />
                <button type="button" onClick={() => removeItem("experience", i)} className="text-xs text-destructive hover:text-destructive">删除</button>
              </div>
            </div>
            <FieldWrapper columns={2}>
              <EditableText label="公司名称" value={item.company} onChange={(v) => updateItem("experience", i, "company", v)} placeholder="公司名称" />
              <EditableText label="职位" value={item.position} onChange={(v) => updateItem("experience", i, "position", v)} placeholder="职位" />
              <EditableDate label="开始日期" value={item.startDate || ""} onChange={(v) => updateItem("experience", i, "startDate", v)} />
              <EditableDate label="结束日期" value={item.endDate || ""} onChange={(v) => updateItem("experience", i, "endDate", v)} nullable />
              <EditableText label="地点" value={item.location || ""} onChange={(v) => updateItem("experience", i, "location", v)} placeholder="北京" />
            </FieldWrapper>
            <EditableRichText label="工作描述" value={item.description || ""} onChange={(v) => updateItem("experience", i, "description", v)} rows={3} placeholder="描述你的工作职责和成果..." />
            <EditableList label="技术栈" items={item.technologies || []} onChange={(v) => updateItem("experience", i, "technologies", v)} placeholder="如 React, TypeScript" />
            <EditableList label="亮点/成就" items={item.highlights || []} onChange={(v) => updateItem("experience", i, "highlights", v)} placeholder="如 性能优化提升 50%" />
          </div>
        ))}
        <button type="button" onClick={() => addItem("experience", { id: newId(), company: "", position: "", startDate: "", endDate: null, location: "", description: "", technologies: [], highlights: [] })} className="border border-dashed border-border px-3 py-1.5 text-sm text-muted-foreground hover:border-primary/80 hover:text-primary transition-colors">+ 添加工作经历</button>
      </fieldset>
    );
  }

  function renderProjects() {
    return (
      <fieldset key="projects" id="section-projects" data-section-id="projects" className={sectionClass}>
        <legend className={legendClass}>项目经历</legend>
        {data.sections.projects.items.map((item, i) => (
          <div key={item.id} className="space-y-3 border border-border p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">#{i + 1}</span>
              <div className="flex items-center gap-2">
                <SectionOptimizeButton sectionType="projects" currentContent={`项目: ${item.name}\n描述: ${item.description}`} onApply={(optimized) => { try { const p = JSON.parse(optimized); if (p.name) updateItem("projects", i, "name", p.name); if (p.description) updateItem("projects", i, "description", p.description); } catch { updateItem("projects", i, "description", optimized); } }} />
                <MoveButtons index={i} total={data.sections.projects.items.length} onMove={(f, t) => moveItem("projects", f, t)} />
                <button type="button" onClick={() => removeItem("projects", i)} className="text-xs text-destructive hover:text-destructive">删除</button>
              </div>
            </div>
            <FieldWrapper columns={2}>
              <EditableText label="项目名称" value={item.name} onChange={(v) => updateItem("projects", i, "name", v)} placeholder="项目名称" />
              <EditableText label="角色" value={item.role || ""} onChange={(v) => updateItem("projects", i, "role", v)} placeholder="角色" />
              <EditableDate label="开始日期" value={item.startDate || ""} onChange={(v) => updateItem("projects", i, "startDate", v)} />
              <EditableDate label="结束日期" value={item.endDate || ""} onChange={(v) => updateItem("projects", i, "endDate", v)} />
              <EditableText label="项目链接" value={item.url || ""} onChange={(v) => updateItem("projects", i, "url", v)} placeholder="https://" />
            </FieldWrapper>
            <EditableRichText label="项目描述" value={item.description || ""} onChange={(v) => updateItem("projects", i, "description", v)} rows={3} placeholder="描述项目内容和你的贡献..." />
            <EditableList label="技术栈" items={item.technologies || []} onChange={(v) => updateItem("projects", i, "technologies", v)} placeholder="如 Java, Spring Boot" />
            <EditableList label="亮点/成果" items={item.highlights || []} onChange={(v) => updateItem("projects", i, "highlights", v)} placeholder="如 日均处理 10 万订单" />
          </div>
        ))}
        <button type="button" onClick={() => addItem("projects", { id: newId(), name: "", role: "", startDate: "", endDate: "", url: "", description: "", technologies: [], highlights: [] })} className="border border-dashed border-border px-3 py-1.5 text-sm text-muted-foreground hover:border-primary/80 hover:text-primary transition-colors">+ 添加项目经历</button>
      </fieldset>
    );
  }

  function renderEducation() {
    return (
      <fieldset key="education" id="section-education" data-section-id="education" className={sectionClass}>
        <legend className={legendClass}>教育经历</legend>
        {data.sections.education.items.map((item, i) => (
          <div key={item.id} className="space-y-3 border border-border p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">#{i + 1}</span>
              <div className="flex items-center gap-2">
                <MoveButtons index={i} total={data.sections.education.items.length} onMove={(f, t) => moveItem("education", f, t)} />
                <button type="button" onClick={() => removeItem("education", i)} className="text-xs text-destructive hover:text-destructive">删除</button>
              </div>
            </div>
            <FieldWrapper columns={2}>
              <EditableText label="学校" value={item.school} onChange={(v) => updateItem("education", i, "school", v)} placeholder="学校名称" />
              <EditableText label="学位" value={item.degree} onChange={(v) => updateItem("education", i, "degree", v)} placeholder="学士/硕士/博士" />
              <EditableText label="专业" value={item.area || ""} onChange={(v) => updateItem("education", i, "area", v)} placeholder="计算机科学" />
              <EditableText label="GPA" value={item.gpa || ""} onChange={(v) => updateItem("education", i, "gpa", v)} placeholder="3.8/4.0" />
              <EditableDate label="开始日期" value={item.startDate || ""} onChange={(v) => updateItem("education", i, "startDate", v)} />
              <EditableDate label="结束日期" value={item.endDate || ""} onChange={(v) => updateItem("education", i, "endDate", v)} />
            </FieldWrapper>
            <EditableList label="亮点（奖学金/荣誉）" items={item.highlights || []} onChange={(v) => updateItem("education", i, "highlights", v)} placeholder="如 国家奖学金" />
          </div>
        ))}
        <button type="button" onClick={() => addItem("education", { id: newId(), school: "", degree: "", area: "", startDate: "", endDate: "", gpa: "", highlights: [] })} className="border border-dashed border-border px-3 py-1.5 text-sm text-muted-foreground hover:border-primary/80 hover:text-primary transition-colors">+ 添加教育经历</button>
      </fieldset>
    );
  }

  function renderSkills() {
    return (
      <fieldset key="skills" id="section-skills" data-section-id="skills" className={sectionClass}>
        <legend className={legendClass}>技能</legend>
        {data.sections.skills.items.map((item, i) => (
          <div key={item.id} className="bg-muted/50 p-3 space-y-2">
            {/* Row 1: name + level + move + delete */}
            <div className="flex items-center gap-2">
              <EditableText label="" value={item.name} onChange={(v) => updateItem("skills", i, "name", v)} placeholder="技能类别（如：前端开发）" className="flex-1" />
              <div className="flex items-center gap-1 shrink-0">
                <Label className="text-[10px] text-muted-foreground/60">等级</Label>
                <input className="w-14 h-8 border border-border bg-muted/50 px-2.5 text-sm text-foreground text-center focus:border-primary focus:bg-background focus:outline-none" type="number" min={0} max={5} placeholder="0-5" value={item.level ?? ""} onChange={(e) => updateItem("skills", i, "level", e.target.value ? Number(e.target.value) : undefined)} />
              </div>
              <MoveButtons index={i} total={data.sections.skills.items.length} onMove={(f, t) => moveItem("skills", f, t)} />
              <button type="button" onClick={() => removeItem("skills", i)} className="text-xs text-destructive hover:text-destructive shrink-0">删除</button>
            </div>
            {/* Row 2: keywords as tags */}
            <div className="flex flex-wrap items-center gap-1.5">
              {item.keywords.map((kw, ki) => (
                <span key={ki} className="inline-flex items-center gap-1 bg-primary/5 px-2.5 py-0.5 text-xs text-primary">
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
        <button type="button" onClick={() => addItem("skills", { id: newId(), name: "", keywords: [], level: undefined })} className="border border-dashed border-border px-3 py-1.5 text-sm text-muted-foreground hover:border-primary/80 hover:text-primary transition-colors">+ 添加技能</button>
      </fieldset>
    );
  }

  function renderLanguages() {
    return (
      <fieldset key="languages" id="section-languages" data-section-id="languages" className={sectionClass}>
        <legend className={legendClass}>语言</legend>
        {data.sections.languages.items.map((item, i) => (
          <div key={item.id} className="flex items-center gap-2 bg-muted/50 p-3">
            <EditableText label="" value={item.name} onChange={(v) => updateItem("languages", i, "name", v)} placeholder="语言名称" className="flex-1" />
            <EditableSelect label="" value={item.level || ""} onChange={(v) => updateItem("languages", i, "level", v)} options={[{ label: "母语", value: "native" }, { label: "流利", value: "fluent" }, { label: "中级", value: "intermediate" }, { label: "初级", value: "beginner" }]} placeholder="选择水平" />
            <MoveButtons index={i} total={data.sections.languages.items.length} onMove={(f, t) => moveItem("languages", f, t)} />
            <button type="button" onClick={() => removeItem("languages", i)} className="text-xs text-destructive hover:text-destructive shrink-0">删除</button>
          </div>
        ))}
        <button type="button" onClick={() => addItem("languages", { id: newId(), name: "", level: "" })} className="border border-dashed border-border px-3 py-1.5 text-sm text-muted-foreground hover:border-primary/80 hover:text-primary transition-colors">+ 添加语言</button>
      </fieldset>
    );
  }

  function renderCertifications() {
    return (
      <fieldset key="certifications" id="section-certifications" data-section-id="certifications" className={sectionClass}>
        <legend className={legendClass}>证书</legend>
        {data.sections.certifications.items.map((item, i) => (
          <div key={item.id} className="space-y-3 border border-border p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">#{i + 1}</span>
              <div className="flex items-center gap-2">
                <MoveButtons index={i} total={data.sections.certifications.items.length} onMove={(f, t) => moveItem("certifications", f, t)} />
                <button type="button" onClick={() => removeItem("certifications", i)} className="text-xs text-destructive hover:text-destructive">删除</button>
              </div>
            </div>
            <FieldWrapper columns={2}>
              <EditableText label="证书名称" value={item.name} onChange={(v) => updateItem("certifications", i, "name", v)} placeholder="证书名称" />
              <EditableText label="颁发机构" value={item.issuer || ""} onChange={(v) => updateItem("certifications", i, "issuer", v)} placeholder="颁发机构" />
              <EditableText label="获得日期" value={item.date || ""} onChange={(v) => updateItem("certifications", i, "date", v)} placeholder="2024-01" />
              <EditableText label="链接" value={item.url || ""} onChange={(v) => updateItem("certifications", i, "url", v)} placeholder="https://" />
            </FieldWrapper>
          </div>
        ))}
        <button type="button" onClick={() => addItem("certifications", { id: newId(), name: "", issuer: "", date: "", url: "" })} className="border border-dashed border-border px-3 py-1.5 text-sm text-muted-foreground hover:border-primary/80 hover:text-primary transition-colors">+ 添加证书</button>
      </fieldset>
    );
  }

  function renderAwards() {
    return (
      <fieldset key="awards" id="section-awards" data-section-id="awards" className={sectionClass}>
        <legend className={legendClass}>荣誉奖项</legend>
        {data.sections.awards.items.map((item, i) => (
          <div key={item.id} className="space-y-3 border border-border p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">#{i + 1}</span>
              <div className="flex items-center gap-2">
                <MoveButtons index={i} total={data.sections.awards.items.length} onMove={(f, t) => moveItem("awards", f, t)} />
                <button type="button" onClick={() => removeItem("awards", i)} className="text-xs text-destructive hover:text-destructive">删除</button>
              </div>
            </div>
            <FieldWrapper columns={2}>
              <EditableText label="奖项名称" value={item.title} onChange={(v) => updateItem("awards", i, "title", v)} placeholder="奖项名称" />
              <EditableText label="颁发机构" value={item.issuer || ""} onChange={(v) => updateItem("awards", i, "issuer", v)} placeholder="颁发机构" />
              <EditableText label="获得日期" value={item.date || ""} onChange={(v) => updateItem("awards", i, "date", v)} placeholder="2024-01" />
            </FieldWrapper>
            <EditableRichText label="描述" value={item.description || ""} onChange={(v) => updateItem("awards", i, "description", v)} rows={2} placeholder="描述 (可选)" />
          </div>
        ))}
        <button type="button" onClick={() => addItem("awards", { id: newId(), title: "", issuer: "", date: "", description: "" })} className="border border-dashed border-border px-3 py-1.5 text-sm text-muted-foreground hover:border-primary/80 hover:text-primary transition-colors">+ 添加荣誉奖项</button>
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
                <select className="text-xs bg-muted px-2 py-1" value={section.type} onChange={(e) => updateCustomSectionMeta(section.id, "type", e.target.value)}>
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
                <EditableText label="" value={item.name || item.title || ""} onChange={(v) => updateCustomSectionItem(section.id, i, section.type === "awards" ? "title" : "name", v)} placeholder="标题/名称" className="flex-1" />
                <EditableText label="" value={item.description || ""} onChange={(v) => updateCustomSectionItem(section.id, i, "description", v)} placeholder="描述" className="flex-1" />
                <button type="button" onClick={() => removeCustomSectionItem(section.id, i)} className="text-xs text-destructive hover:text-destructive shrink-0">删除</button>
              </div>
            ))}
            <button type="button" onClick={() => addCustomSectionItem(section.id)} className="border border-dashed border-border px-3 py-1.5 text-sm text-muted-foreground hover:border-primary/80 hover:text-primary transition-colors mt-2">+ 添加条目</button>
          </fieldset>
        ))}
        <button type="button" onClick={addCustomSection} className="w-full border-2 border-dashed border-border px-3 py-3 text-sm font-medium text-muted-foreground hover:border-primary/80 hover:text-primary transition-colors">+ 添加自定义段落</button>
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
        <EditableText label="简历标题" value={resumeTitle} onChange={(v) => setResumeTitle(v)} />
      </div>

      {/* Sections rendered in the exact order of enabledSections */}
      {data.enabledSections.map((sectionId) => {
        const renderer = RENDERERS[sectionId];
        return renderer ? renderer() : null;
      })}

      {/* Save — always last */}
      <div className="sticky bottom-0 flex items-center gap-3 border-t border-border bg-background py-4">
        <button type="button" onClick={handleSave} disabled={saving} className="bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          {saving ? "保存中..." : "保存简历"}
        </button>
        {message && <span className={`text-sm font-medium ${message.includes("成功") ? "text-success" : "text-destructive"}`}>{message}</span>}
      </div>
    </div>
  );
}
