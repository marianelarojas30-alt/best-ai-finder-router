export type ProviderName = "openai" | "anthropic" | "openrouter" | "ollama";
export type CostTier = "low" | "medium" | "high" | "unknown";
export type SpeedTier = "slow" | "medium" | "fast" | "unknown";
export type QualityTier = "basic" | "strong" | "frontier" | "unknown";
export type RoutingMode = "best" | "balanced" | "budget" | "private";

export interface BenchmarkSignals {
  reasoning?: number;
  coding?: number;
  intelligence?: number;
  speed?: number;
  costEfficiency?: number;
}

export interface ModelInfo {
  id: string;
  provider: ProviderName;
  displayName: string;
  enabled: boolean;
  contextWindow?: number;
  costTier: CostTier;
  speedTier: SpeedTier;
  qualityTier: QualityTier;
  supportsVision?: boolean;
  supportsLongContext?: boolean;
  supportsCoding?: boolean;
  supportsReasoning?: boolean;
  supportsMultilingual?: boolean;
  recommendedUseCases: string[];
  benchmarkSignals?: BenchmarkSignals;
  discoveredFrom?: "live" | "cache";
  availability?: "available" | "unavailable" | "unknown";
}

export const fallbackModels: ModelInfo[] = [
  {
    id: "gpt-5",
    provider: "openai",
    displayName: "GPT-5",
    enabled: true,
    contextWindow: 400000,
    costTier: "high",
    speedTier: "medium",
    qualityTier: "frontier",
    supportsVision: true,
    supportsLongContext: true,
    supportsCoding: true,
    supportsReasoning: true,
    supportsMultilingual: true,
    recommendedUseCases: ["complex reasoning", "coding", "repo analysis", "multimodal/image analysis"]
  },
  {
    id: "claude-opus-4-1",
    provider: "anthropic",
    displayName: "Claude Opus 4.1",
    enabled: true,
    contextWindow: 200000,
    costTier: "high",
    speedTier: "medium",
    qualityTier: "frontier",
    supportsVision: true,
    supportsLongContext: true,
    supportsCoding: true,
    supportsReasoning: true,
    supportsMultilingual: true,
    recommendedUseCases: ["complex reasoning", "coding", "legal-style drafting", "long-context document review"]
  },
  {
    id: "claude-sonnet-4-5",
    provider: "anthropic",
    displayName: "Claude Sonnet 4.5",
    enabled: true,
    contextWindow: 200000,
    costTier: "medium",
    speedTier: "fast",
    qualityTier: "frontier",
    supportsVision: true,
    supportsLongContext: true,
    supportsCoding: true,
    supportsReasoning: true,
    supportsMultilingual: true,
    recommendedUseCases: ["coding", "debugging", "repo analysis", "balanced assistant task"]
  },
  {
    id: "openrouter/auto",
    provider: "openrouter",
    displayName: "OpenRouter Auto",
    enabled: true,
    contextWindow: 128000,
    costTier: "medium",
    speedTier: "medium",
    qualityTier: "strong",
    supportsVision: true,
    supportsLongContext: true,
    supportsCoding: true,
    supportsReasoning: true,
    supportsMultilingual: true,
    recommendedUseCases: ["general assistant task", "routing fallback", "translation"]
  },
  {
    id: "llama3.1:8b",
    provider: "ollama",
    displayName: "Llama 3.1 8B",
    enabled: true,
    contextWindow: 128000,
    costTier: "low",
    speedTier: "fast",
    qualityTier: "basic",
    supportsLongContext: true,
    supportsCoding: true,
    supportsReasoning: true,
    supportsMultilingual: true,
    recommendedUseCases: ["private summarization", "budget drafting", "general assistant task"]
  }
];

export function mergeModels(models: ModelInfo[]): ModelInfo[] {
  const byKey = new Map<string, ModelInfo>();
  for (const model of models) {
    byKey.set(`${model.provider}:${model.id}`, model);
  }
  return [...byKey.values()].filter((model) => model.enabled);
}
