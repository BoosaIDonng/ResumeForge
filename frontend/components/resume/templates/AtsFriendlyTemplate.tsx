import type { ResumeData } from "../resumeData";

type Props = { data: ResumeData };

function fmt(start?: string, end?: string | null): string {
  if (!start) return end || "";
  if (end === null || end === undefined) return `${start} - 至今`;
  if (!end) return start;
  return `${start} - ${end}`;
}

/**
 * ATS-Friendly Template
 * - No graphics, icons, or complex layouts
 * - Plain text, clear hierarchy
 * - Single column, standard fonts
 * - No color accents (black/gray only)
 * - Section headers in ALL CAPS for ATS parsing
 */
export default function AtsFriendlyTemplate({ data }: Props) {
  const { basics, summary, sections } = data;

  const visibleSections = [
    !sections.profiles.hidden && sections.profiles.items.length > 0 && { key: "profiles", title: "PROFILES" },
    !sections.experience.hidden && sections.experience.items.length > 0 && { key: "experience", title: "WORK EXPERIENCE" },
    !sections.projects.hidden && sections.projects.items.length > 0 && { key: "projects", title: "PROJECTS" },
    !sections.education.hidden && sections.education.items.length > 0 && { key: "education", title: "EDUCATION" },
    !sections.skills.hidden && sections.skills.items.length > 0 && { key: "skills", title: "SKILLS" },
    !sections.languages.hidden && sections.languages.items.length > 0 && { key: "languages", title: "LANGUAGES" },
    !sections.certifications.hidden && sections.certifications.items.length > 0 && { key: "certifications", title: "CERTIFICATIONS" },
    !sections.awards.hidden && sections.awards.items.length > 0 && { key: "awards", title: "AWARDS" },
  ].filter(Boolean) as { key: string; title: string }[];

  return (
    <div
      className="mx-auto max-w-[210mm] bg-white px-8 py-7 text-black"
      style={{ fontFamily: "Arial, Helvetica, sans-serif", fontSize: "12px", lineHeight: "1.5", color: "#000" }}
    >
      {/* Header — plain text only */}
      <div className="mb-4 text-center">
        <h1 className="text-xl font-bold" style={{ color: "#000" }}>{basics.name || "Your Name"}</h1>
        {basics.headline && <p className="text-sm mt-0.5" style={{ color: "#333" }}>{basics.headline}</p>}
        <p className="text-xs mt-1" style={{ color: "#333" }}>
          {[basics.email, basics.phone, basics.location, basics.website].filter(Boolean).join(" | ")}
        </p>
        {(basics.customFields || []).length > 0 && (
          <p className="text-xs mt-0.5" style={{ color: "#333" }}>
            {basics.customFields!.map((f) => f.text).join(" | ")}
          </p>
        )}
      </div>

      <hr className="border-black mb-4" />

      {/* Summary */}
      {!summary.hidden && summary.content && (
        <section className="mb-4">
          <h2 className="text-sm font-bold mb-1" style={{ color: "#000" }}>{summary.title || "SUMMARY"}</h2>
          <p className="text-xs whitespace-pre-wrap" style={{ color: "#222" }}>{summary.content}</p>
        </section>
      )}

      {/* Sections */}
      {visibleSections.map(({ key, title }) => {
        const section = sections[key as keyof typeof sections];
        if (!section || !("items" in section)) return null;

        return (
          <section key={key} className="mb-4">
            <h2 className="text-sm font-bold mb-1" style={{ color: "#000" }}>{title}</h2>
            <hr className="border-gray-300 mb-1.5" />

            {key === "profiles" && (
              <div className="text-xs" style={{ color: "#222" }}>
                {(section.items as any[]).map((item, i) => (
                  <p key={item.id || i}>{item.network}: {item.username}{item.url ? ` (${item.url})` : ""}</p>
                ))}
              </div>
            )}

            {key === "experience" && (section.items as any[]).map((item, i) => (
              <div key={item.id || i} className="mb-2.5">
                <p className="text-xs font-bold" style={{ color: "#000" }}>{item.company}, {item.position}{item.location ? ` - ${item.location}` : ""}</p>
                <p className="text-xs" style={{ color: "#333" }}>{fmt(item.startDate, item.endDate)}</p>
                {item.description && <p className="text-xs mt-0.5 whitespace-pre-wrap" style={{ color: "#222" }}>{item.description}</p>}
                {(item.highlights?.length ?? 0) > 0 && (
                  <ul className="mt-0.5 ml-4 list-disc text-xs" style={{ color: "#222" }}>
                    {item.highlights?.map((h: string, hi: number) => <li key={hi}>{h}</li>)}
                  </ul>
                )}
              </div>
            ))}

            {key === "projects" && (section.items as any[]).map((item, i) => (
              <div key={item.id || i} className="mb-2.5">
                <p className="text-xs font-bold" style={{ color: "#000" }}>{item.name}{item.role ? `, ${item.role}` : ""}</p>
                <p className="text-xs" style={{ color: "#333" }}>{fmt(item.startDate, item.endDate)}</p>
                {item.description && <p className="text-xs mt-0.5 whitespace-pre-wrap" style={{ color: "#222" }}>{item.description}</p>}
                {(item.highlights?.length ?? 0) > 0 && (
                  <ul className="mt-0.5 ml-4 list-disc text-xs" style={{ color: "#222" }}>
                    {item.highlights?.map((h: string, hi: number) => <li key={hi}>{h}</li>)}
                  </ul>
                )}
              </div>
            ))}

            {key === "education" && (section.items as any[]).map((item, i) => (
              <div key={item.id || i} className="mb-2.5">
                <p className="text-xs font-bold" style={{ color: "#000" }}>{item.school}, {item.degree}{item.area ? ` in ${item.area}` : ""}</p>
                <p className="text-xs" style={{ color: "#333" }}>{fmt(item.startDate, item.endDate)}{item.gpa ? ` | GPA: ${item.gpa}` : ""}</p>
                {(item.highlights?.length ?? 0) > 0 && (
                  <ul className="mt-0.5 ml-4 list-disc text-xs" style={{ color: "#222" }}>
                    {item.highlights?.map((h: string, hi: number) => <li key={hi}>{h}</li>)}
                  </ul>
                )}
              </div>
            ))}

            {key === "skills" && (
              <div className="text-xs" style={{ color: "#222" }}>
                {(section.items as any[]).map((item, i) => (
                  <p key={item.id || i}>
                    <span className="font-bold">{item.name}:</span>{" "}
                    {(item.keywords?.length ?? 0) > 0 ? item.keywords?.join(", ") : "—"}
                  </p>
                ))}
              </div>
            )}

            {key === "languages" && (
              <div className="text-xs" style={{ color: "#222" }}>
                {(section.items as any[]).map((item, i) => (
                  <span key={item.id || i}>{i > 0 && " · "}{item.name}{item.level ? ` (${item.level})` : ""}</span>
                ))}
              </div>
            )}

            {key === "certifications" && (section.items as any[]).map((item, i) => (
              <p key={item.id || i} className="text-xs" style={{ color: "#222" }}>
                {item.name}{item.issuer ? ` - ${item.issuer}` : ""}{item.date ? ` (${item.date})` : ""}
              </p>
            ))}

            {key === "awards" && (section.items as any[]).map((item, i) => (
              <p key={item.id || i} className="text-xs" style={{ color: "#222" }}>
                {item.title}{item.issuer ? ` - ${item.issuer}` : ""}{item.date ? ` (${item.date})` : ""}
                {item.description ? ` — ${item.description}` : ""}
              </p>
            ))}
          </section>
        );
      })}

      {data.customSections.map((cs) => cs.items.length > 0 && (
        <section key={cs.id} className="mb-4">
          <h2 className="text-sm font-bold mb-1" style={{ color: "#000" }}>{cs.title.toUpperCase()}</h2>
          <hr className="border-gray-300 mb-1.5" />
          {cs.items.map((item: any, i: number) => (
            <div key={item.id || i} className="mb-1">
              <p className="text-xs" style={{ color: "#222" }}>
                <span className="font-bold">{item.name || item.title || ""}</span>
                {item.description ? ` — ${item.description}` : ""}
              </p>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
