import { AppConfig } from "../config.js";
import { ModelInfo } from "../modelRegistry.js";

interface OpenAIModel {
  id: string;
  object?: string;
}

export const openaiProvider = {
  name: "openai" as const,
  availability(config: AppConfig): "available" | "unavailable" {
    return config.OPENAI_API_KEY ? "available" : "unavailable";
  },
  async discoverModels(config: AppConfig): Promise<ModelInfo[]> {
    if (!config.OPENAI_API_KEY) return [];
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: `Bearer ${config.OPENAI_API_KEY}` }
    });
    if (!response.ok) throw new Error(`OpenAI discovery failed: ${response.status}`);
    const payload = (await response.json()) as { data?: OpenAIModel[] };
    return (payload.data ?? []).map((model) => toOpenAIModel(model.id));
  },
  async sendMessage(model: string, prompt: string, config: AppConfig): Promise<string> {
    if (!config.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is required.");
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ model, input: prompt })
    });
    if (!response.ok) throw new Error(`OpenAI request failed: ${response.status}`);
    const payload = (await response.json()) as { output_text?: string };
    return payload.output_text ?? JSON.stringify(payload);
  },
  supportsModel(model: string): boolean {
    return /^gpt-|^o\d|^chatgpt/i.test(model);
  },
  maxContextTokens(model: string): number | undefined {
    return inferOpenAIContext(model);
  }
};

function toOpenAIModel(id: string): ModelInfo {
  const lower = id.toLowerCase();
  const frontier = /gpt-5|gpt-4\.1|o3|o4/.test(lower);
  const budget = /mini|nano/.test(lower);
  return {
    id,
    provider: "openai",
    displayName: id,
    enabled: true,
    contextWindow: inferOpenAIContext(id),
    costTier: budget ? "low" : frontier ? "high" : "medium",
    speedTier: budget ? "fast" : "medium",
    qualityTier: frontier ? "frontier" : budget ? "strong" : "unknown",
    supportsVision: /gpt-4|gpt-5|omni|vision/i.test(id),
    supportsLongContext: (inferOpenAIContext(id) ?? 0) >= 128000,
    supportsCoding: /gpt|o\d/i.test(id),
    supportsReasoning: /gpt-5|o\d|reason/i.test(id),
    supportsMultilingual: /gpt|o\d/i.test(id),
    recommendedUseCases: ["general assistant task", "coding", "complex reasoning"],
    discoveredFrom: "live",
    availability: "available"
  };
}

function inferOpenAIContext(model: string): number | undefined {
  const lower = model.toLowerCase();
  if (lower.includes("gpt-5")) return 400000;
  if (lower.includes("gpt-4.1")) return 1000000;
  if (lower.includes("o3") || lower.includes("o4")) return 200000;
  if (lower.includes("gpt-4o")) return 128000;
  return undefined;
}
