import type { ResumeData } from "../resumeData";

type Props = { data: ResumeData };

export default function ClassicTemplate({ data }: Props) {
  const { basics, summary, sections } = data;

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
    <div
      className="mx-auto max-w-[210mm] bg-white p-8 text-foreground"
      style={{ fontFamily: data.metadata.typography?.body?.fontFamily || "Georgia, \"Times New Roman\", serif" }}
    >
      {/* Header */}
      <div className="mb-4 pb-3 text-center">
        <h1 className="text-2xl font-bold tracking-wide uppercase">{basics.name || "Your Name"}</h1>
        {basics.headline && <p className="mt-1 text-sm text-muted-foreground italic">{basics.headline}</p>}
        <p className="mt-2 text-xs text-muted-foreground">
          {[basics.email, basics.phone, basics.location, basics.website].filter(Boolean).join(" | ")}
        </p>
        {(basics.customFields || []).length > 0 && (
          <p className="mt-1 text-xs text-muted-foreground">
            {basics.customFields!.map((f, i) => (
              <span key={f.id}>
                {i > 0 && " | "}
                {f.link ? <a href={f.link} className="hover:underline text-muted-foreground">{f.text}</a> : <span>{f.text}</span>}
              </span>
            ))}
          </p>
        )}
      </div>
      <hr className="border-border mb-4" />

      {/* Summary */}
      {!summary.hidden && summary.content && (
        <section className="mb-4">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wider underline underline-offset-4 decoration-muted-foreground/70">
            {summary.title || "个人总结"}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{summary.content}</p>
        </section>
      )}

      {/* Dynamic Sections */}
      {visibleSections.map(({ key }) => {
        const section = sections[key as keyof typeof sections];
        if (!section || !("items" in section)) return null;

        return (
          <section key={key} className="mb-4">
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wider underline underline-offset-4 decoration-muted-foreground/70">
              {section.title}
            </h2>

            {key === "profiles" && (
              <div className="flex flex-wrap gap-4">
                {(section.items as any[]).map((item, i) => (
                  <span key={item.id || i} className="text-sm text-muted-foreground">
                    {item.network}: {item.url ? <a href={item.url} className="hover:underline">{item.username}</a> : item.username}
                  </span>
                ))}
              </div>
            )}

            {key === "experience" && (section.items as any[]).map((item, i) => (
              <div key={item.id || i} className="mb-3">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-sm font-bold text-foreground">{item.company}</h3>
                  <span className="text-xs text-muted-foreground">{item.period}</span>
                </div>
                <p className="text-sm italic text-muted-foreground">{item.position}{item.location ? ` · ${item.location}` : ""}</p>
                {item.description && <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{item.description}</p>}
              </div>
            ))}

            {key === "projects" && (section.items as any[]).map((item, i) => (
              <div key={item.id || i} className="mb-3">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-sm font-bold text-foreground">{item.name}</h3>
                  {item.period && <span className="text-xs text-muted-foreground">{item.period}</span>}
                </div>
                <p className="text-sm italic text-muted-foreground">{item.role}</p>
                {item.website && <p className="text-xs text-muted-foreground mt-0.5"><a href={item.website} className="hover:underline">{item.website}</a></p>}
                {item.description && <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{item.description}</p>}
              </div>
            ))}

            {key === "education" && (section.items as any[]).map((item, i) => (
              <div key={item.id || i} className="mb-3">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-sm font-bold text-foreground">{item.school}</h3>
                  <span className="text-xs text-muted-foreground">{item.period}</span>
                </div>
                <p className="text-sm italic text-muted-foreground">{item.degree}{item.area ? ` · ${item.area}` : ""}</p>
                {item.description && <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{item.description}</p>}
              </div>
            ))}

            {key === "skills" && (
              <div className="space-y-1.5">
                {(section.items as any[]).map((item, i) => (
                  <div key={item.id || i}>
                    <span className="text-sm font-bold text-foreground">{item.name}</span>
                    {item.level != null && <span className="text-xs text-muted-foreground ml-1">({item.level}/5)</span>}
                    {item.keywords && item.keywords.length > 0 && (
                      <span className="text-sm text-muted-foreground ml-2">— {item.keywords.join(", ")}</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {key === "languages" && (
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {(section.items as any[]).map((item, i) => (
                  <span key={item.id || i} className="text-sm text-muted-foreground">
                    {item.name}{item.level ? ` — ${item.level}` : ""}
                  </span>
                ))}
              </div>
            )}

            {key === "certifications" && (section.items as any[]).map((item, i) => (
              <div key={item.id || i} className="mb-1.5">
                <span className="text-sm font-bold text-foreground">{item.name}</span>
                {item.issuer && <span className="text-sm text-muted-foreground"> — {item.issuer}</span>}
                {item.date && <span className="text-xs text-muted-foreground/70 ml-2">({item.date})</span>}
              </div>
            ))}

            {key === "awards" && (section.items as any[]).map((item, i) => (
              <div key={item.id || i} className="mb-1.5">
                <span className="text-sm font-bold text-foreground">{item.title}</span>
                {item.issuer && <span className="text-sm text-muted-foreground"> — {item.issuer}</span>}
                {item.date && <span className="text-xs text-muted-foreground/70 ml-2">({item.date})</span>}
                {item.description && <p className="text-xs text-muted-foreground mt-0.5 italic">{item.description}</p>}
              </div>
            ))}
          </section>
        );
      })}

      {/* Custom Sections */}
      {data.customSections.map((cs) => (
        cs.items.length > 0 && (
          <section key={cs.id} className="mb-4">
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wider underline underline-offset-4 decoration-muted-foreground/70">
              {cs.title}
            </h2>
            {cs.items.map((item: any, i: number) => (
              <div key={item.id || i} className="mb-1.5">
                <span className="text-sm font-bold text-foreground">{item.name || item.title || ""}</span>
                {item.description && <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>}
              </div>
            ))}
          </section>
        )
      ))}
    </div>
  );
}
