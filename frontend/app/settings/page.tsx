"use client";

import { useState, useEffect } from "react";
import { Bot, Palette, Settings, Eye, EyeOff, Database } from "lucide-react";
import { DataBackup } from "@/components/DataBackup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  loadAISettings,
  saveAISettings,
  getDefaults,
  type AIProvider,
  type AISettings,
} from "@/lib/ai-settings";

type Tab = "ai" | "appearance" | "editor" | "data";

const PROVIDER_OPTIONS: { value: AIProvider; label: string }[] = [
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic" },
  { value: "deepseek", label: "DeepSeek" },
  { value: "custom", label: "自定义" },
];

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("ai");

  // AI settings state
  const [provider, setProvider] = useState<AIProvider>("openai");
  const [apiKey, setApiKey] = useState("");
  const [baseURL, setBaseURL] = useState("");
  const [model, setModel] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  // Appearance state
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [language, setLanguage] = useState("zh");

  // Editor state
  const [autoSave, setAutoSave] = useState(true);
  const [autoSaveInterval, setAutoSaveInterval] = useState(30);

  useEffect(() => {
    const settings = loadAISettings();
    setProvider(settings.provider);
    setApiKey(settings.apiKey);
    setBaseURL(settings.baseURL);
    setModel(settings.model);

    // Load other settings from localStorage
    if (typeof window !== "undefined") {
      setTheme((localStorage.getItem("theme") as "light" | "dark" | "system") || "system");
      setLanguage(localStorage.getItem("language") || "zh");
      setAutoSave(localStorage.getItem("autoSave") !== "false");
      setAutoSaveInterval(Number(localStorage.getItem("autoSaveInterval")) || 30);
    }
  }, []);

  // Watch system preference changes when theme is "system"
  useEffect(() => {
    if (theme !== "system") return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      document.documentElement.classList.toggle('dark', mql.matches);
    };
    mql.addEventListener('change', onChange);
    onChange();
    return () => mql.removeEventListener('change', onChange);
  }, [theme]);

  function handleProviderChange(newProvider: AIProvider) {
    setProvider(newProvider);
    const defaults = getDefaults(newProvider);
    setBaseURL(defaults.baseURL);
    setModel(defaults.model);
  }

  function handleSaveAI() {
    saveAISettings({ provider, apiKey, baseURL, model });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleSaveAppearance() {
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", theme);
      localStorage.setItem("language", language);
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else if (theme === "light") {
        document.documentElement.classList.remove("dark");
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.toggle('dark', prefersDark);
      }
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleSaveEditor() {
    if (typeof window !== "undefined") {
      localStorage.setItem("autoSave", String(autoSave));
      localStorage.setItem("autoSaveInterval", String(autoSaveInterval));
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const selectClass =
    "w-full border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-primary focus:outline-none";

  const tabs: { key: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "ai", label: "AI 配置", icon: Bot },
    { key: "appearance", label: "外观", icon: Palette },
    { key: "editor", label: "编辑器", icon: Settings },
    { key: "data", label: "数据", icon: Database },
  ];

  return (
    <div className="mx-auto max-w-3xl px-6 py-0">
      <div className="border-b-[3px] border-double border-border py-6">
        <p className="text-eyebrow mb-1">偏好设置</p>
        <h1 className="text-display text-foreground">设置</h1>
      </div>

      {/* Tabs */}
      <div className="flex divide-x divide-border border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className="h-4 w-4" />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* AI Tab */}
      {tab === "ai" && (
        <div className="space-y-5">
          <div>
            <Label className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">AI 提供商</Label>
            <select
              className={selectClass}
              value={provider}
              onChange={(e) => handleProviderChange(e.target.value as AIProvider)}
            >
              {PROVIDER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">API Key</Label>
            <div className="relative">
              <Input
                type={showKey ? "text" : "password"}
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <Button
                variant="ghost"
                size="icon-xs"
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-muted-foreground"
              >
                {showKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground/70">API Key 仅存储在本地浏览器中</p>
          </div>

          <div>
            <Label className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">Base URL</Label>
            <Input
              placeholder="https://api.openai.com/v1"
              value={baseURL}
              onChange={(e) => setBaseURL(e.target.value)}
            />
          </div>

          <div>
            <Label className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">模型</Label>
            <Input
              placeholder="gpt-4o"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button onClick={handleSaveAI}>
              保存设置
            </Button>
            {saved && (
              <span className="text-sm font-medium text-success">已保存</span>
            )}
          </div>
        </div>
      )}

      {/* Appearance Tab */}
      {tab === "appearance" && (
        <div className="space-y-5">
          <div>
            <Label className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">主题</Label>
            <div className="flex gap-2">
              {(["light", "dark", "system"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`flex-1 border px-4 py-3 text-sm font-medium transition-colors ${
                    theme === t
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {t === "light" ? "浅色" : t === "dark" ? "深色" : "跟随系统"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">界面语言</Label>
            <select className={selectClass} value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="zh">中文</option>
              <option value="en">English</option>
            </select>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button onClick={handleSaveAppearance}>
              保存设置
            </Button>
            {saved && (
              <span className="text-sm font-medium text-success">已保存</span>
            )}
          </div>
        </div>
      )}

      {/* Editor Tab */}
      {tab === "editor" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">自动保存</p>
              <p className="text-xs text-muted-foreground">编辑时自动保存简历内容</p>
            </div>
            <button
              onClick={() => setAutoSave(!autoSave)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                autoSave ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-primary-foreground shadow transition-transform ${
                  autoSave ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {autoSave && (
            <div>
              <Label className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">
                自动保存间隔：{autoSaveInterval} 秒
              </Label>
              <input
                type="range"
                min={10}
                max={120}
                step={5}
                value={autoSaveInterval}
                onChange={(e) => setAutoSaveInterval(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground/70 mt-1">
                <span>10秒</span>
                <span>120秒</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Button onClick={handleSaveEditor}>
              保存设置
            </Button>
            {saved && (
              <span className="text-sm font-medium text-success">已保存</span>
            )}
          </div>
        </div>
      )}

      {/* Data Tab */}
      {tab === "data" && (
        <div className="py-6">
          <DataBackup />
        </div>
      )}
    </div>
  );
}
