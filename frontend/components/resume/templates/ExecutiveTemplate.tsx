import type { ResumeData } from "../resumeData";

type Props = { data: ResumeData };

function fmt(start?: string, end?: string | null): string {
  if (!start) return end || "";
  if (end === null || end === undefined) return `${start} - 至今`;
  if (!end) return start;
  return `${start} - ${end}`;
}

export default function ExecutiveTemplate({ data }: Props) {
  const { basics, summary, sections } = data;
  const dark = "#1a1a2e";
  const gold = "#b8860b";

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
    <div className="mx-auto max-w-[210mm] bg-white text-foreground" style={{ fontFamily: data.metadata.typography?.body?.fontFamily || "Georgia, \"Times New Roman\", serif" }}>
      {/* Dark header with gold accent */}
      <div className="px-8 py-7" style={{ backgroundColor: dark }}>
        <div className="border-b pb-4" style={{ borderColor: gold }}>
          <h1 className="text-3xl font-bold tracking-wide text-white">{basics.name || "Your Name"}</h1>
          {basics.headline && <p className="mt-1 text-sm tracking-wide" style={{ color: gold }}>{basics.headline}</p>}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-0.5 text-xs text-white/70">
          {basics.email && <span>{basics.email}</span>}
          {basics.phone && <span>{basics.phone}</span>}
          {basics.location && <span>{basics.location}</span>}
          {basics.website && <span>{basics.website}</span>}
          {(basics.customFields || []).map((f) => <span key={f.id}>{f.text}</span>)}
        </div>
      </div>

      <div className="px-8 py-6">
        {!summary.hidden && summary.content && (
          <section className="mb-5">
            <h2 className="mb-2 text-sm font-bold uppercase tracking-widest" style={{ color: dark }}>{summary.title || "个人总结"}</h2>
            <div className="mb-2" style={{ borderBottom: `2px solid ${gold}` }} />
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{summary.content}</p>
          </section>
        )}

        {visibleSections.map(({ key }) => {
          const section = sections[key as keyof typeof sections];
          if (!section || !("items" in section)) return null;

          return (
            <section key={key} className="mb-5">
              <h2 className="mb-2 text-sm font-bold uppercase tracking-widest" style={{ color: dark }}>{section.title}</h2>
              <div className="mb-2" style={{ borderBottom: `2px solid ${gold}` }} />

              {key === "profiles" && (
                <div className="flex flex-wrap gap-3">
                  {(section.items as any[]).map((item, i) => (
                    <a key={item.id || i} href={item.url || "#"} className="text-xs hover:underline" style={{ color: dark }}>{item.network}: {item.username}</a>
                  ))}
                </div>
              )}

              {key === "experience" && (section.items as any[]).map((item, i) => (
                <div key={item.id || i} className="mb-3">
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-sm font-bold text-foreground">{item.company}</h3>
                    <span className="text-xs text-muted-foreground/70 font-mono">{fmt(item.startDate, item.endDate)}</span>
                  </div>
                  <p className="text-sm italic" style={{ color: gold }}>{item.position}{item.location ? ` · ${item.location}` : ""}</p>
                  {item.description && <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{item.description}</p>}
                  {(item.highlights?.length ?? 0) > 0 && <ul className="mt-1 list-disc list-inside text-sm text-muted-foreground">{item.highlights?.map((h: string, hi: number) => <li key={hi}>{h}</li>)}</ul>}
                </div>
              ))}

              {key === "projects" && (section.items as any[]).map((item, i) => (
                <div key={item.id || i} className="mb-3">
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-sm font-bold text-foreground">{item.name}</h3>
                    <span className="text-xs text-muted-foreground/70 font-mono">{fmt(item.startDate, item.endDate)}</span>
                  </div>
                  {item.role && <p className="text-sm italic" style={{ color: gold }}>{item.role}</p>}
                  {item.description && <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{item.description}</p>}
                  {(item.highlights?.length ?? 0) > 0 && <ul className="mt-1 list-disc list-inside text-sm text-muted-foreground">{item.highlights?.map((h: string, hi: number) => <li key={hi}>{h}</li>)}</ul>}
                </div>
              ))}

              {key === "education" && (section.items as any[]).map((item, i) => (
                <div key={item.id || i} className="mb-3">
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-sm font-bold text-foreground">{item.school}</h3>
                    <span className="text-xs text-muted-foreground/70 font-mono">{fmt(item.startDate, item.endDate)}</span>
                  </div>
                  <p className="text-sm italic" style={{ color: gold }}>{item.degree}{item.area ? ` · ${item.area}` : ""}</p>
                  {item.gpa && <p className="text-xs text-muted-foreground">GPA: {item.gpa}</p>}
                  {(item.highlights?.length ?? 0) > 0 && <ul className="mt-1 list-disc list-inside text-sm text-muted-foreground">{item.highlights?.map((h: string, hi: number) => <li key={hi}>{h}</li>)}</ul>}
                </div>
              ))}

              {key === "skills" && (
                <div className="space-y-1">
                  {(section.items as any[]).map((item, i) => (
                    <div key={item.id || i} className="text-sm">
                      <span className="font-bold" style={{ color: dark }}>{item.name}</span>
                      {(item.keywords?.length ?? 0) > 0 && <span className="text-muted-foreground ml-2">{item.keywords?.join(" · ")}</span>}
                    </div>
                  ))}
                </div>
              )}

              {key === "languages" && (
                <div className="flex flex-wrap gap-4">
                  {(section.items as any[]).map((item, i) => (
                    <span key={item.id || i} className="text-sm text-muted-foreground">{item.name}{item.level ? ` — ${item.level}` : ""}</span>
                  ))}
                </div>
              )}

              {key === "certifications" && (section.items as any[]).map((item, i) => (
                <div key={item.id || i} className="mb-1">
                  <span className="text-sm font-bold text-foreground">{item.name}</span>
                  {item.issuer && <span className="text-sm text-muted-foreground"> — {item.issuer}</span>}
                  {item.date && <span className="text-xs text-muted-foreground/70 ml-1">{item.date}</span>}
                </div>
              ))}

              {key === "awards" && (section.items as any[]).map((item, i) => (
                <div key={item.id || i} className="mb-1">
                  <span className="text-sm font-bold text-foreground">{item.title}</span>
                  {item.issuer && <span className="text-sm text-muted-foreground"> — {item.issuer}</span>}
                  {item.date && <span className="text-xs text-muted-foreground/70 ml-1">{item.date}</span>}
                  {item.description && <p className="text-xs text-muted-foreground mt-0.5 italic">{item.description}</p>}
                </div>
              ))}
            </section>
          );
        })}

        {data.customSections.map((cs) => cs.items.length > 0 && (
          <section key={cs.id} className="mb-5">
            <h2 className="mb-2 text-sm font-bold uppercase tracking-widest" style={{ color: dark }}>{cs.title}</h2>
            <div className="mb-2" style={{ borderBottom: `2px solid ${gold}` }} />
            {cs.items.map((item: any, i: number) => (
              <div key={item.id || i} className="mb-1">
                <span className="text-sm font-bold text-foreground">{item.name || item.title || ""}</span>
                {item.description && <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>}
              </div>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
