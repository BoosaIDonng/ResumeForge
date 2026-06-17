import type { ResumeData } from "../resumeData";

type Props = { data: ResumeData };

function fmt(start?: string, end?: string | null): string {
  if (!start) return end || "";
  if (end === null || end === undefined) return `${start} - 至今`;
  if (!end) return start;
  return `${start} - ${end}`;
}

/**
 * Academic Template
 * - Education section comes first (prominent)
 * - Serif font, formal style
 * - Publications-friendly layout
 * - Conservative design
 */
export default function AcademicTemplate({ data }: Props) {
  const { basics, summary, sections } = data;
  const maroon = "#7f1d1d";

  // Academic order: education first
  const academicOrder = [
    !sections.education.hidden && sections.education.items.length > 0 && { key: "education", title: "教育背景" },
    !sections.experience.hidden && sections.experience.items.length > 0 && { key: "experience", title: "工作经历" },
    !sections.projects.hidden && sections.projects.items.length > 0 && { key: "projects", title: "研究/项目经历" },
    !sections.skills.hidden && sections.skills.items.length > 0 && { key: "skills", title: "专业技能" },
    !sections.certifications.hidden && sections.certifications.items.length > 0 && { key: "certifications", title: "资格认证" },
    !sections.awards.hidden && sections.awards.items.length > 0 && { key: "awards", title: "荣誉奖项" },
    !sections.profiles.hidden && sections.profiles.items.length > 0 && { key: "profiles", title: "学术链接" },
    !sections.languages.hidden && sections.languages.items.length > 0 && { key: "languages", title: "语言能力" },
  ].filter(Boolean) as { key: string; title: string }[];

  return (
    <div
      className="mx-auto max-w-[210mm] bg-white px-9 py-7 text-foreground"
      style={{ fontFamily: data.metadata.typography?.body?.fontFamily || "\"Noto Serif SC\", Georgia, \"Times New Roman\", serif" }}
    >
      {/* Academic header */}
      <div className="mb-5 text-center">
        <h1 className="text-2xl font-bold tracking-wide" style={{ color: maroon }}>{basics.name || "Your Name"}</h1>
        {basics.headline && <p className="mt-1 text-sm italic text-muted-foreground">{basics.headline}</p>}
        <div className="mt-2 text-xs text-muted-foreground">
          <p>{[basics.email, basics.phone].filter(Boolean).join(" | ")}</p>
          <p>{[basics.location, basics.website].filter(Boolean).join(" | ")}</p>
          {(basics.customFields || []).length > 0 && (
            <p className="mt-0.5">{basics.customFields!.map((f) => f.text).join(" | ")}</p>
          )}
        </div>
      </div>

      <hr className="border-t-2 mb-5" style={{ borderColor: maroon }} />

      {/* Summary */}
      {!summary.hidden && summary.content && (
        <section className="mb-4">
          <h2 className="text-sm font-bold mb-1.5" style={{ color: maroon }}>{summary.title || "个人简介"}</h2>
          <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{summary.content}</p>
        </section>
      )}

      {/* Sections in academic order */}
      {academicOrder.map(({ key, title }) => {
        const section = sections[key as keyof typeof sections];
        if (!section || !("items" in section)) return null;

        return (
          <section key={key} className="mb-4">
            <h2 className="text-sm font-bold mb-1.5" style={{ color: maroon }}>{title}</h2>
            <hr className="border-t mb-2" style={{ borderColor: `${maroon}30` }} />

            {key === "profiles" && (
              <div className="flex flex-wrap gap-3">
                {(section.items as any[]).map((item, i) => (
                  <a key={item.id || i} href={item.url || "#"} className="text-xs italic hover:underline" style={{ color: maroon }}>{item.network}: {item.username}</a>
                ))}
              </div>
            )}

            {key === "experience" && (section.items as any[]).map((item, i) => (
              <div key={item.id || i} className="mb-3">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-sm font-bold text-foreground">{item.position}</h3>
                  <span className="text-xs text-muted-foreground">{fmt(item.startDate, item.endDate)}</span>
                </div>
                <p className="text-sm italic text-muted-foreground">{item.company}{item.location ? `, ${item.location}` : ""}</p>
                {item.description && <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{item.description}</p>}
                {(item.highlights?.length ?? 0) > 0 && (
                  <ul className="mt-1 ml-4 list-disc text-sm text-muted-foreground">
                    {item.highlights?.map((h: string, hi: number) => <li key={hi}>{h}</li>)}
                  </ul>
                )}
              </div>
            ))}

            {key === "projects" && (section.items as any[]).map((item, i) => (
              <div key={item.id || i} className="mb-3">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-sm font-bold text-foreground">{item.name}</h3>
                  <span className="text-xs text-muted-foreground">{fmt(item.startDate, item.endDate)}</span>
                </div>
                {item.role && <p className="text-sm italic text-muted-foreground">{item.role}</p>}
                {item.description && <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{item.description}</p>}
                {(item.highlights?.length ?? 0) > 0 && (
                  <ul className="mt-1 ml-4 list-disc text-sm text-muted-foreground">
                    {item.highlights?.map((h: string, hi: number) => <li key={hi}>{h}</li>)}
                  </ul>
                )}
              </div>
            ))}

            {key === "education" && (section.items as any[]).map((item, i) => (
              <div key={item.id || i} className="mb-3">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-sm font-bold text-foreground">{item.school}</h3>
                  <span className="text-xs text-muted-foreground">{fmt(item.startDate, item.endDate)}</span>
                </div>
                <p className="text-sm italic text-muted-foreground">{item.degree}{item.area ? ` — ${item.area}` : ""}</p>
                {item.gpa && <p className="text-xs text-muted-foreground">GPA: {item.gpa}</p>}
                {(item.highlights?.length ?? 0) > 0 && (
                  <ul className="mt-1 ml-4 list-disc text-sm text-muted-foreground">
                    {item.highlights?.map((h: string, hi: number) => <li key={hi}>{h}</li>)}
                  </ul>
                )}
              </div>
            ))}

            {key === "skills" && (
              <div className="space-y-1">
                {(section.items as any[]).map((item, i) => (
                  <div key={item.id || i} className="text-sm">
                    <span className="font-bold text-foreground">{item.name}:</span>
                    {(item.keywords?.length ?? 0) > 0 && <span className="text-muted-foreground ml-1">{item.keywords?.join(", ")}</span>}
                  </div>
                ))}
              </div>
            )}

            {key === "languages" && (
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {(section.items as any[]).map((item, i) => (
                  <span key={item.id || i} className="text-sm text-muted-foreground">{item.name}{item.level ? ` — ${item.level}` : ""}</span>
                ))}
              </div>
            )}

            {key === "certifications" && (section.items as any[]).map((item, i) => (
              <div key={item.id || i} className="mb-1">
                <span className="text-sm font-bold text-foreground">{item.name}</span>
                {item.issuer && <span className="text-sm text-muted-foreground"> — {item.issuer}</span>}
                {item.date && <span className="text-xs text-muted-foreground/70 ml-1">({item.date})</span>}
              </div>
            ))}

            {key === "awards" && (section.items as any[]).map((item, i) => (
              <div key={item.id || i} className="mb-1.5">
                <span className="text-sm font-bold text-foreground">{item.title}</span>
                {item.issuer && <span className="text-sm text-muted-foreground"> — {item.issuer}</span>}
                {item.date && <span className="text-xs text-muted-foreground/70 ml-1">({item.date})</span>}
                {item.description && <p className="text-xs text-muted-foreground mt-0.5 italic">{item.description}</p>}
              </div>
            ))}
          </section>
        );
      })}

      {data.customSections.map((cs) => cs.items.length > 0 && (
        <section key={cs.id} className="mb-4">
          <h2 className="text-sm font-bold mb-1.5" style={{ color: maroon }}>{cs.title}</h2>
          <hr className="border-t mb-2" style={{ borderColor: `${maroon}30` }} />
          {cs.items.map((item: any, i: number) => (
            <div key={item.id || i} className="mb-1.5">
              <span className="text-sm font-bold text-foreground">{item.name || item.title || ""}</span>
              {item.description && <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>}
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
