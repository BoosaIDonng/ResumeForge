import type { ResumeData } from "../resumeData";

type Props = { data: ResumeData };

function fmt(start?: string, end?: string | null): string {
  if (!start) return end || "";
  if (end === null || end === undefined) return `${start} - 至今`;
  if (!end) return start;
  return `${start} - ${end}`;
}

export default function SidebarTemplate({ data }: Props) {
  const { basics, summary, sections } = data;
  const emerald = "#059669";

  return (
    <div className="mx-auto max-w-[210mm] bg-white text-foreground flex min-h-[297mm]" style={{ fontFamily: data.metadata.typography?.body?.fontFamily || "Inter, system-ui, sans-serif" }}>
      {/* Left sidebar — dark green */}
      <div className="w-1/3 p-6 text-white" style={{ backgroundColor: "#064e3b" }}>
        {/* Avatar placeholder */}
        <div className="mx-auto mb-4 size-20 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
          {(basics.name || "N")[0]}
        </div>
        <h1 className="text-lg font-bold text-center">{basics.name || "Your Name"}</h1>
        {basics.headline && <p className="mt-1 text-xs text-center opacity-80">{basics.headline}</p>}

        <div className="mt-6 space-y-2 text-xs opacity-90">
          {basics.email && <p className="break-all">{basics.email}</p>}
          {basics.phone && <p>{basics.phone}</p>}
          {basics.location && <p>{basics.location}</p>}
          {basics.website && <p className="break-all">{basics.website}</p>}
          {(basics.customFields || []).map((f) => <p key={f.id}>{f.text}</p>)}
        </div>

        {!sections.skills.hidden && sections.skills.items.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xs font-bold uppercase tracking-wider mb-2 border-b border-white/30 pb-1">技能</h2>
            <div className="space-y-2">
              {sections.skills.items.map((item, i) => (
                <div key={item.id || i}>
                  <span className="text-xs font-medium">{item.name}</span>
                  {item.level != null && (
                    <div className="flex gap-1 mt-0.5">
                      {Array.from({ length: 5 }, (_, j) => (
                        <div key={j} className={`h-1 w-4 rounded ${j < item.level! ? "bg-emerald-300" : "bg-white/20"}`} />
                      ))}
                    </div>
                  )}
                  {(item.keywords?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.keywords?.map((kw: string, ki: number) => (
                        <span key={ki} className="text-[10px] bg-white/15 rounded px-1 py-0.5">{kw}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {!sections.languages.hidden && sections.languages.items.length > 0 && (
          <div className="mt-5">
            <h2 className="text-xs font-bold uppercase tracking-wider mb-2 border-b border-white/30 pb-1">语言</h2>
            {sections.languages.items.map((item, i) => (
              <p key={item.id || i} className="text-xs opacity-90 mb-0.5">{item.name}{item.level ? ` — ${item.level}` : ""}</p>
            ))}
          </div>
        )}

        {!sections.certifications.hidden && sections.certifications.items.length > 0 && (
          <div className="mt-5">
            <h2 className="text-xs font-bold uppercase tracking-wider mb-2 border-b border-white/30 pb-1">证书</h2>
            {sections.certifications.items.map((item, i) => (
              <div key={item.id || i} className="mb-1">
                <p className="text-xs font-medium">{item.name}</p>
                {item.date && <p className="text-[10px] opacity-70">{item.date}</p>}
              </div>
            ))}
          </div>
        )}

        {!sections.profiles.hidden && sections.profiles.items.length > 0 && (
          <div className="mt-5">
            <h2 className="text-xs font-bold uppercase tracking-wider mb-2 border-b border-white/30 pb-1">链接</h2>
            {sections.profiles.items.map((item, i) => (
              <p key={item.id || i} className="text-xs opacity-90 mb-0.5">{item.network}: {item.username}</p>
            ))}
          </div>
        )}
      </div>

      {/* Right main content */}
      <div className="flex-1 p-6">
        {!summary.hidden && summary.content && (
          <section className="mb-4">
            <h2 className="mb-1.5 text-xs font-bold uppercase tracking-wider" style={{ color: emerald }}>{summary.title || "个人总结"}</h2>
            <div className="h-px bg-emerald-100 mb-2" />
            <p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">{summary.content}</p>
          </section>
        )}

        {!sections.experience.hidden && sections.experience.items.length > 0 && (
          <section className="mb-4">
            <h2 className="mb-1.5 text-xs font-bold uppercase tracking-wider" style={{ color: emerald }}>工作经历</h2>
            <div className="h-px bg-emerald-100 mb-2" />
            {sections.experience.items.map((item, i) => (
              <div key={item.id || i} className="mb-3">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-xs font-semibold text-foreground">{item.company}</h3>
                  <span className="text-[10px] text-muted-foreground/70">{fmt(item.startDate, item.endDate)}</span>
                </div>
                <p className="text-[11px] text-muted-foreground">{item.position}{item.location ? ` · ${item.location}` : ""}</p>
                {item.description && <p className="mt-0.5 text-[11px] text-muted-foreground whitespace-pre-wrap">{item.description}</p>}
                {(item.highlights?.length ?? 0) > 0 && <ul className="mt-0.5 list-disc list-inside text-[11px] text-muted-foreground">{item.highlights?.map((h: string, hi: number) => <li key={hi}>{h}</li>)}</ul>}
              </div>
            ))}
          </section>
        )}

        {!sections.projects.hidden && sections.projects.items.length > 0 && (
          <section className="mb-4">
            <h2 className="mb-1.5 text-xs font-bold uppercase tracking-wider" style={{ color: emerald }}>项目经历</h2>
            <div className="h-px bg-emerald-100 mb-2" />
            {sections.projects.items.map((item, i) => (
              <div key={item.id || i} className="mb-3">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-xs font-semibold text-foreground">{item.name}</h3>
                  <span className="text-[10px] text-muted-foreground/70">{fmt(item.startDate, item.endDate)}</span>
                </div>
                {item.role && <p className="text-[11px] text-muted-foreground">{item.role}</p>}
                {item.description && <p className="mt-0.5 text-[11px] text-muted-foreground whitespace-pre-wrap">{item.description}</p>}
                {(item.highlights?.length ?? 0) > 0 && <ul className="mt-0.5 list-disc list-inside text-[11px] text-muted-foreground">{item.highlights?.map((h: string, hi: number) => <li key={hi}>{h}</li>)}</ul>}
              </div>
            ))}
          </section>
        )}

        {!sections.education.hidden && sections.education.items.length > 0 && (
          <section className="mb-4">
            <h2 className="mb-1.5 text-xs font-bold uppercase tracking-wider" style={{ color: emerald }}>教育经历</h2>
            <div className="h-px bg-emerald-100 mb-2" />
            {sections.education.items.map((item, i) => (
              <div key={item.id || i} className="mb-2.5">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-xs font-semibold text-foreground">{item.school}</h3>
                  <span className="text-[10px] text-muted-foreground/70">{fmt(item.startDate, item.endDate)}</span>
                </div>
                <p className="text-[11px] text-muted-foreground">{item.degree}{item.area ? ` · ${item.area}` : ""}</p>
                {item.gpa && <p className="text-[10px] text-muted-foreground/70">GPA: {item.gpa}</p>}
                {(item.highlights?.length ?? 0) > 0 && <ul className="mt-0.5 list-disc list-inside text-[11px] text-muted-foreground">{item.highlights?.map((h: string, hi: number) => <li key={hi}>{h}</li>)}</ul>}
              </div>
            ))}
          </section>
        )}

        {!sections.awards.hidden && sections.awards.items.length > 0 && (
          <section className="mb-4">
            <h2 className="mb-1.5 text-xs font-bold uppercase tracking-wider" style={{ color: emerald }}>荣誉奖项</h2>
            <div className="h-px bg-emerald-100 mb-2" />
            {sections.awards.items.map((item, i) => (
              <div key={item.id || i} className="mb-1">
                <span className="text-xs font-medium text-foreground">{item.title}</span>
                {item.issuer && <span className="text-xs text-muted-foreground"> — {item.issuer}</span>}
                {item.date && <span className="text-[10px] text-muted-foreground/70 ml-1">{item.date}</span>}
                {item.description && <p className="text-[11px] text-muted-foreground mt-0.5">{item.description}</p>}
              </div>
            ))}
          </section>
        )}

        {data.customSections.map((cs) => cs.items.length > 0 && (
          <section key={cs.id} className="mb-4">
            <h2 className="mb-1.5 text-xs font-bold uppercase tracking-wider" style={{ color: emerald }}>{cs.title}</h2>
            <div className="h-px bg-emerald-100 mb-2" />
            {cs.items.map((item: any, i: number) => (
              <div key={item.id || i} className="mb-1">
                <span className="text-xs font-medium text-foreground">{item.name || item.title || ""}</span>
                {item.description && <p className="text-[11px] text-muted-foreground mt-0.5">{item.description}</p>}
              </div>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
