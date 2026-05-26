import dotenv from "dotenv";
import { z } from "zod";
import { RoutingMode } from "./modelRegistry.js";

dotenv.config({ quiet: true });

const configSchema = z.object({
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  OLLAMA_BASE_URL: z.string().url().optional(),
  DEFAULT_MODE: z.enum(["best", "balanced", "budget", "private"]).default("best"),
  BENCHMARK_CACHE_TTL_HOURS: z.coerce.number().positive().default(24)
});

export type AppConfig = z.infer<typeof configSchema>;

export function loadConfig(): AppConfig {
  return configSchema.parse(process.env);
}

export function parseMode(mode: string | undefined, config: AppConfig): RoutingMode {
  return configSchema.shape.DEFAULT_MODE.parse(mode ?? config.DEFAULT_MODE);
}
