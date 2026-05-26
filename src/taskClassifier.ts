export type TaskType =
  | "complex reasoning"
  | "coding"
  | "debugging"
  | "repo analysis"
  | "legal-style drafting"
  | "legal research support"
  | "translation"
  | "summarization"
  | "long-context document review"
  | "multimodal/image analysis"
  | "creative writing"
  | "general assistant task";

export interface ClassifiedTask {
  type: TaskType;
  confidence: number;
  requiresCoding: boolean;
  requiresReasoning: boolean;
  requiresLongContext: boolean;
  requiresVision: boolean;
  requiresMultilingual: boolean;
  qualityFloor: "basic" | "strong" | "frontier";
  notes: string[];
}

const patterns: Array<{ type: TaskType; terms: RegExp[] }> = [
  { type: "debugging", terms: [/fix\b/i, /error/i, /stack trace/i, /bug/i, /failing/i] },
  { type: "repo analysis", terms: [/repo/i, /codebase/i, /pull request/i, /review.*files/i] },
  { type: "coding", terms: [/typescript/i, /javascript/i, /python/i, /implement/i, /code/i, /test/i] },
  { type: "legal research support", terms: [/case law/i, /statute/i, /legal research/i, /citation/i] },
  { type: "legal-style drafting", terms: [/contract/i, /policy/i, /terms/i, /legal/i, /permit/i] },
  { type: "translation", terms: [/translate/i, /languages/i, /i18n/i, /locali[sz]e/i] },
  { type: "summarization", terms: [/summari[sz]e/i, /tl;dr/i, /brief/i] },
  { type: "long-context document review", terms: [/long document/i, /document review/i, /entire file/i, /all files/i] },
  { type: "multimodal/image analysis", terms: [/image/i, /screenshot/i, /photo/i, /vision/i] },
  { type: "creative writing", terms: [/story/i, /poem/i, /creative/i, /tone/i] },
  { type: "complex reasoning", terms: [/reason/i, /strategy/i, /compare/i, /rank/i, /plan/i] }
];

export function classifyTask(task: string): ClassifiedTask {
  const hits = patterns
    .map((pattern) => ({
      type: pattern.type,
      score: pattern.terms.filter((term) => term.test(task)).length
    }))
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score);

  const type = hits[0]?.type ?? "general assistant task";
  const requiresCoding = ["coding", "debugging", "repo analysis"].includes(type);
  const requiresReasoning = ["complex reasoning", "debugging", "repo analysis", "legal research support"].includes(type);
  const requiresLongContext = /long|entire|all files|repo|document|context/i.test(task) || type === "long-context document review";
  const requiresVision = type === "multimodal/image analysis";
  const requiresMultilingual = type === "translation" || /all supported languages|multilingual|i18n/i.test(task);
  const qualityFloor = requiresReasoning || requiresCoding ? "strong" : type === "general assistant task" ? "basic" : "strong";

  return {
    type,
    confidence: hits[0] ? Math.min(0.95, 0.45 + hits[0].score * 0.2) : 0.35,
    requiresCoding,
    requiresReasoning,
    requiresLongContext,
    requiresVision,
    requiresMultilingual,
    qualityFloor,
    notes: hits.slice(0, 3).map((hit) => `Matched ${hit.type}`)
  };
}
