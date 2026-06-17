import type { ResumeData } from "../resumeData";

type Props = { data: ResumeData };

function fmt(start?: string, end?: string | null): string {
  if (!start) return end || "";
  if (end === null || end === undefined) return `${start} - 至今`;
  if (!end) return start;
  return `${start} - ${end}`;
}

export default function ElegantTemplate({ data }: Props) {
  const { basics, summary, sections } = data;
  const plum = "#6b21a8";

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
      className="mx-auto max-w-[210mm] bg-white px-10 py-8 text-foreground"
      style={{ fontFamily: data.metadata.typography?.body?.fontFamily || "Georgia, \"Times New Roman\", \"Noto Serif SC\", serif" }}
    >
      {/* Elegant header with thin lines */}
      <div className="text-center mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 h-px" style={{ backgroundColor: `${plum}30` }} />
          <div className="size-1.5 rounded-full" style={{ backgroundColor: plum }} />
          <div className="flex-1 h-px" style={{ backgroundColor: `${plum}30` }} />
        </div>
        <h1 className="text-2xl font-light tracking-widest uppercase" style={{ color: plum }}>{basics.name || "Your Name"}</h1>
        {basics.headline && <p className="mt-1 text-sm italic text-muted-foreground tracking-wide">{basics.headline}</p>}
        <div className="mt-2 flex justify-center flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground/80">
          {basics.email && <span>{basics.email}</span>}
          {basics.phone && <span>{basics.phone}</span>}
          {basics.location && <span>{basics.location}</span>}
          {basics.website && <span>{basics.website}</span>}
          {(basics.customFields || []).map((f) => <span key={f.id}>{f.text}</span>)}
        </div>
        <div className="flex items-center gap-3 mt-3">
          <div className="flex-1 h-px" style={{ backgroundColor: `${plum}30` }} />
          <div className="size-1.5 rounded-full" style={{ backgroundColor: plum }} />
          <div className="flex-1 h-px" style={{ backgroundColor: `${plum}30` }} />
        </div>
      </div>

      {/* Summary */}
      {!summary.hidden && summary.content && (
        <section className="mb-5">
          <h2 className="text-sm font-light uppercase tracking-[0.2em] text-center mb-2" style={{ color: plum }}>{summary.title || "个人总结"}</h2>
          <p className="text-sm leading-relaxed text-muted-foreground text-center whitespace-pre-wrap italic">{summary.content}</p>
        </section>
      )}

      {visibleSections.map(({ key }) => {
        const section = sections[key as keyof typeof sections];
        if (!section || !("items" in section)) return null;

        return (
          <section key={key} className="mb-5">
            <h2 className="text-sm font-light uppercase tracking-[0.2em] text-center mb-2" style={{ color: plum }}>{section.title}</h2>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-px" style={{ backgroundColor: `${plum}20` }} />
              <div className="size-1 rounded-full" style={{ backgroundColor: `${plum}60` }} />
              <div className="flex-1 h-px" style={{ backgroundColor: `${plum}20` }} />
            </div>

            {key === "profiles" && (
              <div className="flex flex-wrap justify-center gap-3">
                {(section.items as any[]).map((item, i) => (
                  <a key={item.id || i} href={item.url || "#"} className="text-xs italic hover:underline" style={{ color: plum }}>{item.network}: {item.username}</a>
                ))}
              </div>
            )}

            {key === "experience" && (section.items as any[]).map((item, i) => (
              <div key={item.id || i} className="mb-3 text-center">
                <h3 className="text-sm font-semibold text-foreground">{item.company}</h3>
                <p className="text-xs italic text-muted-foreground">{item.position}{item.location ? ` · ${item.location}` : ""}</p>
                <p className="text-xs text-muted-foreground/70 mt-0.5">{fmt(item.startDate, item.endDate)}</p>
                {item.description && <p className="mt-1 text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">{item.description}</p>}
                {(item.highlights?.length ?? 0) > 0 && <ul className="mt-1 list-none text-xs text-muted-foreground">{item.highlights?.map((h: string, hi: number) => <li key={hi}>✦ {h}</li>)}</ul>}
              </div>
            ))}

            {key === "projects" && (section.items as any[]).map((item, i) => (
              <div key={item.id || i} className="mb-3 text-center">
                <h3 className="text-sm font-semibold text-foreground">{item.name}</h3>
                {item.role && <p className="text-xs italic text-muted-foreground">{item.role}</p>}
                <p className="text-xs text-muted-foreground/70 mt-0.5">{fmt(item.startDate, item.endDate)}</p>
                {item.description && <p className="mt-1 text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">{item.description}</p>}
                {(item.highlights?.length ?? 0) > 0 && <ul className="mt-1 list-none text-xs text-muted-foreground">{item.highlights?.map((h: string, hi: number) => <li key={hi}>✦ {h}</li>)}</ul>}
              </div>
            ))}

            {key === "education" && (section.items as any[]).map((item, i) => (
              <div key={item.id || i} className="mb-3 text-center">
                <h3 className="text-sm font-semibold text-foreground">{item.school}</h3>
                <p className="text-xs italic text-muted-foreground">{item.degree}{item.area ? ` · ${item.area}` : ""}</p>
                {item.gpa && <p className="text-xs text-muted-foreground/70">GPA: {item.gpa}</p>}
                <p className="text-xs text-muted-foreground/70 mt-0.5">{fmt(item.startDate, item.endDate)}</p>
                {(item.highlights?.length ?? 0) > 0 && <ul className="mt-1 list-none text-xs text-muted-foreground">{item.highlights?.map((h: string, hi: number) => <li key={hi}>✦ {h}</li>)}</ul>}
              </div>
            ))}

            {key === "skills" && (
              <div className="text-center">
                {(section.items as any[]).map((item, i) => (
                  <div key={item.id || i} className="mb-1.5">
                    <span className="text-xs font-semibold text-foreground">{item.name}</span>
                    {(item.keywords?.length ?? 0) > 0 && <span className="text-xs text-muted-foreground italic ml-2">{item.keywords?.join(" · ")}</span>}
                  </div>
                ))}
              </div>
            )}

            {key === "languages" && (
              <div className="flex flex-wrap justify-center gap-3">
                {(section.items as any[]).map((item, i) => (
                  <span key={item.id || i} className="text-xs italic text-muted-foreground">{item.name}{item.level ? ` — ${item.level}` : ""}</span>
                ))}
              </div>
            )}

            {key === "certifications" && (section.items as any[]).map((item, i) => (
              <div key={item.id || i} className="mb-1 text-center">
                <span className="text-xs font-medium text-foreground">{item.name}</span>
                {item.issuer && <span className="text-xs text-muted-foreground italic"> — {item.issuer}</span>}
                {item.date && <span className="text-xs text-muted-foreground/70 ml-1">{item.date}</span>}
              </div>
            ))}

            {key === "awards" && (section.items as any[]).map((item, i) => (
              <div key={item.id || i} className="mb-1 text-center">
                <span className="text-xs font-medium text-foreground">{item.title}</span>
                {item.issuer && <span className="text-xs text-muted-foreground italic"> — {item.issuer}</span>}
                {item.date && <span className="text-xs text-muted-foreground/70 ml-1">{item.date}</span>}
                {item.description && <p className="text-xs text-muted-foreground mt-0.5 italic">{item.description}</p>}
              </div>
            ))}
          </section>
        );
      })}

      {data.customSections.map((cs) => cs.items.length > 0 && (
        <section key={cs.id} className="mb-5">
          <h2 className="text-sm font-light uppercase tracking-[0.2em] text-center mb-2" style={{ color: plum }}>{cs.title}</h2>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 h-px" style={{ backgroundColor: `${plum}20` }} />
            <div className="size-1 rounded-full" style={{ backgroundColor: `${plum}60` }} />
            <div className="flex-1 h-px" style={{ backgroundColor: `${plum}20` }} />
          </div>
          {cs.items.map((item: any, i: number) => (
            <div key={item.id || i} className="mb-1 text-center">
              <span className="text-xs font-medium text-foreground">{item.name || item.title || ""}</span>
              {item.description && <p className="text-xs text-muted-foreground mt-0.5 italic">{item.description}</p>}
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
