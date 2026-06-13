import type { Metadata } from "next";
import "./globals.css";
import { AppNav } from "@/components/AppNav";

export const metadata: Metadata = {
  title: "AI 简历优化平台",
  description: "智能简历编辑、JD 匹配分析、模拟面试与 PDF 导出",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <AppNav />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
