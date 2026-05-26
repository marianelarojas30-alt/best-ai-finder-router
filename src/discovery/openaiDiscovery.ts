import { AppConfig } from "../config.js";
import { ModelInfo } from "../modelRegistry.js";
import { openaiProvider } from "../providers/openai.js";

export async function discoverOpenAIModels(config: AppConfig): Promise<ModelInfo[]> {
  return openaiProvider.discoverModels(config);
}
