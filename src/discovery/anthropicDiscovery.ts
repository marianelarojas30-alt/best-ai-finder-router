import { AppConfig } from "../config.js";
import { ModelInfo } from "../modelRegistry.js";
import { anthropicProvider } from "../providers/anthropic.js";

export async function discoverAnthropicModels(config: AppConfig): Promise<ModelInfo[]> {
  return anthropicProvider.discoverModels(config);
}
