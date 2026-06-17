import type { ResumeData } from "../resumeData";

type Props = { data: ResumeData };

function fmt(start?: string, end?: string | null): string {
  if (!start) return end || "";
  if (end === null || end === undefined) return `${start} - 至今`;
  if (!end) return start;
  return `${start} - ${end}`;
}

export default function CompactTemplate({ data }: Props) {
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
      className="mx-auto max-w-[210mm] bg-white px-7 py-5 text-foreground"
      style={{ fontFamily: data.metadata.typography?.body?.fontFamily || "Inter, system-ui, sans-serif", fontSize: "11px", lineHeight: "1.4" }}
    >
      {/* Compact header — single line */}
      <div className="mb-3 pb-2 border-b border-border">
        <div className="flex items-baseline justify-between">
          <h1 className="text-lg font-bold" style={{ color: "#111" }}>{basics.name || "Your Name"}</h1>
          <div className="text-[10px] text-muted-foreground flex gap-2">
            {basics.email && <span>{basics.email}</span>}
            {basics.phone && <span>{basics.phone}</span>}
            {basics.location && <span>{basics.location}</span>}
          </div>
        </div>
        {basics.headline && <p className="text-xs text-muted-foreground mt-0.5">{basics.headline}</p>}
        {(basics.website || (basics.customFields || []).length > 0) && (
          <div className="text-[10px] text-muted-foreground mt-0.5 flex gap-2">
            {basics.website && <span>{basics.website}</span>}
            {(basics.customFields || []).map((f) => <span key={f.id}>{f.text}</span>)}
          </div>
        )}
      </div>

      {!summary.hidden && summary.content && (
        <section className="mb-2.5">
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">{summary.title || "个人总结"}</h2>
          <p className="text-[11px] text-muted-foreground whitespace-pre-wrap leading-snug">{summary.content}</p>
        </section>
      )}

      {visibleSections.map(({ key }) => {
        const section = sections[key as keyof typeof sections];
        if (!section || !("items" in section)) return null;

        return (
          <section key={key} className="mb-2.5">
            <h2 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5 border-b border-dashed border-border pb-0.5">{section.title}</h2>

            {key === "profiles" && (
              <div className="flex flex-wrap gap-2">
                {(section.items as any[]).map((item, i) => (
                  <span key={item.id || i} className="text-[10px] text-muted-foreground">{item.network}: {item.username}</span>
                ))}
              </div>
            )}

            {key === "experience" && (section.items as any[]).map((item, i) => (
              <div key={item.id || i} className="mb-1.5">
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-foreground text-[11px]">{item.company}</span>
                  <span className="text-muted-foreground text-[11px]">{item.position}</span>
                  <span className="ml-auto text-[10px] text-muted-foreground/70 shrink-0">{fmt(item.startDate, item.endDate)}</span>
                </div>
                {item.description && <p className="text-[10px] text-muted-foreground whitespace-pre-wrap leading-snug">{item.description}</p>}
                {(item.highlights?.length ?? 0) > 0 && <p className="text-[10px] text-muted-foreground">▸ {item.highlights?.join(" · ")}</p>}
              </div>
            ))}

            {key === "projects" && (section.items as any[]).map((item, i) => (
              <div key={item.id || i} className="mb-1.5">
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-foreground text-[11px]">{item.name}</span>
                  {item.role && <span className="text-muted-foreground text-[11px]">{item.role}</span>}
                  <span className="ml-auto text-[10px] text-muted-foreground/70 shrink-0">{fmt(item.startDate, item.endDate)}</span>
                </div>
                {item.description && <p className="text-[10px] text-muted-foreground whitespace-pre-wrap leading-snug">{item.description}</p>}
                {(item.highlights?.length ?? 0) > 0 && <p className="text-[10px] text-muted-foreground">▸ {item.highlights?.join(" · ")}</p>}
              </div>
            ))}

            {key === "education" && (section.items as any[]).map((item, i) => (
              <div key={item.id || i} className="mb-1.5">
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-foreground text-[11px]">{item.school}</span>
                  <span className="text-muted-foreground text-[11px]">{item.degree}{item.area ? ` · ${item.area}` : ""}</span>
                  {item.gpa && <span className="text-[10px] text-muted-foreground/70">GPA:{item.gpa}</span>}
                  <span className="ml-auto text-[10px] text-muted-foreground/70 shrink-0">{fmt(item.startDate, item.endDate)}</span>
                </div>
                {(item.highlights?.length ?? 0) > 0 && <p className="text-[10px] text-muted-foreground">▸ {item.highlights?.join(" · ")}</p>}
              </div>
            ))}

            {key === "skills" && (
              <div className="text-[10px] text-muted-foreground">
                {(section.items as any[]).map((item, i) => (
                  <span key={item.id || i}>
                    {i > 0 && " · "}
                    <span className="font-medium text-foreground">{item.name}</span>
                    {(item.keywords?.length ?? 0) > 0 && `: ${item.keywords?.join(", ")}`}
                  </span>
                ))}
              </div>
            )}

            {key === "languages" && (
              <div className="text-[10px] text-muted-foreground">
                {(section.items as any[]).map((item, i) => (
                  <span key={item.id || i}>{i > 0 && " · "}{item.name}{item.level ? `(${item.level})` : ""}</span>
                ))}
              </div>
            )}

            {key === "certifications" && (section.items as any[]).map((item, i) => (
              <span key={item.id || i} className="text-[10px] text-muted-foreground">
                {i > 0 && " · "}
                <span className="text-foreground">{item.name}</span>
                {item.issuer && ` (${item.issuer})`}
                {item.date && ` [${item.date}]`}
              </span>
            ))}

            {key === "awards" && (section.items as any[]).map((item, i) => (
              <span key={item.id || i} className="text-[10px] text-muted-foreground">
                {i > 0 && " · "}
                <span className="text-foreground">{item.title}</span>
                {item.issuer && ` (${item.issuer})`}
                {item.date && ` [${item.date}]`}
              </span>
            ))}
          </section>
        );
      })}

      {data.customSections.map((cs) => cs.items.length > 0 && (
        <section key={cs.id} className="mb-2.5">
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5 border-b border-dashed border-border pb-0.5">{cs.title}</h2>
          {cs.items.map((item: any, i: number) => (
            <div key={item.id || i} className="mb-1">
              <span className="text-[11px] font-medium text-foreground">{item.name || item.title || ""}</span>
              {item.description && <span className="text-[10px] text-muted-foreground ml-1">{item.description}</span>}
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
