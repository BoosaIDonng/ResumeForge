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
    const updated = { ...data, basics: { ...data.basics, [field]: value } };
    onChange(updated);
  }

  function updateSummary(content: string) {
    const updated = { ...data, summary: { content } };
    onChange(updated);
  }

  function updateSkills(value: string) {
    const items = value.split(",").map((s) => s.trim()).filter(Boolean);
    const updated = { ...data, sections: { ...data.sections, skills: { items } } };
    onChange(updated);
  }

  function addExperience() {
    const items = [...data.sections.experience.items, { company: "", position: "", period: "", description: "" }];
    const updated = { ...data, sections: { ...data.sections, experience: { items } } };
    onChange(updated);
  }

  function removeExperience(index: number) {
    const items = data.sections.experience.items.filter((_, i) => i !== index);
    const updated = { ...data, sections: { ...data.sections, experience: { items } } };
    onChange(updated);
  }

  function updateExperience(index: number, field: string, value: string) {
    const items = data.sections.experience.items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    const updated = { ...data, sections: { ...data.sections, experience: { items } } };
    onChange(updated);
  }

  function addProject() {
    const items = [...data.sections.projects.items, { name: "", role: "", description: "" }];
    const updated = { ...data, sections: { ...data.sections, projects: { items } } };
    onChange(updated);
  }

  function removeProject(index: number) {
    const items = data.sections.projects.items.filter((_, i) => i !== index);
    const updated = { ...data, sections: { ...data.sections, projects: { items } } };
    onChange(updated);
  }

  function updateProject(index: number, field: string, value: string) {
    const items = data.sections.projects.items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    const updated = { ...data, sections: { ...data.sections, projects: { items } } };
    onChange(updated);
  }

  function addEducation() {
    const items = [...data.sections.education.items, { school: "", degree: "", period: "", description: "" }];
    const updated = { ...data, sections: { ...data.sections, education: { items } } };
    onChange(updated);
  }

  function removeEducation(index: number) {
    const items = data.sections.education.items.filter((_, i) => i !== index);
    const updated = { ...data, sections: { ...data.sections, education: { items } } };
    onChange(updated);
  }

  function updateEducation(index: number, field: string, value: string) {
    const items = data.sections.education.items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    const updated = { ...data, sections: { ...data.sections, education: { items } } };
    onChange(updated);
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    try {
      await apiPut(`/api/resumes/${id}`, { title: resumeTitle, resumeData: JSON.stringify(data) });
      setMessage("Saved successfully");
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="space-y-6 overflow-y-auto p-4">
      {/* Title */}
      <div>
        <label className={labelClass}>Resume Title</label>
        <input className={inputClass} value={resumeTitle} onChange={(e) => setResumeTitle(e.target.value)} />
      </div>

      {/* Basics */}
      <fieldset className="space-y-3 rounded border border-gray-200 p-4">
        <legend className="px-2 text-sm font-semibold text-gray-800">Basic Information</legend>
        {(["name", "headline", "email", "phone", "location", "website"] as const).map((field) => (
          <div key={field}>
            <label className={labelClass}>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
            <input className={inputClass} value={data.basics[field]} onChange={(e) => updateBasics(field, e.target.value)} />
          </div>
        ))}
      </fieldset>

      {/* Summary */}
      <fieldset className="space-y-3 rounded border border-gray-200 p-4">
        <legend className="px-2 text-sm font-semibold text-gray-800">Summary</legend>
        <textarea
          className={`${inputClass} min-h-[100px]`}
          value={data.summary.content}
          onChange={(e) => updateSummary(e.target.value)}
        />
      </fieldset>

      {/* Skills */}
      <fieldset className="space-y-3 rounded border border-gray-200 p-4">
        <legend className="px-2 text-sm font-semibold text-gray-800">Skills</legend>
        <p className="text-xs text-gray-500">Comma-separated</p>
        <input
          className={inputClass}
          value={data.sections.skills.items.join(", ")}
          onChange={(e) => updateSkills(e.target.value)}
        />
      </fieldset>

      {/* Experience */}
      <fieldset className="space-y-3 rounded border border-gray-200 p-4">
        <legend className="px-2 text-sm font-semibold text-gray-800">Experience</legend>
        {data.sections.experience.items.map((item, i) => (
          <div key={i} className="space-y-2 rounded border border-gray-100 bg-gray-50 p-3">
            <input className={inputClass} placeholder="Company" value={item.company} onChange={(e) => updateExperience(i, "company", e.target.value)} />
            <input className={inputClass} placeholder="Position" value={item.position} onChange={(e) => updateExperience(i, "position", e.target.value)} />
            <input className={inputClass} placeholder="Period" value={item.period} onChange={(e) => updateExperience(i, "period", e.target.value)} />
            <textarea className={`${inputClass} min-h-[60px]`} placeholder="Description" value={item.description} onChange={(e) => updateExperience(i, "description", e.target.value)} />
            <button type="button" onClick={() => removeExperience(i)} className="text-sm text-red-600 hover:text-red-800">Remove</button>
          </div>
        ))}
        <button type="button" onClick={addExperience} className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300">+ Add Experience</button>
      </fieldset>

      {/* Projects */}
      <fieldset className="space-y-3 rounded border border-gray-200 p-4">
        <legend className="px-2 text-sm font-semibold text-gray-800">Projects</legend>
        {data.sections.projects.items.map((item, i) => (
          <div key={i} className="space-y-2 rounded border border-gray-100 bg-gray-50 p-3">
            <input className={inputClass} placeholder="Project Name" value={item.name} onChange={(e) => updateProject(i, "name", e.target.value)} />
            <input className={inputClass} placeholder="Role" value={item.role} onChange={(e) => updateProject(i, "role", e.target.value)} />
            <textarea className={`${inputClass} min-h-[60px]`} placeholder="Description" value={item.description} onChange={(e) => updateProject(i, "description", e.target.value)} />
            <button type="button" onClick={() => removeProject(i)} className="text-sm text-red-600 hover:text-red-800">Remove</button>
          </div>
        ))}
        <button type="button" onClick={addProject} className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300">+ Add Project</button>
      </fieldset>

      {/* Education */}
      <fieldset className="space-y-3 rounded border border-gray-200 p-4">
        <legend className="px-2 text-sm font-semibold text-gray-800">Education</legend>
        {data.sections.education.items.map((item, i) => (
          <div key={i} className="space-y-2 rounded border border-gray-100 bg-gray-50 p-3">
            <input className={inputClass} placeholder="School" value={item.school} onChange={(e) => updateEducation(i, "school", e.target.value)} />
            <input className={inputClass} placeholder="Degree" value={item.degree} onChange={(e) => updateEducation(i, "degree", e.target.value)} />
            <input className={inputClass} placeholder="Period" value={item.period} onChange={(e) => updateEducation(i, "period", e.target.value)} />
            <textarea className={`${inputClass} min-h-[60px]`} placeholder="Description" value={item.description} onChange={(e) => updateEducation(i, "description", e.target.value)} />
            <button type="button" onClick={() => removeEducation(i)} className="text-sm text-red-600 hover:text-red-800">Remove</button>
          </div>
        ))}
        <button type="button" onClick={addEducation} className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300">+ Add Education</button>
      </fieldset>

      {/* Save */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        {message && <span className={`text-sm ${message.includes("success") ? "text-green-600" : "text-red-600"}`}>{message}</span>}
      </div>
    </div>
  );
}
