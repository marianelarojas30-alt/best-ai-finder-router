import { ClassifiedTask } from "./taskClassifier.js";

export interface QualityGateResult {
  passed: boolean;
  failures: string[];
  shouldEscalate: boolean;
}

const forbiddenBypassPatterns = [
  /reset.*(claude|openai|anthropic|token|limit)/i,
  /bypass.*(billing|rate limit|usage limit)/i,
  /rotate.*(account|api key)/i,
  /spoof.*identity/i,
  /evade.*(limit|billing|rate)/i
];

export function evaluateQualityGate(output: string, task: ClassifiedTask, requestedFormat?: string): QualityGateResult {
  const failures: string[] = [];
  if (output.trim().length < 20) failures.push("Answer appears too short to complete the task.");
  if (forbiddenBypassPatterns.some((pattern) => pattern.test(output))) failures.push("Answer includes forbidden bypass language.");
  if (/\/fake\/path|\/path\/to\/|C:\\path\\to/i.test(output)) failures.push("Answer appears to hallucinate placeholder file paths.");
  if (/ignore (the )?(rules|instructions)/i.test(output)) failures.push("Answer appears to ignore project rules.");
  if (requestedFormat && !output.toLowerCase().includes(requestedFormat.toLowerCase())) {
    failures.push(`Answer may not complete requested format: ${requestedFormat}.`);
  }
  if (task.requiresCoding && !/(npm|pnpm|yarn|pytest|go test|cargo test|tsc|typecheck)/i.test(output)) {
    failures.push("Coding answer should tell the user what command to run for validation.");
  }
  if (task.requiresMultilingual && !/(English|Espa[ñn]ol|中文|한국어|Français|Português|العربية)/i.test(output)) {
    failures.push("Translation answer may not preserve required languages.");
  }

  return {
    passed: failures.length === 0,
    failures,
    shouldEscalate: failures.length > 0
  };
}
