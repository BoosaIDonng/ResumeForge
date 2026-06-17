import type { ResumeData } from "../resumeData";
import DefaultTemplate from "./DefaultTemplate";
import ModernTemplate from "./ModernTemplate";
import ClassicTemplate from "./ClassicTemplate";
import MinimalTemplate from "./MinimalTemplate";
import CleanTemplate from "./CleanTemplate";
import ProfessionalTemplate from "./ProfessionalTemplate";
import ExecutiveTemplate from "./ExecutiveTemplate";
import CreativeTemplate from "./CreativeTemplate";
import TimelineTemplate from "./TimelineTemplate";
import TwoColumnTemplate from "./TwoColumnTemplate";
import SidebarTemplate from "./SidebarTemplate";
import CompactTemplate from "./CompactTemplate";
import AtsFriendlyTemplate from "./AtsFriendlyTemplate";
import ElegantTemplate from "./ElegantTemplate";
import AcademicTemplate from "./AcademicTemplate";

export type TemplateProps = {
  data: ResumeData;
};

export type TemplateComponent = React.ComponentType<TemplateProps>;

export interface TemplateMeta {
  id: string;
  name: string;
  description: string;
  component: TemplateComponent;
}

export const templates: TemplateMeta[] = [
  {
    id: "default",
    name: "默认",
    description: "经典单栏布局，居中标题，蓝色主色调",
    component: DefaultTemplate,
  },
  {
    id: "modern",
    name: "现代",
    description: "双栏布局，深色侧边栏，技能进度条",
    component: ModernTemplate,
  },
  {
    id: "classic",
    name: "典雅",
    description: "衬线字体，下划线标题，传统正式风格",
    component: ClassicTemplate,
  },
  {
    id: "minimal",
    name: "极简",
    description: "小字号，等宽字体，留白克制，技术风格",
    component: MinimalTemplate,
  },
  {
    id: "clean",
    name: "简洁",
    description: "清爽左对齐，圆角技能标签，轻量分隔线",
    component: CleanTemplate,
  },
  {
    id: "professional",
    name: "专业",
    description: "深蓝头部，左对齐时间线，企业稳重风格",
    component: ProfessionalTemplate,
  },
  {
    id: "executive",
    name: "高管",
    description: "深色头部金色点缀，衬线字体，庄重正式",
    component: ExecutiveTemplate,
  },
  {
    id: "creative",
    name: "创意",
    description: "渐变彩色头部，圆角标签，交替色彩装饰",
    component: CreativeTemplate,
  },
  {
    id: "timeline",
    name: "时间线",
    description: "垂直时间轴设计，适合展示职业发展历程",
    component: TimelineTemplate,
  },
  {
    id: "two-column",
    name: "双栏",
    description: "40/60 双栏布局，左侧技能和联系信息",
    component: TwoColumnTemplate,
  },
  {
    id: "sidebar",
    name: "侧边栏",
    description: "深绿侧边栏，头像占位，右侧详细内容",
    component: SidebarTemplate,
  },
  {
    id: "compact",
    name: "紧凑",
    description: "高密度排版，适合内容丰富的资深简历",
    component: CompactTemplate,
  },
  {
    id: "ats-friendly",
    name: "ATS友好",
    description: "纯文本结构，无图形装饰，机器可读优先",
    component: AtsFriendlyTemplate,
  },
  {
    id: "elegant",
    name: "优雅",
    description: "居中布局，装饰线条，紫色点缀，衬线字体",
    component: ElegantTemplate,
  },
  {
    id: "academic",
    name: "学术",
    description: "教育背景优先展示，学术风格，适合研究者",
    component: AcademicTemplate,
  },
];

const templateRegistry: Record<string, TemplateComponent> = Object.fromEntries(
  templates.map((t) => [t.id, t.component])
);

export function getTemplate(name: string): TemplateComponent {
  return templateRegistry[name] || DefaultTemplate;
}
