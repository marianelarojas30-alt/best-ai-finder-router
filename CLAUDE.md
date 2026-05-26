# CLAUDE.md

This repo is **Best-AI Finder Router**: a legal AI discovery and routing CLI.

## What This Repo Does

It discovers available AI models, ranks them for a user task, and explains which model is best under the selected mode:

- `best`
- `balanced`
- `budget`
- `private`

## Safety Rules

Do not build or suggest features that:

- reset Claude, OpenAI, Anthropic, or provider tokens
- bypass usage limits
- bypass billing
- evade rate limits
- rotate accounts or API keys to avoid limits
- spoof identity
- scrape sites aggressively or against their terms

Use only:

- official APIs
- user-provided API keys
- public model catalogs
- lawful benchmark sources
- local Ollama models the user already has installed

## Secret Handling

- Never commit `.env`.
- Never print real API keys.
- Never put real API keys in examples.
- Keep keys in `.env` only.
- Use `.env.example` only for placeholders.

## Important Commands

Run this before final handoff:

```bash
npm run preflight
```

Useful checks:

```bash
npm run typecheck
npm run security:check
npm run dev -- discover
npm run dev -- rank "Fix this TypeScript repo error"
npm run dev -- route "Translate this page into all supported languages"
npm run dev -- security-check
```

## Project Structure

- `src/cli.ts`: CLI commands.
- `src/router.ts`: model routing decision.
- `src/modelRanker.ts`: scoring logic.
- `src/modelDiscovery.ts`: discovery orchestration.
- `src/taskClassifier.ts`: task classifier.
- `src/qualityGate.ts`: output quality checks.
- `src/providers/`: provider adapters.
- `src/discovery/`: provider discovery modules.
- `src/utils/contextCompressor.ts`: handoff/context compression.
- `scripts/security-check.mjs`: standalone security scanner.
- `data/model-cache.json`: fallback model cache.
- `data/benchmark-cache.json`: fallback benchmark cache.

## Current Stubs

Provider `sendMessage()` functions are intentionally minimal API adapters. Discovery, classification, ranking, route explanations, security checks, and context compression should remain working.

## Claude Code Workflow

When working in Claude Code:

1. Read `CLAUDE.md`, `AGENTS.md`, `README.md`, and `SECURITY.md`.
2. Inspect relevant source files before editing.
3. Keep changes small and focused.
4. Run `npm run preflight`.
5. Report files changed, validation results, and any remaining stubs.

If Claude Code reports a usage limit, stop and wait for the reset time. Do not attempt to bypass Claude usage limits.
