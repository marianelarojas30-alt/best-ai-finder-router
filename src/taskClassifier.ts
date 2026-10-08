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

// Terms match whole words (with simple plural/verb endings), so "explanation" is not
// "plan", "latest" is not "test", and "prefix" is not "fix".
const word = (stem: string): RegExp => new RegExp(`\\b${stem}(?:s|es|ed|ing)?\\b`, "i");

const patterns: Array<{ type: TaskType; terms: RegExp[] }> = [
  { type: "debugging", terms: [word("fix"), word("error"), /\bstack traces?\b/i, word("bug"), word("failing")] },
  { type: "repo analysis", terms: [word("repo"), word("codebase"), /\bpull requests?\b/i, /\breview\b.*\bfiles\b/i] },
  { type: "coding", terms: [word("typescript"), word("javascript"), word("python"), word("implement"), word("code"), word("test")] },
  { type: "legal research support", terms: [/\bcase law\b/i, word("statute"), /\blegal research\b/i, word("citation")] },
  { type: "legal-style drafting", terms: [word("contract"), /\bpolic(?:y|ies)\b/i, word("terms"), word("legal"), word("permit")] },
  { type: "translation", terms: [word("translate"), word("language"), word("i18n"), /\blocali[sz](?:e|es|ed|ing|ation)\b/i] },
  { type: "summarization", terms: [/\bsummari[sz](?:e|es|ed|ing|ation)\b/i, /\btl;dr\b/i, word("brief")] },
  { type: "long-context document review", terms: [/\blong documents?\b/i, /\bdocument review\b/i, /\bentire file\b/i, /\ball files\b/i] },
  { type: "multimodal/image analysis", terms: [word("image"), word("screenshot"), word("photo"), word("vision")] },
  { type: "creative writing", terms: [word("story"), /\bstories\b/i, word("poem"), word("creative"), word("tone")] },
  { type: "complex reasoning", terms: [word("reason"), /\bstrateg(?:y|ies|ic)\b/i, word("compare"), word("rank"), word("plan")] }
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
