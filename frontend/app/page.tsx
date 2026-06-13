import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          AI 简历优化平台
        </h1>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <DashboardCard
            title="简历管理"
            description="创建和编辑结构化简历"
            href="/resumes"
          />
          <DashboardCard
            title="JD 分析"
            description="匹配岗位要求，生成 ATS 报告"
            href="/analysis"
          />
          <DashboardCard
            title="优化建议"
            description="AI 生成安全的简历优化方案"
            href="/optimization"
          />
          <DashboardCard
            title="模拟面试"
            description="基于简历和 JD 的文本面试练习"
            href="/interviews"
          />
        </div>

        <section className="mt-10">
          <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-4">
            快速开始
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-zinc-600 dark:text-zinc-400">
            <li>创建一份结构化简历</li>
            <li>粘贴目标岗位 JD</li>
            <li>提交 JD 分析，查看匹配报告</li>
            <li>生成优化建议并预览</li>
            <li>创建模拟面试，练习回答</li>
            <li>查看面试反馈报告</li>
          </ol>
        </section>
      </main>
    </div>
  );
}

function DashboardCard({ title, description, href }: { title: string; description: string; href: string }) {
  return (
    <Link
      href={href}
      className="block rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
    >
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
    </Link>
  );
}
