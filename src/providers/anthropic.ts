import { AppConfig } from "../config.js";
import { ModelInfo } from "../modelRegistry.js";

interface AnthropicModel {
  id: string;
  display_name?: string;
}

export const anthropicProvider = {
  name: "anthropic" as const,
  availability(config: AppConfig): "available" | "unavailable" {
    return config.ANTHROPIC_API_KEY ? "available" : "unavailable";
  },
  async discoverModels(config: AppConfig): Promise<ModelInfo[]> {
    if (!config.ANTHROPIC_API_KEY) return [];
    const response = await fetch("https://api.anthropic.com/v1/models", {
      headers: {
        "x-api-key": config.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      }
    });
    if (!response.ok) throw new Error(`Anthropic discovery failed: ${response.status}`);
    const payload = (await response.json()) as { data?: AnthropicModel[] };
    return (payload.data ?? []).map((model) => toAnthropicModel(model));
  },
  async sendMessage(model: string, prompt: string, config: AppConfig): Promise<string> {
    if (!config.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is required.");
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": config.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        max_tokens: 2048,
        messages: [{ role: "user", content: prompt }]
      })
    });
    if (!response.ok) throw new Error(`Anthropic request failed: ${response.status}`);
    const payload = (await response.json()) as { content?: Array<{ text?: string }> };
    return payload.content?.map((part) => part.text ?? "").join("") ?? JSON.stringify(payload);
  },
  supportsModel(model: string): boolean {
    return model.includes("claude");
  },
  maxContextTokens(): number {
    return 200000;
  }
};

function toAnthropicModel(model: AnthropicModel): ModelInfo {
  const lower = model.id.toLowerCase();
  const frontier = /opus|sonnet-4|4-5|4\.5/.test(lower);
  const fast = /haiku/.test(lower);
  return {
    id: model.id,
    provider: "anthropic",
    displayName: model.display_name ?? model.id,
    enabled: true,
    contextWindow: 200000,
    costTier: /opus/.test(lower) ? "high" : /haiku/.test(lower) ? "low" : "medium",
    speedTier: fast ? "fast" : "medium",
    qualityTier: frontier ? "frontier" : "strong",
    supportsVision: true,
    supportsLongContext: true,
    supportsCoding: true,
    supportsReasoning: true,
    supportsMultilingual: true,
    recommendedUseCases: ["coding", "complex reasoning", "long-context document review"],
    discoveredFrom: "live",
    availability: "available"
  };
}
