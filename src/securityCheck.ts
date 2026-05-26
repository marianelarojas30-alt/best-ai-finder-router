import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";

const root = process.cwd();
const ignoredDirs = new Set([".git", "node_modules", "dist", ".npm-cache"]);
const ignoredFiles = new Set(["package-lock.json"]);

const secretPatterns = [
  { name: "OpenAI-style API key", pattern: /sk-[A-Za-z0-9_-]{20,}/g },
  { name: "Anthropic-style API key", pattern: /sk-ant-[A-Za-z0-9_-]{20,}/g },
  { name: "Generic bearer token", pattern: /Bearer\s+[A-Za-z0-9._-]{24,}/g },
  { name: "GitHub token", pattern: /gh[pousr]_[A-Za-z0-9_]{20,}/g }
];

const envRiskPatterns = [
  {
    name: "Public Ollama URL",
    pattern: /OLLAMA_BASE_URL\s*=\s*https?:\/\/(?!localhost|127\.0\.0\.1|\[?::1\]?)/i,
    message: "Keep OLLAMA_BASE_URL on localhost unless you intentionally secured remote access."
  }
];

export interface Finding {
  file: string;
  issue: string;
  detail: string;
}

export interface SecurityCheckResult {
  findings: Finding[];
}

export async function runSecurityCheck(): Promise<SecurityCheckResult> {
  const files = await listFiles(root);
  const findings: Finding[] = [];

  for (const file of files) {
    const rel = relative(root, file);
    if (ignoredFiles.has(rel)) continue;
    const content = await readFile(file, "utf8");

    for (const secret of secretPatterns) {
      if (secret.pattern.test(content)) {
        findings.push({
          file: rel,
          issue: secret.name,
          detail: "Possible secret found. Move real credentials to .env and rotate exposed keys."
        });
      }
      secret.pattern.lastIndex = 0;
    }

    if (rel.endsWith(".env") || rel.endsWith(".env.example")) {
      for (const risk of envRiskPatterns) {
        if (risk.pattern.test(content)) {
          findings.push({ file: rel, issue: risk.name, detail: risk.message });
        }
        risk.pattern.lastIndex = 0;
      }
    }
  }

  return { findings };
}

async function main(): Promise<void> {
  const result = await runSecurityCheck();
  if (result.findings.length > 0) {
    console.error("Security check failed:");
    for (const finding of result.findings) {
      console.error(`- ${finding.file}: ${finding.issue}. ${finding.detail}`);
    }
    process.exitCode = 1;
    return;
  }
  console.log("Security check passed: no obvious secrets or unsafe local model URLs found.");
}

async function listFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir);
  const files: string[] = [];
  for (const entry of entries) {
    if (ignoredDirs.has(entry)) continue;
    const fullPath = join(dir, entry);
    const info = await stat(fullPath);
    if (info.isDirectory()) {
      files.push(...(await listFiles(fullPath)));
    } else if (info.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}
