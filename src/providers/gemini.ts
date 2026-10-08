import { AppConfig } from "../config.js";
import { ModelInfo } from "../modelRegistry.js";

interface GeminiModel {
  name?: string;
  displayName?: string;
  supportedGenerationMethods?: string[];
}

export const geminiProvider = {
  name: "gemini" as const,
  availability(config: AppConfig): "available" | "unavailable" {
    return config.GEMINI_API_KEY ? "available" : "unavailable";
  },
  async discoverModels(config: AppConfig): Promise<ModelInfo[]> {
    if (!config.GEMINI_API_KEY) return [];
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models", {
      headers: { "x-goog-api-key": config.GEMINI_API_KEY },
      signal: AbortSignal.timeout(8_000)
    });
    if (!response.ok) throw new Error(`Gemini discovery failed: ${response.status}`);
    const payload = (await response.json()) as { models?: GeminiModel[] };
    return (payload.models ?? [])
      .filter((model) => model.supportedGenerationMethods?.includes("generateContent"))
      .map(toGeminiModel);
  },
  async sendMessage(model: string, prompt: string, config: AppConfig): Promise<string> {
    if (!config.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is required.");
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "x-goog-api-key": config.GEMINI_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }]
        }),
        signal: AbortSignal.timeout(120_000)
      }
    );
    if (!response.ok) throw new Error(`Gemini request failed: ${response.status}`);
    const payload = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    return payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
  },
  supportsModel(model: string): boolean {
    return model.startsWith("gemini-");
  },
  maxContextTokens(model: string): number | undefined {
    return inferGeminiContext(model);
  }
};

function toGeminiModel(model: GeminiModel): ModelInfo {
  const id = (model.name ?? "").replace(/^models\//, "");
  const lower = id.toLowerCase();
  const lite = /lite/.test(lower);
  const frontier = /gemini-3\.8-flash|gemini-3\.5-flash$|gemini-3\.1-pro/.test(lower);
  return {
    id,
    provider: "gemini",
    displayName: model.displayName ?? id,
    enabled: Boolean(id),
    contextWindow: inferGeminiContext(id),
    costTier: lite ? "low" : "medium",
    speedTier: "fast",
    qualityTier: frontier ? "frontier" : "strong",
    supportsVision: true,
    supportsLongContext: true,
    supportsCoding: true,
    supportsReasoning: true,
    supportsMultilingual: true,
    recommendedUseCases: ["coding", "long-context", "multimodal/image analysis", "general assistant task"],
    discoveredFrom: "live",
    availability: "available"
  };
}

function inferGeminiContext(model: string): number | undefined {
  const lower = model.toLowerCase();
  if (/gemini-3\.(8|7|6|5|1)|gemini-3/.test(lower)) return 1000000;
  return undefined;
}
