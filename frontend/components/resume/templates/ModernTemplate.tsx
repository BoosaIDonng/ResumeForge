import { Mail, Smartphone, MapPin, Link } from "lucide-react";
import type { ResumeData } from "../resumeData";

type Props = { data: ResumeData };

function formatDateRange(startDate?: string, endDate?: string | null): string {
  if (!startDate) return endDate || "";
  if (endDate === null || endDate === undefined) return `${startDate} - 至今`;
  if (!endDate) return startDate;
  return `${startDate} - ${endDate}`;
}

export default function ModernTemplate({ data }: Props) {
  const { basics, summary, sections } = data;
  const primary = data.metadata.design?.colors?.primary || "#1e40af";

  return (
    <div className="mx-auto max-w-[210mm] bg-white text-foreground flex min-h-[297mm]" style={{ fontFamily: data.metadata.typography?.body?.fontFamily || "Inter, system-ui, sans-serif" }}>
      {/* Sidebar */}
      <div className="w-1/3 p-6 text-white" style={{ backgroundColor: primary }}>
        <h1 className="text-2xl font-bold tracking-tight">{basics.name || "Your Name"}</h1>
        {basics.headline && <p className="mt-1 text-sm opacity-90">{basics.headline}</p>}

        <div className="mt-6 space-y-2 text-sm opacity-90">
          {basics.email && <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 shrink-0" /> {basics.email}</p>}
          {basics.phone && <p className="flex items-center gap-2"><Smartphone className="h-3.5 w-3.5 shrink-0" /> {basics.phone}</p>}
          {basics.location && <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 shrink-0" /> {basics.location}</p>}
          {basics.website && <p className="flex items-center gap-2"><Link className="h-3.5 w-3.5 shrink-0" /> {basics.website}</p>}
          {(basics.customFields || []).map((f) => (
            <p key={f.id}>{f.text}</p>
          ))}
        </div>

        {/* Profiles in sidebar */}
        {!sections.profiles.hidden && sections.profiles.items.length > 0 && (
          <div className="mt-6">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-2 border-b border-white/30 pb-1">个人资料</h2>
            {sections.profiles.items.map((item, i) => (
              <p key={item.id || i} className="text-sm opacity-90">{item.network}: {item.username}</p>
            ))}
          </div>
        )}

        {/* Skills in sidebar */}
        {!sections.skills.hidden && sections.skills.items.length > 0 && (
          <div className="mt-6">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-2 border-b border-white/30 pb-1">技能</h2>
            <div className="space-y-3">
              {sections.skills.items.map((item, i) => (
                <div key={item.id || i}>
                  <span className="text-sm font-medium">{item.name}</span>
                  {item.level != null && (
                    <div className="flex gap-1 mt-1">
                      {Array.from({ length: 5 }, (_, j) => (
                        <div key={j} className={`h-1.5 w-5 rounded ${j < item.level! ? "bg-white" : "bg-white/30"}`} />
                      ))}
                    </div>
                  )}
                  {item.keywords && item.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.keywords?.map((kw: string, ki: number) => (
                        <span key={ki} className="text-[10px] bg-white/20 rounded px-1.5 py-0.5">{kw}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Languages in sidebar */}
        {!sections.languages.hidden && sections.languages.items.length > 0 && (
          <div className="mt-6">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-2 border-b border-white/30 pb-1">语言</h2>
            {sections.languages.items.map((item, i) => (
              <p key={item.id || i} className="text-sm opacity-90">{item.name}{item.level ? ` — ${item.level}` : ""}</p>
            ))}
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 p-6">
        {!summary.hidden && summary.content && (
          <section className="mb-5">
            <h2 className="text-base font-bold uppercase tracking-wider mb-2 pb-1 border-b-2" style={{ color: primary, borderColor: primary }}>{summary.title || "个人总结"}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{summary.content}</p>
          </section>
        )}

        {!sections.experience.hidden && sections.experience.items.length > 0 && (
          <section className="mb-5">
            <h2 className="text-base font-bold uppercase tracking-wider mb-2 pb-1 border-b-2" style={{ color: primary, borderColor: primary }}>工作经历</h2>
            {sections.experience.items.map((item, i) => (
              <div key={item.id || i} className="mb-3">
                <div className="flex justify-between items-baseline">
                  <h3 className="text-sm font-semibold text-foreground">{item.company}</h3>
                  <span className="text-xs text-muted-foreground">{formatDateRange(item.startDate, item.endDate)}</span>
                </div>
                <p className="text-sm text-muted-foreground">{item.position}{item.location ? ` · ${item.location}` : ""}</p>
                {item.description && <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{item.description}</p>}
                {item.highlights && item.highlights.length > 0 && (
                  <ul className="mt-1 list-disc list-inside text-sm text-muted-foreground">
                    {item.highlights?.map((h: string, hi: number) => <li key={hi}>{h}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </section>
        )}

        {!sections.projects.hidden && sections.projects.items.length > 0 && (
          <section className="mb-5">
            <h2 className="text-base font-bold uppercase tracking-wider mb-2 pb-1 border-b-2" style={{ color: primary, borderColor: primary }}>项目经历</h2>
            {sections.projects.items.map((item, i) => (
              <div key={item.id || i} className="mb-3">
                <div className="flex justify-between items-baseline">
                  <h3 className="text-sm font-semibold text-foreground">{item.name}</h3>
                  <span className="text-xs text-muted-foreground">{formatDateRange(item.startDate, item.endDate)}</span>
                </div>
                {item.role && <p className="text-sm text-muted-foreground">{item.role}</p>}
                {item.description && <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{item.description}</p>}
                {item.highlights && item.highlights.length > 0 && (
                  <ul className="mt-1 list-disc list-inside text-sm text-muted-foreground">
                    {item.highlights?.map((h: string, hi: number) => <li key={hi}>{h}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </section>
        )}

        {!sections.education.hidden && sections.education.items.length > 0 && (
          <section className="mb-5">
            <h2 className="text-base font-bold uppercase tracking-wider mb-2 pb-1 border-b-2" style={{ color: primary, borderColor: primary }}>教育经历</h2>
            {sections.education.items.map((item, i) => (
              <div key={item.id || i} className="mb-3">
                <div className="flex justify-between items-baseline">
                  <h3 className="text-sm font-semibold text-foreground">{item.school}</h3>
                  <span className="text-xs text-muted-foreground">{formatDateRange(item.startDate, item.endDate)}</span>
                </div>
                <p className="text-sm text-muted-foreground">{item.degree}{item.area ? ` · ${item.area}` : ""}</p>
                {item.gpa && <p className="text-xs text-muted-foreground">GPA: {item.gpa}</p>}
                {item.highlights && item.highlights.length > 0 && (
                  <ul className="mt-1 list-disc list-inside text-sm text-muted-foreground">
                    {item.highlights?.map((h: string, hi: number) => <li key={hi}>{h}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </section>
        )}

        {!sections.certifications.hidden && sections.certifications.items.length > 0 && (
          <section className="mb-5">
            <h2 className="text-base font-bold uppercase tracking-wider mb-2 pb-1 border-b-2" style={{ color: primary, borderColor: primary }}>证书</h2>
            {sections.certifications.items.map((item, i) => (
              <div key={item.id || i} className="mb-1">
                <span className="text-sm font-medium">{item.name}</span>
                {item.issuer && <span className="text-sm text-muted-foreground"> — {item.issuer}</span>}
                {item.date && <span className="text-xs text-muted-foreground/70 ml-2">{item.date}</span>}
              </div>
            ))}
          </section>
        )}

        {!sections.awards.hidden && sections.awards.items.length > 0 && (
          <section className="mb-5">
            <h2 className="text-base font-bold uppercase tracking-wider mb-2 pb-1 border-b-2" style={{ color: primary, borderColor: primary }}>荣誉奖项</h2>
            {sections.awards.items.map((item, i) => (
              <div key={item.id || i} className="mb-2">
                <span className="text-sm font-medium">{item.title}</span>
                {item.issuer && <span className="text-sm text-muted-foreground"> — {item.issuer}</span>}
                {item.description && <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>}
              </div>
            ))}
          </section>
        )}

        {/* Custom Sections */}
        {data.customSections.map((cs) => (
          cs.items.length > 0 && (
            <section key={cs.id} className="mb-5">
              <h2 className="text-base font-bold uppercase tracking-wider mb-2 pb-1 border-b-2" style={{ color: primary, borderColor: primary }}>{cs.title}</h2>
              {cs.items.map((item: any, i: number) => (
                <div key={item.id || i} className="mb-2">
                  <span className="text-sm font-medium">{item.name || item.title || ""}</span>
                  {item.description && <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>}
                </div>
              ))}
            </section>
          )
        ))}
      </div>
    </div>
  );
}
