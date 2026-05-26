import { AppConfig } from "./config.js";
import { discoverModels } from "./modelDiscovery.js";
import { RankedModel, rankModels } from "./modelRanker.js";
import { RoutingMode } from "./modelRegistry.js";
import { classifyTask, ClassifiedTask } from "./taskClassifier.js";

export interface RouteDecision {
  task: ClassifiedTask;
  selected: RankedModel;
  runnersUp: RankedModel[];
  usedLiveDiscovery: boolean;
  usedCache: boolean;
  notices: string[];
  warning?: string;
}

export async function routeTask(prompt: string, mode: RoutingMode, config: AppConfig): Promise<RouteDecision> {
  const task = classifyTask(prompt);
  const discovery = await discoverModels(config);
  const ranked = rankModels(discovery.models, task, mode);
  if (!ranked[0]) throw new Error("No enabled models passed the minimum quality gate.");

  const warning =
    mode === "private" && ranked[0].model.provider !== "ollama"
      ? "Private mode requested local models, but no local model ranked strongly enough. Review before sending sensitive data."
      : mode === "private" && task.qualityFloor !== "basic" && ranked[0].model.qualityTier === "basic"
        ? "Private mode selected a basic local model for a complex task. Consider rerouting to a stronger model if quality matters."
        : undefined;

  return {
    task,
    selected: ranked[0],
    runnersUp: ranked.slice(1, 4),
    usedLiveDiscovery: discovery.usedLiveDiscovery,
    usedCache: discovery.usedCache,
    notices: discovery.notices,
    warning
  };
}

export function formatDecision(decision: RouteDecision): string {
  const selected = decision.selected;
  const lines = [
    `Selected model: ${selected.model.displayName} (${selected.model.provider}/${selected.model.id})`,
    `Score: ${selected.score}`,
    `Task type: ${decision.task.type} (confidence ${Math.round(decision.task.confidence * 100)}%)`,
    `Discovery: ${decision.usedLiveDiscovery ? "live discovery" : "cache fallback"}`,
    "",
    "Why selected:",
    ...asBullets(selected.reasons.length ? selected.reasons : ["Highest weighted score for this task and mode."]),
    "",
    "Runner-up models:",
    ...asBullets(decision.runnersUp.map((ranked) => `${ranked.model.displayName} (${ranked.model.provider}) - score ${ranked.score}`)),
    "",
    "Tradeoffs:",
    ...asBullets(selected.tradeoffs.length ? selected.tradeoffs : ["No major tradeoffs detected from available metadata."])
  ];
  if (decision.warning) lines.push("", `Warning: ${decision.warning}`);
  if (decision.notices.length > 0) lines.push("", "Discovery notices:", ...asBullets(decision.notices));
  return lines.join("\n");
}

function asBullets(items: string[]): string[] {
  return items.map((item) => `- ${item}`);
}
