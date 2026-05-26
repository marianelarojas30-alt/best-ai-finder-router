# Quickstart

Best-AI Finder Router is a command-line tool that helps a user choose the best available AI model for a specific task.

It can work in two ways:

- **Offline/cache mode:** works immediately with the included model cache.
- **Live discovery mode:** uses configured provider APIs or local Ollama to discover models currently available to the user.

## 1. Install

```bash
npm install
```

## 2. Check The Repo

```bash
npm run preflight
```

This runs:

- TypeScript validation
- a security scan for obvious leaked keys or unsafe local model URLs

## 3. Try It Without API Keys

```bash
npm run dev -- discover
npm run dev -- rank "Fix this TypeScript bug"
npm run dev -- route "Summarize a private document" --mode private
```

Without API keys, the tool uses `data/model-cache.json`.

## 4. Enable Live Discovery

Create a local `.env` file:

```bash
npm run dev -- setup-keys --create-env
```

Add only the keys you have:

```bash
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
OPENROUTER_API_KEY=
OLLAMA_BASE_URL=http://localhost:11434
DEFAULT_MODE=best
BENCHMARK_CACHE_TTL_HOURS=24
```

Never upload `.env`.

## 5. Use The Modes

```bash
npm run dev -- route "Solve this hard reasoning task" --mode best
npm run dev -- route "Fix this TypeScript bug" --mode balanced
npm run dev -- route "Summarize this article cheaply" --mode budget
npm run dev -- route "Summarize a private document" --mode private
```

Mode meaning:

- `best`: quality first
- `balanced`: quality, speed, and cost
- `budget`: cheapest model that passes the quality gate
- `private`: local Ollama first

## 6. Optional Global Command

```bash
npm link
best-ai-finder-router discover
best-ai-finder-router route "Fix this TypeScript bug" --mode balanced
```

## What Users Should Expect

The tool does not magically bypass provider limits or billing. It only uses official APIs, user-provided keys, public/catalog cache data, and local models already installed on the machine.

If no cloud keys are configured, cache mode is normal.

If Ollama is running locally, private mode can use local models.
