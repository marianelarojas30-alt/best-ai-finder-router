import { AppConfig } from "../config.js";
import { ModelInfo } from "../modelRegistry.js";

interface OpenRouterModel {
  id: string;
  name?: string;
  context_length?: number;
  pricing?: { prompt?: string; completion?: string };
  architecture?: { modality?: string; input_modalities?: string[] };
}

export const openrouterProvider = {
  name: "openrouter" as const,
  availability(config: AppConfig): "available" | "unavailable" {
    return config.OPENROUTER_API_KEY ? "available" : "unavailable";
  },
  async discoverModels(config: AppConfig): Promise<ModelInfo[]> {
    if (!config.OPENROUTER_API_KEY) return [];
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      headers: { Authorization: `Bearer ${config.OPENROUTER_API_KEY}` }
    });
    if (!response.ok) throw new Error(`OpenRouter discovery failed: ${response.status}`);
    const payload = (await response.json()) as { data?: OpenRouterModel[] };
    return (payload.data ?? []).map(toOpenRouterModel);
  },
  async sendMessage(model: string, prompt: string, config: AppConfig): Promise<string> {
    if (!config.OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY is required.");
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }] })
    });
    if (!response.ok) throw new Error(`OpenRouter request failed: ${response.status}`);
    const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    return payload.choices?.[0]?.message?.content ?? JSON.stringify(payload);
  },
  supportsModel(): boolean {
    return true;
  },
  maxContextTokens(): undefined {
    return undefined;
  }
};

function toOpenRouterModel(model: OpenRouterModel): ModelInfo {
  const price = Number(model.pricing?.prompt ?? "0");
  const lowCost = price > 0 && price < 0.000001;
  const vision = model.architecture?.input_modalities?.includes("image") || /image/i.test(model.architecture?.modality ?? "");
  return {
    id: model.id,
    provider: "openrouter",
    displayName: model.name ?? model.id,
    enabled: true,
    contextWindow: model.context_length,
    costTier: lowCost ? "low" : price > 0.00001 ? "high" : "medium",
    speedTier: "unknown",
    qualityTier: /opus|gpt-5|sonnet|gemini.*pro|deepseek/i.test(model.id) ? "frontier" : "strong",
    supportsVision: vision,
    supportsLongContext: (model.context_length ?? 0) >= 128000,
    supportsCoding: /code|coder|gpt|claude|deepseek|qwen/i.test(model.id),
    supportsReasoning: /reason|thinking|o3|o4|gpt-5|claude|deepseek/i.test(model.id),
    supportsMultilingual: true,
    recommendedUseCases: ["general assistant task", "model comparison"],
    discoveredFrom: "live",
    availability: "available"
  };
}
