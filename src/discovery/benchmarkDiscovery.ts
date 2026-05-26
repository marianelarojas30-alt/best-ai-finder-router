import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { BenchmarkSignals } from "../modelRegistry.js";
import { readJsonCache } from "../utils/cache.js";

export interface BenchmarkCache {
  updatedAt: string;
  sourcePolicy: string;
  models: Record<string, BenchmarkSignals>;
}

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "../..");

export async function discoverBenchmarkSignals(): Promise<BenchmarkCache> {
  return readJsonCache<BenchmarkCache>(join(rootDir, "data/benchmark-cache.json"), {
    updatedAt: new Date(0).toISOString(),
    sourcePolicy: "No live benchmark fetch was performed. Manual cache fallback was used.",
    models: {}
  });
}
