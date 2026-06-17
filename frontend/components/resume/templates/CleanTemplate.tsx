import type { ResumeData } from "../resumeData";

type Props = { data: ResumeData };

function fmt(start?: string, end?: string | null): string {
  if (!start) return end || "";
  if (end === null || end === undefined) return `${start} - 至今`;
  if (!end) return start;
  return `${start} - ${end}`;
}

export default function CleanTemplate({ data }: Props) {
  const { basics, summary, sections } = data;
  const accent = data.metadata.design?.colors?.primary || "#0ea5e9";

  const visibleSections = [
    !sections.profiles.hidden && sections.profiles.items.length > 0 && { key: "profiles", title: "个人资料" },
    !sections.experience.hidden && sections.experience.items.length > 0 && { key: "experience", title: "工作经历" },
    !sections.projects.hidden && sections.projects.items.length > 0 && { key: "projects", title: "项目经历" },
    !sections.education.hidden && sections.education.items.length > 0 && { key: "education", title: "教育经历" },
    !sections.skills.hidden && sections.skills.items.length > 0 && { key: "skills", title: "技能" },
    !sections.languages.hidden && sections.languages.items.length > 0 && { key: "languages", title: "语言" },
    !sections.certifications.hidden && sections.certifications.items.length > 0 && { key: "certifications", title: "证书" },
    !sections.awards.hidden && sections.awards.items.length > 0 && { key: "awards", title: "荣誉奖项" },
  ].filter(Boolean) as { key: string; title: string }[];

  return (
    <div className="mx-auto max-w-[210mm] bg-white px-8 py-7 text-foreground" style={{ fontFamily: data.metadata.typography?.body?.fontFamily || "Inter, system-ui, sans-serif" }}>
      {/* Header — left aligned, no heavy borders */}
      <div className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: accent }}>{basics.name || "Your Name"}</h1>
        {basics.headline && <p className="mt-1 text-sm text-muted-foreground">{basics.headline}</p>}
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
          {basics.email && <span>{basics.email}</span>}
          {basics.phone && <span>{basics.phone}</span>}
          {basics.location && <span>{basics.location}</span>}
          {basics.website && <span>{basics.website}</span>}
          {(basics.customFields || []).map((f) => (
            f.link ? <a key={f.id} href={f.link} className="hover:underline" style={{ color: accent }}>{f.text}</a> : <span key={f.id}>{f.text}</span>
          ))}
        </div>
      </div>

      {/* Summary */}
      {!summary.hidden && summary.content && (
        <section className="mb-4">
          <h2 className="mb-1.5 text-sm font-semibold" style={{ color: accent }}>{summary.title || "个人总结"}</h2>
          <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{summary.content}</p>
        </section>
      )}

      {/* Sections */}
      {visibleSections.map(({ key }) => {
        const section = sections[key as keyof typeof sections];
        if (!section || !("items" in section)) return null;

        return (
          <section key={key} className="mb-4">
            <h2 className="mb-1.5 text-sm font-semibold" style={{ color: accent }}>{section.title}</h2>
            <div className="border-t mb-2" style={{ borderColor: `${accent}30` }} />

            {key === "profiles" && (
              <div className="flex flex-wrap gap-3">
                {(section.items as any[]).map((item, i) => (
                  <a key={item.id || i} href={item.url || "#"} className="text-xs hover:underline" style={{ color: accent }}>{item.network}: {item.username}</a>
                ))}
              </div>
            )}

            {key === "experience" && (section.items as any[]).map((item, i) => (
              <div key={item.id || i} className="mb-2.5">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-sm font-medium text-foreground">{item.company}</h3>
                  <span className="text-xs text-muted-foreground/70">{fmt(item.startDate, item.endDate)}</span>
                </div>
                <p className="text-xs text-muted-foreground">{item.position}{item.location ? ` · ${item.location}` : ""}</p>
                {item.description && <p className="mt-1 text-xs text-muted-foreground whitespace-pre-wrap">{item.description}</p>}
                {(item.highlights?.length ?? 0) > 0 && <ul className="mt-1 list-disc list-inside text-xs text-muted-foreground">{item.highlights?.map((h: string, hi: number) => <li key={hi}>{h}</li>)}</ul>}
              </div>
            ))}

            {key === "projects" && (section.items as any[]).map((item, i) => (
              <div key={item.id || i} className="mb-2.5">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-sm font-medium text-foreground">{item.name}</h3>
                  <span className="text-xs text-muted-foreground/70">{fmt(item.startDate, item.endDate)}</span>
                </div>
                {item.role && <p className="text-xs text-muted-foreground">{item.role}</p>}
                {item.description && <p className="mt-1 text-xs text-muted-foreground whitespace-pre-wrap">{item.description}</p>}
                {(item.highlights?.length ?? 0) > 0 && <ul className="mt-1 list-disc list-inside text-xs text-muted-foreground">{item.highlights?.map((h: string, hi: number) => <li key={hi}>{h}</li>)}</ul>}
              </div>
            ))}

            {key === "education" && (section.items as any[]).map((item, i) => (
              <div key={item.id || i} className="mb-2.5">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-sm font-medium text-foreground">{item.school}</h3>
                  <span className="text-xs text-muted-foreground/70">{fmt(item.startDate, item.endDate)}</span>
                </div>
                <p className="text-xs text-muted-foreground">{item.degree}{item.area ? ` · ${item.area}` : ""}</p>
                {item.gpa && <p className="text-xs text-muted-foreground/70">GPA: {item.gpa}</p>}
                {(item.highlights?.length ?? 0) > 0 && <ul className="mt-1 list-disc list-inside text-xs text-muted-foreground">{item.highlights?.map((h: string, hi: number) => <li key={hi}>{h}</li>)}</ul>}
              </div>
            ))}

            {key === "skills" && (
              <div className="flex flex-wrap gap-2">
                {(section.items as any[]).map((item, i) => (
                  <div key={item.id || i} className="rounded-full px-3 py-1 text-xs" style={{ backgroundColor: `${accent}10`, color: accent }}>
                    {item.name}{(item.keywords?.length ?? 0) > 0 ? `: ${item.keywords?.join(", ")}` : ""}
                  </div>
                ))}
              </div>
            )}

            {key === "languages" && (
              <div className="flex flex-wrap gap-3">
                {(section.items as any[]).map((item, i) => (
                  <span key={item.id || i} className="text-xs text-muted-foreground">{item.name}{item.level ? ` (${item.level})` : ""}</span>
                ))}
              </div>
            )}

            {key === "certifications" && (section.items as any[]).map((item, i) => (
              <div key={item.id || i} className="mb-1">
                <span className="text-xs font-medium text-foreground">{item.name}</span>
                {item.issuer && <span className="text-xs text-muted-foreground"> — {item.issuer}</span>}
                {item.date && <span className="text-xs text-muted-foreground/70 ml-1">{item.date}</span>}
              </div>
            ))}

            {key === "awards" && (section.items as any[]).map((item, i) => (
              <div key={item.id || i} className="mb-1">
                <span className="text-xs font-medium text-foreground">{item.title}</span>
                {item.issuer && <span className="text-xs text-muted-foreground"> — {item.issuer}</span>}
                {item.date && <span className="text-xs text-muted-foreground/70 ml-1">{item.date}</span>}
                {item.description && <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>}
              </div>
            ))}
          </section>
        );
      })}

      {data.customSections.map((cs) => cs.items.length > 0 && (
        <section key={cs.id} className="mb-4">
          <h2 className="mb-1.5 text-sm font-semibold" style={{ color: accent }}>{cs.title}</h2>
          <div className="border-t mb-2" style={{ borderColor: `${accent}30` }} />
          {cs.items.map((item: any, i: number) => (
            <div key={item.id || i} className="mb-1">
              <span className="text-xs font-medium text-foreground">{item.name || item.title || ""}</span>
              {item.description && <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>}
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
