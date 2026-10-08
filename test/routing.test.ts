import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { isLoopbackUrl } from "../src/localEndpoint.js";
import { classifyTask } from "../src/taskClassifier.js";
import { envRiskPatterns } from "../src/securityCheck.js";

test("loopback URLs, including bracketed IPv6, count as local", () => {
  for (const url of ["http://localhost:11434", "http://127.0.0.1:11434", "http://[::1]:11434", "https://LOCALHOST/"]) {
    assert.equal(isLoopbackUrl(url), true, url);
  }
});

test("look-alike and remote URLs are not local", () => {
  for (const url of [
    "http://localhost.evil.example:11434",
    "http://127.0.0.1.evil.example",
    "http://127.0.0.1@evil.example",
    "http://10.0.0.5:11434",
    "file:///etc/passwd",
    "not a url",
    undefined
  ]) {
    assert.equal(isLoopbackUrl(url), false, String(url));
  }
});

test("env check flags look-alike Ollama hosts but not real loopback", () => {
  const risky = (line: string) =>
    envRiskPatterns.some((p) => {
      p.pattern.lastIndex = 0;
      return p.pattern.test(line);
    });
  assert.equal(risky("OLLAMA_BASE_URL=http://localhost:11434"), false);
  assert.equal(risky("OLLAMA_BASE_URL=http://127.0.0.1:11434/api"), false);
  assert.equal(risky("OLLAMA_BASE_URL=http://[::1]:11434"), false);
  assert.equal(risky('OLLAMA_BASE_URL="http://localhost"'), false);
  assert.equal(risky("OLLAMA_BASE_URL=http://localhost.evil.example:11434"), true);
  assert.equal(risky("OLLAMA_BASE_URL=http://127.0.0.1.nip.io"), true);
  assert.equal(risky("OLLAMA_BASE_URL=https://ollama.example.com"), true);
});

test("the CI script and the CLI use the same env risk pattern", () => {
  const line = (path: string) =>
    readFileSync(path, "utf8")
      .split("\n")
      .find((l) => l.includes("pattern: /OLLAMA_BASE_URL"));
  assert.ok(line("src/securityCheck.ts"));
  assert.equal(line("scripts/security-check.mjs"), line("src/securityCheck.ts"));
});

test("classifier matches whole words, not fragments", () => {
  assert.notEqual(classifyTask("Write an explanation of photosynthesis").type, "complex reasoning");
  assert.equal(classifyTask("Give me the latest news headlines").type, "general assistant task");
  assert.notEqual(classifyTask("What does the prefix un- mean?").type, "debugging");
});

test("classifier still finds the intended task types", () => {
  assert.equal(classifyTask("Fix this TypeError bug in the stack trace").type, "debugging");
  assert.equal(classifyTask("Implement a Python function with tests").type, "coding");
  assert.equal(classifyTask("Summarize this long report").type, "summarization");
  assert.equal(classifyTask("Plan and compare two strategies").type, "complex reasoning");
  assert.equal(classifyTask("Translate the UI into all supported languages").type, "translation");
});
