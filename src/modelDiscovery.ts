import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { AppConfig } from "./config.js";
import { discoverAnthropicModels } from "./discovery/anthropicDiscovery.js";
import { discoverBenchmarkSignals } from "./discovery/benchmarkDiscovery.js";
import { discoverOllamaModels } from "./discovery/ollamaDiscovery.js";
import { discoverOpenAIModels } from "./discovery/openaiDiscovery.js";
import { discoverOpenRouterModels } from "./discovery/openrouterDiscovery.js";
import { fallbackModels, mergeModels, ModelInfo } from "./modelRegistry.js";
import { readJsonCache } from "./utils/cache.js";

export interface DiscoveryResult {
  models: ModelInfo[];
  usedLiveDiscovery: boolean;
  usedCache: boolean;
  notices: string[];
}

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");

export async function discoverModels(config: AppConfig): Promise<DiscoveryResult> {
  const notices: string[] = [];
  const discovered: ModelInfo[] = [];

  const sources = [
    ["OpenAI", () => discoverOpenAIModels(config)],
    ["Anthropic", () => discoverAnthropicModels(config)],
    ["OpenRouter", () => discoverOpenRouterModels(config)],
    ["Ollama", () => discoverOllamaModels(config)]
  ] as const;

  for (const [name, discover] of sources) {
    try {
      const models = await discover();
      if (models.length === 0) notices.push(`${name}: no live models discovered; credentials or service may be absent.`);
      discovered.push(...models);
    } catch (error) {
      notices.push(`${name}: ${(error as Error).message}`);
    }
  }

  const benchmarks = await discoverBenchmarkSignals();
  const liveModels = mergeModels(
    discovered.map((model) => ({
      ...model,
      benchmarkSignals: benchmarks.models[model.id] ?? model.benchmarkSignals
    }))
  );

  if (liveModels.length > 0) {
    return { models: liveModels, usedLiveDiscovery: true, usedCache: false, notices };
  }

  const cachedModels = await readJsonCache<ModelInfo[]>(join(rootDir, "data/model-cache.json"), fallbackModels);
  const mergedCache = mergeModels(
    cachedModels.map((model) => ({
      ...model,
      discoveredFrom: "cache",
      availability: "unknown",
      benchmarkSignals: benchmarks.models[model.id] ?? model.benchmarkSignals
    }))
  );
  return {
    models: mergedCache,
    usedLiveDiscovery: false,
    usedCache: true,
    notices: [...notices, "Using data/model-cache.json fallback."]
  };
}
