"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
} from "cmdk";
import {
  FileText,
  Briefcase,
  Send,
  MessageSquare,
  Search,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { apiGet } from "@/lib/api";
import type { SearchResult } from "@/lib/types";

const typeConfig: Record<string, { icon: React.ElementType; label: string }> = {
  resume: { icon: FileText, label: "简历" },
  resumes: { icon: FileText, label: "简历" },
  job: { icon: Briefcase, label: "职位" },
  jobs: { icon: Briefcase, label: "职位" },
  application: { icon: Send, label: "投递" },
  applications: { icon: Send, label: "投递" },
  interview: { icon: MessageSquare, label: "面试" },
  interviews: { icon: MessageSquare, label: "面试" },
};

function getConfig(type: string) {
  return typeConfig[type] ?? { icon: Search, label: type };
}

export function SearchCommand() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  const search = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!q.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await apiGet<SearchResult[]>(
          `/api/search?q=${encodeURIComponent(q)}`
        );
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  const handleSelect = (url: string) => {
    setOpen(false);
    router.push(url);
  };

  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, item) => {
    const key = item.type;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-lg p-0 overflow-hidden"
      >
        <Command
          shouldFilter={false}
          className=" [&_[cmdk-input-wrapper]]:flex [&_[cmdk-input-wrapper]]:items-center [&_[cmdk-input-wrapper]]:gap-2 [&_[cmdk-input-wrapper]]:border-b [&_[cmdk-input-wrapper]]:px-4 [&_[cmdk-input-wrapper]]:py-3 [&_[cmdk-input-wrapper]]:border-border [&_[cmdk-input]]:w-full [&_[cmdk-input]]:bg-transparent [&_[cmdk-input]]:text-sm [&_[cmdk-input]]:outline-none [&_[cmdk-input]]:placeholder:text-muted-foreground"
        >
          <CommandInput
            placeholder="搜索简历、职位、投递、面试…"
            value={query}
            onValueChange={(v) => {
              setQuery(v);
              search(v);
            }}
          />
          <CommandList className="max-h-80 overflow-y-auto px-2 py-2">
            {loading && (
              <CommandLoading>
                <div className="flex items-center justify-center py-6 text-xs text-muted-foreground">
                  搜索中…
                </div>
              </CommandLoading>
            )}

            {!loading && query.trim() && results.length === 0 && (
              <CommandEmpty>
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Search className="mb-2 h-5 w-5 opacity-40" />
                  <span className="text-xs">无结果</span>
                </div>
              </CommandEmpty>
            )}

            {Object.entries(grouped).map(([type, items]) => {
              const { icon: Icon, label } = getConfig(type);
              return (
                <CommandGroup
                  key={type}
                  heading={label}
                  className="mb-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:uppercase"
                >
                  {items.map((item, i) => (
                    <CommandItem
                      key={`${type}-${i}`}
                      value={item.title}
                      onSelect={() => handleSelect(item.url)}
                      className="flex items-center gap-3 rounded-md px-2 py-2 text-sm cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-border bg-muted">
                        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium truncate">{item.title}</span>
                        {item.subtitle && (
                          <span className="text-xs text-muted-foreground truncate">
                            {item.subtitle}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              );
            })}

            {!loading && !query.trim() && (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                <Search className="mb-2 h-5 w-5 opacity-30" />
                <span className="text-xs">输入关键词开始搜索</span>
              </div>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

export function SearchButton() {
  return (
    <button
      onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
      className="flex items-center gap-1.5 px-4 py-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors"
    >
      <Search className="h-3.5 w-3.5" />
      <span>搜索</span>
      <kbd className="ml-1 hidden h-5 items-center gap-0.5 rounded border border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground sm:inline-flex">
        ⌘K
      </kbd>
    </button>
  );
}
