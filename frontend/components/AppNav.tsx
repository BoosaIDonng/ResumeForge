"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";
import SettingsDialog from "./SettingsDialog";
import { SearchCommand, SearchButton } from "./SearchCommand";

const navItems = [
  { href: "/", label: "首页", num: "01" },
  { href: "/resumes", label: "简历", num: "02" },
  { href: "/jobs/new", label: "JD 分析", num: "03" },
  { href: "/interviews", label: "面试", num: "04" },
  { href: "/applications", label: "投递", num: "05" },
];

export function AppNav() {
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  const today = new Date().toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  return (
    <>
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm">
        {/* Date line */}
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-1 text-[11px] text-muted-foreground">
          <span>{today}</span>
          <span className="tracking-wider uppercase">AI Resume · 简报</span>
        </div>

        {/* Masthead — double rule */}
        <div className="border-y-[3px] border-double border-border">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-2">
            <Link href="/" className="group flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center border-2 border-primary bg-primary font-heading text-base font-bold text-primary-foreground">
                印
              </span>
              <div className="flex flex-col">
                <span className="font-heading text-xl font-bold tracking-tight leading-none text-foreground">
                  AI Resume
                </span>
                <span className="text-[10px] font-medium tracking-[0.15em] text-muted-foreground uppercase">
                  简历优化平台
                </span>
              </div>
            </Link>

            <div className="flex items-center divide-x divide-border">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-1.5 text-[13px] font-medium transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="mr-1.5 text-[10px] font-bold opacity-50">{item.num}</span>
                    {item.label}
                  </Link>
                );
              })}
              <SearchButton />
              <button
                onClick={() => setSettingsOpen(true)}
                className="flex items-center gap-1.5 px-4 py-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <Settings className="h-3.5 w-3.5" />
                设置
              </button>
            </div>
          </nav>
        </div>

        {/* Red accent line */}
        <div className="h-[2px] bg-primary" />
      </header>

      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <SearchCommand />
    </>
  );
}
