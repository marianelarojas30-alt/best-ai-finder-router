import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { AppConfig } from "./config.js";
import { discoverAnthropicModels } from "./discovery/anthropicDiscovery.js";
import { discoverBenchmarkSignals } from "./discovery/benchmarkDiscovery.js";
import { discoverGeminiModels } from "./discovery/geminiDiscovery.js";
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

export async function discoverModels(config: AppConfig, localOnly = false): Promise<DiscoveryResult> {
  const notices: string[] = [];
  const discovered: ModelInfo[] = [];

  const sources = localOnly
    ? ([["Ollama", () => discoverOllamaModels(config)]] as const)
    : ([
        ["OpenAI", () => discoverOpenAIModels(config)],
        ["Anthropic", () => discoverAnthropicModels(config)],
        ["Gemini", () => discoverGeminiModels(config)],
        ["OpenRouter", () => discoverOpenRouterModels(config)],
        ["Ollama", () => discoverOllamaModels(config)]
      ] as const);

  const discoveryResults = await Promise.all(
    sources.map(async ([name, discover]) => {
      try {
        const models = await discover();
        return { name, models, error: undefined as string | undefined };
      } catch (error) {
        return { name, models: [] as ModelInfo[], error: (error as Error).message };
      }
    })
  );

  for (const result of discoveryResults) {
    if (result.error) {
      notices.push(`${result.name}: ${result.error}`);
      continue;
    }
    if (result.models.length === 0) {
      notices.push(`${result.name}: no live models discovered; credentials or service may be absent.`);
    }
    discovered.push(...result.models);
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

  if (localOnly) {
    return {
      models: [],
      usedLiveDiscovery: false,
      usedCache: false,
      notices: [...notices, "Private mode does not fall back to static model cache when local Ollama discovery fails."]
    };
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
