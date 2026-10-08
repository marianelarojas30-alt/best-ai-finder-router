import { AppConfig } from "../config.js";
import { ModelInfo } from "../modelRegistry.js";
import { geminiProvider } from "../providers/gemini.js";

export async function discoverGeminiModels(config: AppConfig): Promise<ModelInfo[]> {
  return geminiProvider.discoverModels(config);
}
