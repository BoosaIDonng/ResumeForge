import type { ResumeData } from "./resumeData";
import { getTemplate } from "./templates";

type Props = {
  data: ResumeData;
};

export default function ResumePreview({ data }: Props) {
  const TemplateComponent = getTemplate(data.metadata.template);
  return <TemplateComponent data={data} />;
}
