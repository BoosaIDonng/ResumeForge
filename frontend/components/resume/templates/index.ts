import type { ResumeData } from "../resumeData";
import DefaultTemplate from "./DefaultTemplate";
import ModernTemplate from "./ModernTemplate";
import ClassicTemplate from "./ClassicTemplate";
import MinimalTemplate from "./MinimalTemplate";

export type TemplateProps = {
  data: ResumeData;
};

export type TemplateComponent = React.ComponentType<TemplateProps>;

const templateRegistry: Record<string, TemplateComponent> = {
  default: DefaultTemplate,
  modern: ModernTemplate,
  classic: ClassicTemplate,
  minimal: MinimalTemplate,
};

export function getTemplate(name: string): TemplateComponent {
  return templateRegistry[name] || DefaultTemplate;
}

export function getTemplateNames(): string[] {
  return Object.keys(templateRegistry);
}
