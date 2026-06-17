import type { ResumeData } from "../resumeData";

type Props = { data: ResumeData };

function fmt(start?: string, end?: string | null): string {
  if (!start) return end || "";
  if (end === null || end === undefined) return `${start} - 至今`;
  if (!end) return start;
  return `${start} - ${end}`;
}

export default function ProfessionalTemplate({ data }: Props) {
  const { basics, summary, sections } = data;
  const navy = "#1e3a5f";

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
    <div className="mx-auto max-w-[210mm] bg-white text-foreground" style={{ fontFamily: data.metadata.typography?.body?.fontFamily || "Inter, system-ui, sans-serif" }}>
      {/* Navy header band */}
      <div className="px-8 py-6 text-white" style={{ backgroundColor: navy }}>
        <h1 className="text-2xl font-bold tracking-tight">{basics.name || "Your Name"}</h1>
        {basics.headline && <p className="mt-1 text-sm opacity-90">{basics.headline}</p>}
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-0.5 text-xs opacity-80">
          {basics.email && <span>{basics.email}</span>}
          {basics.phone && <span>{basics.phone}</span>}
          {basics.location && <span>{basics.location}</span>}
          {basics.website && <span>{basics.website}</span>}
          {(basics.customFields || []).map((f) => <span key={f.id}>{f.text}</span>)}
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Summary */}
        {!summary.hidden && summary.content && (
          <section className="mb-5">
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wider" style={{ color: navy }}>{summary.title || "个人总结"}</h2>
            <div className="h-0.5 w-12 mb-2" style={{ backgroundColor: navy }} />
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{summary.content}</p>
          </section>
        )}

        {visibleSections.map(({ key }) => {
          const section = sections[key as keyof typeof sections];
          if (!section || !("items" in section)) return null;

          return (
            <section key={key} className="mb-5">
              <h2 className="mb-2 text-sm font-bold uppercase tracking-wider" style={{ color: navy }}>{section.title}</h2>
              <div className="h-0.5 w-12 mb-2" style={{ backgroundColor: navy }} />

              {key === "profiles" && (
                <div className="flex flex-wrap gap-3">
                  {(section.items as any[]).map((item, i) => (
                    <a key={item.id || i} href={item.url || "#"} className="text-xs hover:underline" style={{ color: navy }}>{item.network}: {item.username}</a>
                  ))}
                </div>
              )}

              {key === "experience" && (section.items as any[]).map((item, i) => (
                <div key={item.id || i} className="mb-3 flex gap-4">
                  <div className="w-24 shrink-0 text-xs text-muted-foreground/70 pt-0.5">{fmt(item.startDate, item.endDate)}</div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-foreground">{item.company}</h3>
                    <p className="text-xs text-muted-foreground">{item.position}{item.location ? ` · ${item.location}` : ""}</p>
                    {item.description && <p className="mt-1 text-xs text-muted-foreground whitespace-pre-wrap">{item.description}</p>}
                    {(item.highlights?.length ?? 0) > 0 && <ul className="mt-1 list-disc list-inside text-xs text-muted-foreground">{item.highlights?.map((h: string, hi: number) => <li key={hi}>{h}</li>)}</ul>}
                  </div>
                </div>
              ))}

              {key === "projects" && (section.items as any[]).map((item, i) => (
                <div key={item.id || i} className="mb-3 flex gap-4">
                  <div className="w-24 shrink-0 text-xs text-muted-foreground/70 pt-0.5">{fmt(item.startDate, item.endDate)}</div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-foreground">{item.name}</h3>
                    {item.role && <p className="text-xs text-muted-foreground">{item.role}</p>}
                    {item.description && <p className="mt-1 text-xs text-muted-foreground whitespace-pre-wrap">{item.description}</p>}
                    {(item.highlights?.length ?? 0) > 0 && <ul className="mt-1 list-disc list-inside text-xs text-muted-foreground">{item.highlights?.map((h: string, hi: number) => <li key={hi}>{h}</li>)}</ul>}
                  </div>
                </div>
              ))}

              {key === "education" && (section.items as any[]).map((item, i) => (
                <div key={item.id || i} className="mb-3 flex gap-4">
                  <div className="w-24 shrink-0 text-xs text-muted-foreground/70 pt-0.5">{fmt(item.startDate, item.endDate)}</div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-foreground">{item.school}</h3>
                    <p className="text-xs text-muted-foreground">{item.degree}{item.area ? ` · ${item.area}` : ""}</p>
                    {item.gpa && <p className="text-xs text-muted-foreground/70">GPA: {item.gpa}</p>}
                    {(item.highlights?.length ?? 0) > 0 && <ul className="mt-1 list-disc list-inside text-xs text-muted-foreground">{item.highlights?.map((h: string, hi: number) => <li key={hi}>{h}</li>)}</ul>}
                  </div>
                </div>
              ))}

              {key === "skills" && (
                <div className="space-y-1.5">
                  {(section.items as any[]).map((item, i) => (
                    <div key={item.id || i} className="text-xs">
                      <span className="font-semibold text-foreground">{item.name}</span>
                      {(item.keywords?.length ?? 0) > 0 && <span className="text-muted-foreground ml-2">{item.keywords?.join(" · ")}</span>}
                    </div>
                  ))}
                </div>
              )}

              {key === "languages" && (
                <div className="flex flex-wrap gap-3">
                  {(section.items as any[]).map((item, i) => (
                    <span key={item.id || i} className="text-xs text-muted-foreground">{item.name}{item.level ? ` — ${item.level}` : ""}</span>
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
          <section key={cs.id} className="mb-5">
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wider" style={{ color: navy }}>{cs.title}</h2>
            <div className="h-0.5 w-12 mb-2" style={{ backgroundColor: navy }} />
            {cs.items.map((item: any, i: number) => (
              <div key={item.id || i} className="mb-1">
                <span className="text-xs font-medium text-foreground">{item.name || item.title || ""}</span>
                {item.description && <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>}
              </div>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
