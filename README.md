# Best-AI Finder Router

Best-AI Finder Router is a legal AI orchestration CLI that discovers available AI models, ranks them for a specific task, and routes the request to the strongest available option based on quality, benchmarks, context window, speed, cost, privacy, and reliability.

It is built around one question: **what is the best currently available AI for this exact task under the selected mode?**

For the shortest setup path, see [QUICKSTART.md](./QUICKSTART.md).

## What It Does

- Discovers models from official provider APIs and lawful catalogs.
- Falls back to local cache data when credentials or services are unavailable.
- Classifies the user task before ranking.
- Ranks models differently for `best`, `balanced`, `budget`, and `private` modes.
- Explains the selected model, runner-ups, tradeoffs, and whether live discovery or cache was used.
- Compresses project context into clean handoff notes for long-running work.

## What It Does Not Do

This tool does not reset provider tokens, bypass billing, evade usage limits, rotate accounts or API keys, spoof identity, or scrape sites aggressively. It uses official APIs, user-provided keys, public model catalogs, lawful benchmark sources, manual benchmark caches, and local models the user already has installed.

## Why "Best AI" Changes Over Time

The strongest model for a task changes as providers release new models, pricing shifts, local models improve, context windows expand, and reliability changes. This repo treats model choice as a live discovery and ranking problem, not a static configuration file.

## How Discovery Works

- OpenAI: uses the official models endpoint when `OPENAI_API_KEY` is present.
- Anthropic: uses Anthropic's official Models API when `ANTHROPIC_API_KEY` is present.
- OpenRouter: uses OpenRouter's public model catalog when `OPENROUTER_API_KEY` is present.
- Ollama: queries the local Ollama API when `OLLAMA_BASE_URL` is present.
- Benchmarks: reads lawful benchmark signals from `data/benchmark-cache.json`; live benchmark ingestion is intentionally conservative.

When live discovery is unavailable, the CLI uses `data/model-cache.json`.

## How Ranking Works

Ranking combines task fit, benchmark intelligence, reasoning strength, coding strength, context window, multimodal ability, multilingual ability, reliability, provider availability, speed, cost, selected mode, and privacy preference. Each result includes a score breakdown so the decision is auditable.

## Modes

- `best`: prioritizes capability and quality above cost.
- `balanced`: balances quality, speed, and cost.
- `budget`: prefers the cheapest model that passes the minimum quality gate.
- `private`: prefers local Ollama models and warns when available local models look too weak for the task.

## Setup

```bash
npm install
cp .env.example .env
npm run typecheck
npm run security:check
```

Add any provider keys you want to use to `.env`.

## API Keys

```bash
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...
OPENROUTER_API_KEY=...
OLLAMA_BASE_URL=http://localhost:11434
DEFAULT_MODE=best
BENCHMARK_CACHE_TTL_HOURS=24
```

API keys must stay in `.env`. Do not commit them.

## Security Checks

Before manually uploading, committing, or publishing changes, run:

```bash
npm run preflight
```

This runs TypeScript validation and scans for common leaked secrets, bearer tokens, GitHub tokens, and unsafe non-local Ollama URLs.

You can also run the scanner from the CLI:

```bash
npm run dev -- security-check
```

Keep private tasks in `private` mode when possible:

```bash
npm run dev -- route "Review this private document" --mode private
```

## Example Commands

```bash
npm run dev -- discover
npm run dev -- rank "Fix this TypeScript repo error"
npm run dev -- route "Translate this page into all supported languages"
npm run dev -- compress-context ./examples/permitready-task.json
npm run dev -- security-check
npm run dev -- setup-keys --create-env
```

## Legal Usage Warning

Use this tool only with provider-approved APIs, user-owned credentials, public catalogs, lawful benchmark data, and local models you already have installed. Do not use it to bypass provider limits, billing, account restrictions, identity checks, or terms of service.

## Roadmap

- Add richer provider `sendMessage` implementations.
- Add persisted route history and evaluation traces.
- Add optional benchmark importers for explicitly permitted sources.
- Add reliability scoring from user-approved telemetry.
- Add structured JSON output for CI workflows.
