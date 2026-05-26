import { AppConfig } from "../config.js";
import { ModelInfo } from "../modelRegistry.js";
import { openrouterProvider } from "../providers/openrouter.js";

export async function discoverOpenRouterModels(config: AppConfig): Promise<ModelInfo[]> {
  return openrouterProvider.discoverModels(config);
}
