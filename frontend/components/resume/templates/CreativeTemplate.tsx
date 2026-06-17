import type { ResumeData } from "../resumeData";

type Props = { data: ResumeData };

function fmt(start?: string, end?: string | null): string {
  if (!start) return end || "";
  if (end === null || end === undefined) return `${start} - 至今`;
  if (!end) return start;
  return `${start} - ${end}`;
}

export default function CreativeTemplate({ data }: Props) {
  const { basics, summary, sections } = data;
  const coral = "#e76f51";
  const teal = "#2a9d8f";

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
      {/* Colorful header */}
      <div className="px-8 py-6" style={{ background: `linear-gradient(135deg, ${coral}, ${teal})` }}>
        <h1 className="text-3xl font-bold text-white tracking-tight">{basics.name || "Your Name"}</h1>
        {basics.headline && <p className="mt-1 text-sm text-white/90">{basics.headline}</p>}
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/80">
          {basics.email && <span className="bg-white/20 rounded-full px-2.5 py-0.5">{basics.email}</span>}
          {basics.phone && <span className="bg-white/20 rounded-full px-2.5 py-0.5">{basics.phone}</span>}
          {basics.location && <span className="bg-white/20 rounded-full px-2.5 py-0.5">{basics.location}</span>}
          {basics.website && <span className="bg-white/20 rounded-full px-2.5 py-0.5">{basics.website}</span>}
          {(basics.customFields || []).map((f) => <span key={f.id} className="bg-white/20 rounded-full px-2.5 py-0.5">{f.text}</span>)}
        </div>
      </div>

      <div className="px-8 py-6">
        {!summary.hidden && summary.content && (
          <section className="mb-5">
            <h2 className="mb-2 text-sm font-bold" style={{ color: coral }}>{summary.title || "个人总结"}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{summary.content}</p>
          </section>
        )}

        {visibleSections.map(({ key }, idx) => {
          const section = sections[key as keyof typeof sections];
          if (!section || !("items" in section)) return null;
          const accent = idx % 2 === 0 ? coral : teal;

          return (
            <section key={key} className="mb-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="size-2 rounded-full" style={{ backgroundColor: accent }} />
                <h2 className="text-sm font-bold" style={{ color: accent }}>{section.title}</h2>
              </div>
              <div className="ml-1 pl-4 border-l-2" style={{ borderColor: `${accent}40` }}>

                {key === "profiles" && (
                  <div className="flex flex-wrap gap-2">
                    {(section.items as any[]).map((item, i) => (
                      <a key={item.id || i} href={item.url || "#"} className="text-xs rounded-full px-2.5 py-0.5 hover:opacity-80" style={{ backgroundColor: `${accent}15`, color: accent }}>{item.network}: {item.username}</a>
                    ))}
                  </div>
                )}

                {key === "experience" && (section.items as any[]).map((item, i) => (
                  <div key={item.id || i} className="mb-3">
                    <div className="flex items-baseline justify-between">
                      <h3 className="text-sm font-semibold text-foreground">{item.company}</h3>
                      <span className="text-xs text-muted-foreground/70">{fmt(item.startDate, item.endDate)}</span>
                    </div>
                    <p className="text-xs font-medium" style={{ color: accent }}>{item.position}{item.location ? ` · ${item.location}` : ""}</p>
                    {item.description && <p className="mt-1 text-xs text-muted-foreground whitespace-pre-wrap">{item.description}</p>}
                    {(item.highlights?.length ?? 0) > 0 && <ul className="mt-1 list-disc list-inside text-xs text-muted-foreground">{item.highlights?.map((h: string, hi: number) => <li key={hi}>{h}</li>)}</ul>}
                  </div>
                ))}

                {key === "projects" && (section.items as any[]).map((item, i) => (
                  <div key={item.id || i} className="mb-3">
                    <div className="flex items-baseline justify-between">
                      <h3 className="text-sm font-semibold text-foreground">{item.name}</h3>
                      <span className="text-xs text-muted-foreground/70">{fmt(item.startDate, item.endDate)}</span>
                    </div>
                    {item.role && <p className="text-xs font-medium" style={{ color: accent }}>{item.role}</p>}
                    {item.description && <p className="mt-1 text-xs text-muted-foreground whitespace-pre-wrap">{item.description}</p>}
                    {(item.highlights?.length ?? 0) > 0 && <ul className="mt-1 list-disc list-inside text-xs text-muted-foreground">{item.highlights?.map((h: string, hi: number) => <li key={hi}>{h}</li>)}</ul>}
                  </div>
                ))}

                {key === "education" && (section.items as any[]).map((item, i) => (
                  <div key={item.id || i} className="mb-3">
                    <div className="flex items-baseline justify-between">
                      <h3 className="text-sm font-semibold text-foreground">{item.school}</h3>
                      <span className="text-xs text-muted-foreground/70">{fmt(item.startDate, item.endDate)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.degree}{item.area ? ` · ${item.area}` : ""}</p>
                    {item.gpa && <p className="text-xs text-muted-foreground/70">GPA: {item.gpa}</p>}
                    {(item.highlights?.length ?? 0) > 0 && <ul className="mt-1 list-disc list-inside text-xs text-muted-foreground">{item.highlights?.map((h: string, hi: number) => <li key={hi}>{h}</li>)}</ul>}
                  </div>
                ))}

                {key === "skills" && (
                  <div className="flex flex-wrap gap-1.5">
                    {(section.items as any[]).map((item, i) => (
                      <div key={item.id || i}>
                        <span className="inline-block text-xs font-medium rounded-l-full px-2.5 py-0.5 text-white" style={{ backgroundColor: accent }}>{item.name}</span>
                        {(item.keywords?.length ?? 0) > 0 && (
                          <span className="inline-block text-xs px-2 py-0.5 rounded-r-full" style={{ backgroundColor: `${accent}15`, color: accent }}>{item.keywords?.join(", ")}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {key === "languages" && (
                  <div className="flex flex-wrap gap-2">
                    {(section.items as any[]).map((item, i) => (
                      <span key={item.id || i} className="text-xs rounded-full px-2.5 py-0.5" style={{ backgroundColor: `${accent}10`, color: accent }}>{item.name}{item.level ? ` (${item.level})` : ""}</span>
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
              </div>
            </section>
          );
        })}

        {data.customSections.map((cs) => cs.items.length > 0 && (
          <section key={cs.id} className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="size-2 rounded-full" style={{ backgroundColor: coral }} />
              <h2 className="text-sm font-bold" style={{ color: coral }}>{cs.title}</h2>
            </div>
            <div className="ml-1 pl-4 border-l-2" style={{ borderColor: `${coral}40` }}>
              {cs.items.map((item: any, i: number) => (
                <div key={item.id || i} className="mb-1">
                  <span className="text-xs font-medium text-foreground">{item.name || item.title || ""}</span>
                  {item.description && <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
