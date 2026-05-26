import { AppConfig } from "../config.js";
import { ModelInfo } from "../modelRegistry.js";

interface OllamaModel {
  name?: string;
  model?: string;
  details?: { parameter_size?: string };
}

export const ollamaProvider = {
  name: "ollama" as const,
  availability(config: AppConfig): "available" | "unavailable" {
    return config.OLLAMA_BASE_URL ? "available" : "unavailable";
  },
  async discoverModels(config: AppConfig): Promise<ModelInfo[]> {
    if (!config.OLLAMA_BASE_URL) return [];
    const response = await fetch(`${config.OLLAMA_BASE_URL.replace(/\/$/, "")}/api/tags`);
    if (!response.ok) throw new Error(`Ollama discovery failed: ${response.status}`);
    const payload = (await response.json()) as { models?: OllamaModel[] };
    return (payload.models ?? []).map(toOllamaModel);
  },
  async sendMessage(model: string, prompt: string, config: AppConfig): Promise<string> {
    if (!config.OLLAMA_BASE_URL) throw new Error("OLLAMA_BASE_URL is required.");
    const response = await fetch(`${config.OLLAMA_BASE_URL.replace(/\/$/, "")}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt, stream: false })
    });
    if (!response.ok) throw new Error(`Ollama request failed: ${response.status}`);
    const payload = (await response.json()) as { response?: string };
    return payload.response ?? JSON.stringify(payload);
  },
  supportsModel(): boolean {
    return true;
  },
  maxContextTokens(): undefined {
    return undefined;
  }
};

function toOllamaModel(model: OllamaModel): ModelInfo {
  const id = model.model ?? model.name ?? "unknown";
  const lower = id.toLowerCase();
  const large = /70b|72b|120b|405b/.test(lower);
  return {
    id,
    provider: "ollama",
    displayName: id,
    enabled: true,
    contextWindow: /llama3\.1|qwen|gemma3/i.test(id) ? 128000 : undefined,
    costTier: "low",
    speedTier: large ? "slow" : "fast",
    qualityTier: large ? "strong" : "basic",
    supportsVision: /llava|vision|gemma3/i.test(lower),
    supportsLongContext: /llama3\.1|qwen/i.test(lower),
    supportsCoding: /coder|qwen|deepseek|llama/i.test(lower),
    supportsReasoning: large || /reason|deepseek|qwen/i.test(lower),
    supportsMultilingual: /qwen|llama|mistral|gemma/i.test(lower),
    recommendedUseCases: ["private", "local", "budget"],
    discoveredFrom: "live",
    availability: "available"
  };
}
