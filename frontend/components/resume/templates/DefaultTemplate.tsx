import type { ResumeData } from "../resumeData";

type Props = { data: ResumeData };

export default function DefaultTemplate({ data }: Props) {
  const { basics, summary, sections } = data;
  const primary = data.metadata.design?.colors?.primary || "#2563eb";

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
    <div className="mx-auto max-w-[210mm] bg-white p-8 text-foreground" style={{ fontFamily: data.metadata.typography?.body?.fontFamily || "Inter, system-ui, sans-serif" }}>
      {/* Header */}
      <div className="mb-6 border-b-2 pb-4 text-center" style={{ borderColor: primary }}>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: primary }}>{basics.name || "Your Name"}</h1>
        {basics.headline && <p className="mt-1 text-base text-muted-foreground">{basics.headline}</p>}
        <p className="mt-2 text-sm text-muted-foreground">
          {[basics.email, basics.phone, basics.location, basics.website].filter(Boolean).join(" | ")}
        </p>
        {(basics.customFields || []).length > 0 && (
          <p className="mt-1 text-sm text-muted-foreground">
            {basics.customFields!.map((f) => f.link ? <a key={f.id} href={f.link} className="hover:underline" style={{ color: primary }}>{f.text}</a> : <span key={f.id}>{f.text}</span>).reduce((prev, curr) => prev === null ? curr : <>{prev} | {curr}</>, null as React.ReactNode)}
          </p>
        )}
      </div>

      {/* Summary */}
      {!summary.hidden && summary.content && (
        <section className="mb-5">
          <h2 className="mb-2 text-base font-bold uppercase tracking-wider border-b pb-1" style={{ color: primary, borderColor: `${primary}30` }}>{summary.title || "个人总结"}</h2>
          <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{summary.content}</p>
        </section>
      )}

      {/* Dynamic Sections */}
      {visibleSections.map(({ key }) => {
        const section = sections[key as keyof typeof sections];
        if (!section || !("items" in section)) return null;

        return (
          <section key={key} className="mb-5">
            <h2 className="mb-2 text-base font-bold uppercase tracking-wider border-b pb-1" style={{ color: primary, borderColor: `${primary}30` }}>{section.title}</h2>

            {key === "profiles" && (
              <div className="flex flex-wrap gap-3">
                {(section.items as any[]).map((item, i) => (
                  <a key={item.id || i} href={item.url || "#"} className="text-sm hover:underline" style={{ color: primary }}>{item.network}: {item.username}</a>
                ))}
              </div>
            )}

            {key === "experience" && (section.items as any[]).map((item, i) => (
              <div key={item.id || i} className="mb-3">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-sm font-semibold text-foreground">{item.company}</h3>
                  <span className="text-xs text-muted-foreground">{item.period}</span>
                </div>
                <p className="text-sm font-medium text-muted-foreground">{item.position}{item.location ? ` · ${item.location}` : ""}</p>
                {item.description && <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{item.description}</p>}
              </div>
            ))}

            {key === "projects" && (section.items as any[]).map((item, i) => (
              <div key={item.id || i} className="mb-3">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-sm font-semibold text-foreground">{item.name}</h3>
                  {item.period && <span className="text-xs text-muted-foreground">{item.period}</span>}
                </div>
                <p className="text-sm font-medium text-muted-foreground">{item.role}</p>
                {item.website && <a href={item.website} className="text-xs hover:underline" style={{ color: primary }}>{item.website}</a>}
                {item.description && <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{item.description}</p>}
              </div>
            ))}

            {key === "education" && (section.items as any[]).map((item, i) => (
              <div key={item.id || i} className="mb-3">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-sm font-semibold text-foreground">{item.school}</h3>
                  <span className="text-xs text-muted-foreground">{item.period}</span>
                </div>
                <p className="text-sm font-medium text-muted-foreground">{item.degree}{item.area ? ` · ${item.area}` : ""}</p>
                {item.description && <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{item.description}</p>}
              </div>
            ))}

            {key === "skills" && (
              <div className="space-y-2">
                {(section.items as any[]).map((item, i) => (
                  <div key={item.id || i}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-foreground">{item.name}</span>
                      {item.level != null && <span className="text-[10px] opacity-60">{"●".repeat(item.level)}{"○".repeat(5 - item.level)}</span>}
                    </div>
                    {item.keywords && item.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {item.keywords.map((kw: string, ki: number) => (
                          <span key={ki} className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: `${primary}15`, color: primary }}>{kw}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {key === "languages" && (
              <div className="flex flex-wrap gap-3">
                {(section.items as any[]).map((item, i) => (
                  <span key={item.id || i} className="text-sm text-muted-foreground">{item.name}{item.level ? ` (${item.level})` : ""}</span>
                ))}
              </div>
            )}

            {key === "certifications" && (section.items as any[]).map((item, i) => (
              <div key={item.id || i} className="mb-2">
                <span className="text-sm font-medium text-foreground">{item.name}</span>
                {item.issuer && <span className="text-sm text-muted-foreground"> — {item.issuer}</span>}
                {item.date && <span className="text-xs text-muted-foreground/70 ml-2">{item.date}</span>}
              </div>
            ))}

            {key === "awards" && (section.items as any[]).map((item, i) => (
              <div key={item.id || i} className="mb-2">
                <span className="text-sm font-medium text-foreground">{item.title}</span>
                {item.issuer && <span className="text-sm text-muted-foreground"> — {item.issuer}</span>}
                {item.date && <span className="text-xs text-muted-foreground/70 ml-2">{item.date}</span>}
                {item.description && <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>}
              </div>
            ))}
          </section>
        );
      })}

      {/* Custom Sections */}
      {data.customSections.map((cs) => (
        cs.items.length > 0 && (
          <section key={cs.id} className="mb-5">
            <h2 className="mb-2 text-base font-bold uppercase tracking-wider border-b pb-1" style={{ color: primary, borderColor: `${primary}30` }}>{cs.title}</h2>
            {cs.items.map((item: any, i: number) => (
              <div key={item.id || i} className="mb-2">
                <span className="text-sm font-medium text-foreground">{item.name || item.title || ""}</span>
                {item.description && <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>}
              </div>
            ))}
          </section>
        )
      ))}
    </div>
  );
}
