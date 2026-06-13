import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <section className="mb-10">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          AI 简历优化平台
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          从简历编辑到模拟面试，一站式提升你的求职竞争力
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          title="简历管理"
          description="创建、编辑结构化简历，上传 PDF 自动解析"
          href="/resumes"
          icon={<DocIcon />}
          color="blue"
        />
        <DashboardCard
          title="JD 分析"
          description="匹配岗位要求，ATS 评分 + 关键词分析"
          href="/jobs/new"
          icon={<SearchIcon />}
          color="purple"
        />
        <DashboardCard
          title="模拟面试"
          description="4 种面试官人格，练习回答并获取反馈"
          href="/interviews"
          icon={<ChatIcon />}
          color="emerald"
        />
      </div>

      <section className="mt-12 rounded-lg border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
          快速开始
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 text-sm text-zinc-600 dark:text-zinc-400">
          <Step num={1} text="创建一份结构化简历（或上传 PDF）" />
          <Step num={2} text="粘贴目标岗位 JD，提交分析" />
          <Step num={3} text="查看 ATS 报告 + 优化建议" />
          <Step num={4} text="选择面试官人格，开始模拟面试" />
          <Step num={5} text="查看面试反馈，导出 PDF" />
          <Step num={6} text="生成针对性求职信" />
        </div>
      </section>
    </div>
  );
}

function Step({ num, text }: { num: number; text: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
        {num}
      </span>
      <span>{text}</span>
    </div>
  );
}

const colorMap = {
  blue: "border-blue-100 hover:border-blue-300 dark:border-blue-900/30 dark:hover:border-blue-700",
  purple: "border-purple-100 hover:border-purple-300 dark:border-purple-900/30 dark:hover:border-purple-700",
  emerald: "border-emerald-100 hover:border-emerald-300 dark:border-emerald-900/30 dark:hover:border-emerald-700",
};

const iconBgMap = {
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
  purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
  emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
};

function DashboardCard({ title, description, href, icon, color }: {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: keyof typeof colorMap;
}) {
  return (
    <Link
      href={href}
      className={`group flex gap-4 rounded-xl border bg-white p-5 shadow-sm transition-all hover:shadow-md dark:bg-zinc-900 ${colorMap[color]}`}
    >
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBgMap[color]}`}>
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {title}
        </h3>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
      </div>
    </Link>
  );
}

function DocIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
    </svg>
  );
}
