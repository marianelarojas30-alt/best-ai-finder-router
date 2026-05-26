import { readFile } from "node:fs/promises";
import { z } from "zod";

const contextSchema = z.object({
  projectName: z.string().default("Unknown project"),
  userGoal: z.string().default("Not specified"),
  currentTask: z.string().default("Not specified"),
  activeFiles: z.array(z.string()).default([]),
  importantRules: z.array(z.string()).default([]),
  requiredLanguages: z.array(z.string()).default([]),
  knownErrors: z.array(z.string()).default([]),
  decisionsAlreadyMade: z.array(z.string()).default([]),
  nextSteps: z.array(z.string()).default([]),
  validationCommand: z.string().optional()
});

export type ContextInput = z.infer<typeof contextSchema>;

export async function compressContextFile(path: string): Promise<string> {
  const raw = await readFile(path, "utf8");
  const parsed = contextSchema.parse(JSON.parse(raw));
  return compressContext(parsed);
}

export function compressContext(input: ContextInput): string {
  return [
    `# Handoff: ${input.projectName}`,
    "",
    `## User Goal`,
    input.userGoal,
    "",
    `## Current Task`,
    input.currentTask,
    "",
    `## Active Files`,
    bulletList(input.activeFiles),
    "",
    `## Important Rules`,
    bulletList(input.importantRules),
    "",
    `## Required Languages`,
    bulletList(input.requiredLanguages),
    "",
    `## Known Errors`,
    bulletList(input.knownErrors),
    "",
    `## Decisions Already Made`,
    bulletList(input.decisionsAlreadyMade),
    "",
    `## Next Steps`,
    bulletList(input.nextSteps),
    "",
    `## Validation`,
    input.validationCommand ?? "Not specified",
    "",
    "_Irrelevant history removed._"
  ].join("\n");
}

function bulletList(items: string[]): string {
  return items.length > 0 ? items.map((item) => `- ${item}`).join("\n") : "- None recorded";
}
