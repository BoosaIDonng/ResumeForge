import type { ResumeData } from "./resumeData";

type Props = {
  data: ResumeData;
};

export default function ResumePreview({ data }: Props) {
  const { basics, summary, sections } = data;

  return (
    <div className="mx-auto max-w-[210mm] rounded bg-white p-8 shadow-sm">
      {/* Header */}
      <div className="mb-4 border-b border-gray-200 pb-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900">{basics.name || "Your Name"}</h1>
        {basics.headline && <p className="mt-1 text-base text-gray-600">{basics.headline}</p>}
        <p className="mt-2 text-sm text-gray-500">
          {[basics.email, basics.phone, basics.location, basics.website]
            .filter(Boolean)
            .join(" | ")}
        </p>
      </div>

      {/* Summary */}
      {summary.content && (
        <section className="mb-4">
          <h2 className="mb-2 text-lg font-semibold text-gray-800 border-b border-gray-100 pb-1">Summary</h2>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{summary.content}</p>
        </section>
      )}

      {/* Skills */}
      {sections.skills.items.length > 0 && (
        <section className="mb-4">
          <h2 className="mb-2 text-lg font-semibold text-gray-800 border-b border-gray-100 pb-1">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {sections.skills.items.map((skill, i) => (
              <span key={i} className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Experience */}
      {sections.experience.items.length > 0 && (
        <section className="mb-4">
          <h2 className="mb-2 text-lg font-semibold text-gray-800 border-b border-gray-100 pb-1">Experience</h2>
          <div className="space-y-3">
            {sections.experience.items.map((item, i) => (
              <div key={i}>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">{item.company}</h3>
                  <span className="text-xs text-gray-500">{item.period}</span>
                </div>
                <p className="text-sm font-medium text-gray-600">{item.position}</p>
                {item.description && <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{item.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {sections.projects.items.length > 0 && (
        <section className="mb-4">
          <h2 className="mb-2 text-lg font-semibold text-gray-800 border-b border-gray-100 pb-1">Projects</h2>
          <div className="space-y-3">
            {sections.projects.items.map((item, i) => (
              <div key={i}>
                <h3 className="text-sm font-semibold text-gray-900">{item.name}</h3>
                <p className="text-sm font-medium text-gray-600">{item.role}</p>
                {item.description && <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{item.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {sections.education.items.length > 0 && (
        <section className="mb-4">
          <h2 className="mb-2 text-lg font-semibold text-gray-800 border-b border-gray-100 pb-1">Education</h2>
          <div className="space-y-3">
            {sections.education.items.map((item, i) => (
              <div key={i}>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">{item.school}</h3>
                  <span className="text-xs text-gray-500">{item.period}</span>
                </div>
                <p className="text-sm font-medium text-gray-600">{item.degree}</p>
                {item.description && <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{item.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
