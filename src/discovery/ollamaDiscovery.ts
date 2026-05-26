import { AppConfig } from "../config.js";
import { ModelInfo } from "../modelRegistry.js";
import { ollamaProvider } from "../providers/ollama.js";

export async function discoverOllamaModels(config: AppConfig): Promise<ModelInfo[]> {
  return ollamaProvider.discoverModels(config);
}
