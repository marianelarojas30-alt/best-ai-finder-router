import { ModelInfo, QualityTier, RoutingMode } from "./modelRegistry.js";
import { ClassifiedTask } from "./taskClassifier.js";

export interface RankedModel {
  model: ModelInfo;
  score: number;
  reasons: string[];
  tradeoffs: string[];
  breakdown: Record<string, number>;
}

const qualityValue: Record<QualityTier, number> = {
  unknown: 35,
  basic: 45,
  strong: 72,
  frontier: 95
};

const costValue = { unknown: 35, high: 25, medium: 62, low: 95 };
const speedValue = { unknown: 45, slow: 30, medium: 65, fast: 88 };

export function rankModels(models: ModelInfo[], task: ClassifiedTask, mode: RoutingMode): RankedModel[] {
  return models
    .filter((model) => model.enabled)
    .map((model) => scoreModel(model, task, mode))
    .filter((ranked) => passesMinimumQuality(ranked.model.qualityTier, task.qualityFloor) || mode === "private")
    .sort((a, b) => b.score - a.score);
}

function scoreModel(model: ModelInfo, task: ClassifiedTask, mode: RoutingMode): RankedModel {
  const reasons: string[] = [];
  const tradeoffs: string[] = [];
  const benchmark = model.benchmarkSignals ?? {};

  const taskFit = scoreTaskFit(model, task, reasons, tradeoffs);
  const intelligence = benchmark.intelligence ?? qualityValue[model.qualityTier];
  const reasoning = benchmark.reasoning ?? (model.supportsReasoning ? qualityValue[model.qualityTier] : 25);
  const coding = benchmark.coding ?? (model.supportsCoding ? qualityValue[model.qualityTier] : 25);
  const context = scoreContext(model, task, reasons, tradeoffs);
  const multimodal = task.requiresVision ? (model.supportsVision ? 90 : 5) : 55;
  const multilingual = task.requiresMultilingual ? (model.supportsMultilingual ? 88 : 20) : 55;
  const reliability = model.availability === "available" ? 82 : model.availability === "unknown" ? 55 : 10;
  const speed = benchmark.speed ?? speedValue[model.speedTier];
  const cost = benchmark.costEfficiency ?? costValue[model.costTier];
  const privacy = model.provider === "ollama" ? 100 : 35;

  const weights = weightsForMode(mode);
  const breakdown = {
    taskFit,
    intelligence,
    reasoning,
    coding,
    context,
    multimodal,
    multilingual,
    reliability,
    speed,
    cost,
    privacy
  };
  const score = Object.entries(breakdown).reduce((total, [key, value]) => total + value * weights[key], 0);

  if (model.provider === "ollama") reasons.push("Runs locally, which improves privacy.");
  if (mode === "private" && model.provider !== "ollama") tradeoffs.push("Not local; selected only if local options rank too low.");
  if (model.costTier === "high" && mode !== "best") tradeoffs.push("Higher cost tier than ideal for this mode.");
  if (task.requiresReasoning && !model.supportsReasoning) tradeoffs.push("Reasoning support is uncertain.");

  return { model, score: Math.round(score), reasons, tradeoffs, breakdown: roundBreakdown(breakdown) };
}

function scoreTaskFit(model: ModelInfo, task: ClassifiedTask, reasons: string[], tradeoffs: string[]): number {
  let score = 45;
  if (model.recommendedUseCases.includes(task.type)) {
    score += 30;
    reasons.push(`Recommended use cases include ${task.type}.`);
  }
  if (task.requiresCoding && model.supportsCoding) score += 15;
  if (task.requiresReasoning && model.supportsReasoning) score += 15;
  if (task.requiresMultilingual && model.supportsMultilingual) score += 12;
  if (task.requiresVision && model.supportsVision) score += 15;
  if (task.requiresCoding && !model.supportsCoding) tradeoffs.push("Coding capability is not advertised.");
  return Math.min(score, 100);
}

function scoreContext(model: ModelInfo, task: ClassifiedTask, reasons: string[], tradeoffs: string[]): number {
  const window = model.contextWindow ?? 0;
  if (task.requiresLongContext && window >= 128000) {
    reasons.push(`Large context window (${window.toLocaleString()} tokens).`);
    return 95;
  }
  if (task.requiresLongContext && window < 64000) {
    tradeoffs.push("Context window may be too small for the task.");
    return 25;
  }
  if (window >= 128000) return 80;
  if (window >= 32000) return 65;
  return 45;
}

function weightsForMode(mode: RoutingMode): Record<string, number> {
  if (mode === "best") {
    return { taskFit: 0.2, intelligence: 0.18, reasoning: 0.13, coding: 0.1, context: 0.1, multimodal: 0.06, multilingual: 0.05, reliability: 0.08, speed: 0.05, cost: 0.02, privacy: 0.03 };
  }
  if (mode === "budget") {
    return { taskFit: 0.16, intelligence: 0.1, reasoning: 0.08, coding: 0.08, context: 0.08, multimodal: 0.04, multilingual: 0.04, reliability: 0.08, speed: 0.08, cost: 0.23, privacy: 0.03 };
  }
  if (mode === "private") {
    return { taskFit: 0.14, intelligence: 0.09, reasoning: 0.08, coding: 0.07, context: 0.08, multimodal: 0.04, multilingual: 0.04, reliability: 0.07, speed: 0.07, cost: 0.07, privacy: 0.25 };
  }
  return { taskFit: 0.18, intelligence: 0.14, reasoning: 0.1, coding: 0.09, context: 0.09, multimodal: 0.05, multilingual: 0.05, reliability: 0.1, speed: 0.1, cost: 0.08, privacy: 0.02 };
}

function passesMinimumQuality(actual: QualityTier, floor: "basic" | "strong" | "frontier"): boolean {
  return qualityValue[actual] >= qualityValue[floor];
}

function roundBreakdown(breakdown: Record<string, number>): Record<string, number> {
  return Object.fromEntries(Object.entries(breakdown).map(([key, value]) => [key, Math.round(value)]));
}
