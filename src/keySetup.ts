import { access, copyFile } from "node:fs/promises";

export interface ProviderKeyInfo {
  provider: string;
  envVar: string;
  keyPage: string;
  docsPage: string;
  notes: string[];
}

export const providerKeyInfo: ProviderKeyInfo[] = [
  {
    provider: "Anthropic / Claude",
    envVar: "ANTHROPIC_API_KEY",
    keyPage: "https://console.anthropic.com/settings/keys",
    docsPage: "https://docs.anthropic.com/en/api/overview",
    notes: ["Create the key in the Anthropic Console.", "Claude Code subscription limits are separate from Anthropic API keys."]
  },
  {
    provider: "OpenAI",
    envVar: "OPENAI_API_KEY",
    keyPage: "https://platform.openai.com/api-keys",
    docsPage: "https://platform.openai.com/docs/quickstart/authentication",
    notes: ["Create a secret key in the OpenAI platform.", "Set usage limits in your OpenAI billing settings."]
  },
  {
    provider: "OpenRouter",
    envVar: "OPENROUTER_API_KEY",
    keyPage: "https://openrouter.ai/settings/keys",
    docsPage: "https://openrouter.ai/docs/api-keys",
    notes: ["Create a key from OpenRouter settings.", "OpenRouter can route to multiple model providers through one API."]
  },
  {
    provider: "Ollama",
    envVar: "OLLAMA_BASE_URL",
    keyPage: "https://ollama.com/download",
    docsPage: "https://github.com/ollama/ollama/blob/main/docs/api.md",
    notes: ["No cloud API key is needed for local Ollama.", "Keep the base URL on localhost unless remote access is intentionally secured."]
  }
];

export async function ensureEnvFile(): Promise<"created" | "exists"> {
  try {
    await access(".env");
    return "exists";
  } catch {
    await copyFile(".env.example", ".env");
    return "created";
  }
}

export function formatKeySetupGuide(): string {
  return [
    "API Key Setup",
    "",
    "This tool cannot create provider API keys for you. You must create keys in the official provider dashboards, then paste them into your local .env file.",
    "",
    ...providerKeyInfo.flatMap((info) => [
      `${info.provider}`,
      `- Env var: ${info.envVar}`,
      `- Create/manage key: ${info.keyPage}`,
      `- Official docs: ${info.docsPage}`,
      ...info.notes.map((note) => `- ${note}`),
      ""
    ]),
    "After adding keys, run:",
    "npm run dev -- discover",
    "",
    "Never upload .env or paste real API keys into chat."
  ].join("\n");
}
