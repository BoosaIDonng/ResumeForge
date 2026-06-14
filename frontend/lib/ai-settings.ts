export type AIProvider = "openai" | "anthropic" | "deepseek" | "custom";

export type AISettings = {
  provider: AIProvider;
  apiKey: string;
  baseURL: string;
  model: string;
};

const STORAGE_KEY = "ai-settings";

const DEFAULTS: Record<AIProvider, { baseURL: string; model: string }> = {
  openai: { baseURL: "https://api.openai.com/v1", model: "gpt-4o" },
  anthropic: { baseURL: "https://api.anthropic.com", model: "claude-sonnet-4-20250514" },
  deepseek: { baseURL: "https://api.deepseek.com/v1", model: "deepseek-chat" },
  custom: { baseURL: "", model: "" },
};

export function loadAISettings(): AISettings {
  if (typeof window === "undefined") {
    return { provider: "openai", apiKey: "", ...DEFAULTS.openai };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as AISettings;
    }
  } catch {
    // ignore parse errors
  }
  return { provider: "openai", apiKey: "", ...DEFAULTS.openai };
}

export function saveAISettings(settings: AISettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function getDefaults(provider: AIProvider): { baseURL: string; model: string } {
  return DEFAULTS[provider];
}

export function getAIHeaders(): Record<string, string> {
  const settings = loadAISettings();
  return {
    "x-provider": settings.provider,
    "x-api-key": settings.apiKey,
    "x-base-url": settings.baseURL,
    "x-model": settings.model,
  };
}
