export type ProviderName = "openai" | "anthropic" | "gemini" | "openrouter" | "ollama";
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
    id: "gpt-6-astra",
    provider: "openai",
    displayName: "GPT-6 Astra",
    enabled: true,
    contextWindow: 1050000,
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
    id: "gpt-6-sol",
    provider: "openai",
    displayName: "GPT-6 Sol",
    enabled: true,
    contextWindow: 1050000,
    costTier: "medium",
    speedTier: "medium",
    qualityTier: "frontier",
    supportsVision: true,
    supportsLongContext: true,
    supportsCoding: true,
    supportsReasoning: true,
    supportsMultilingual: true,
    recommendedUseCases: ["coding", "agentic workflows", "complex reasoning", "balanced assistant task"]
  },
  {
    id: "gpt-6-luna",
    provider: "openai",
    displayName: "GPT-6 Luna",
    enabled: true,
    contextWindow: 1050000,
    costTier: "low",
    speedTier: "fast",
    qualityTier: "strong",
    supportsVision: true,
    supportsLongContext: true,
    supportsCoding: true,
    supportsReasoning: true,
    supportsMultilingual: true,
    recommendedUseCases: ["budget", "high-volume", "general assistant task", "translation"]
  },
  {
    id: "claude-fable-5",
    provider: "anthropic",
    displayName: "Claude Fable 5",
    enabled: true,
    contextWindow: 1000000,
    costTier: "high",
    speedTier: "medium",
    qualityTier: "frontier",
    supportsVision: true,
    supportsLongContext: true,
    supportsCoding: true,
    supportsReasoning: true,
    supportsMultilingual: true,
    recommendedUseCases: ["long-horizon agents", "complex reasoning", "coding", "long-context document review"]
  },
  {
    id: "claude-opus-5",
    provider: "anthropic",
    displayName: "Claude Opus 5",
    enabled: true,
    contextWindow: 1000000,
    costTier: "high",
    speedTier: "medium",
    qualityTier: "frontier",
    supportsVision: true,
    supportsLongContext: true,
    supportsCoding: true,
    supportsReasoning: true,
    supportsMultilingual: true,
    recommendedUseCases: ["complex analysis", "coding", "creative work", "deep reasoning"]
  },
  {
    id: "claude-sonnet-5",
    provider: "anthropic",
    displayName: "Claude Sonnet 5",
    enabled: true,
    contextWindow: 1000000,
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
    id: "claude-haiku-4-5-20251001",
    provider: "anthropic",
    displayName: "Claude Haiku 4.5",
    enabled: true,
    contextWindow: 200000,
    costTier: "low",
    speedTier: "fast",
    qualityTier: "strong",
    supportsVision: true,
    supportsLongContext: true,
    supportsCoding: true,
    supportsReasoning: true,
    supportsMultilingual: true,
    recommendedUseCases: ["budget", "fast classification", "summarization", "general assistant task"]
  },
  {
    id: "gemini-3.8-flash",
    provider: "gemini",
    displayName: "Gemini 3.8 Flash",
    enabled: true,
    contextWindow: 1000000,
    costTier: "medium",
    speedTier: "fast",
    qualityTier: "frontier",
    supportsVision: true,
    supportsLongContext: true,
    supportsCoding: true,
    supportsReasoning: true,
    supportsMultilingual: true,
    recommendedUseCases: ["coding", "agentic workflows", "long-context", "multimodal/image analysis"]
  },
  {
    id: "gemini-3.5-flash-lite",
    provider: "gemini",
    displayName: "Gemini 3.5 Flash-Lite",
    enabled: true,
    contextWindow: 1000000,
    costTier: "low",
    speedTier: "fast",
    qualityTier: "strong",
    supportsVision: true,
    supportsLongContext: true,
    supportsCoding: true,
    supportsReasoning: true,
    supportsMultilingual: true,
    recommendedUseCases: ["budget", "high-volume", "translation", "general assistant task"]
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
    id: "qwen3.5:4b",
    provider: "ollama",
    displayName: "Qwen 3.5 4B",
    enabled: true,
    contextWindow: 256000,
    costTier: "low",
    speedTier: "fast",
    qualityTier: "basic",
    supportsVision: true,
    supportsLongContext: true,
    supportsCoding: true,
    supportsReasoning: true,
    supportsMultilingual: true,
    recommendedUseCases: ["private summarization", "budget drafting", "coding", "general assistant task"]
  }
];

export function mergeModels(models: ModelInfo[]): ModelInfo[] {
  const byKey = new Map<string, ModelInfo>();
  for (const model of models) {
    byKey.set(`${model.provider}:${model.id}`, model);
  }
  return [...byKey.values()].filter((model) => model.enabled);
}
