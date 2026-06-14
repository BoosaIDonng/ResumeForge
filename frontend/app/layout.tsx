import type { Metadata } from "next";
import "./globals.css";
import { AppNav } from "@/components/AppNav";
import { Geist, Lora } from "next/font/google";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const lora = Lora({ subsets: ["latin"], variable: "--font-heading" });

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
    <html lang="zh-CN" className={cn("h-full antialiased", geist.variable, lora.variable)}>
      <body className="min-h-full flex flex-col font-sans">
        <TooltipProvider>
          <AppNav />
          <main className="flex-1">{children}</main>
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  );
}
