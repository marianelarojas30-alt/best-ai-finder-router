# Usage

## Discover Models

```bash
npm run dev -- discover
```

Shows models available through live discovery or cache fallback.

## Rank Models

```bash
npm run dev -- rank "Fix this TypeScript repo error"
```

Ranks available models without sending the task to a provider.

## Route A Task

```bash
npm run dev -- route "Translate this page into all supported languages"
```

Outputs:

- selected model
- score
- task type
- why it was selected
- runner-up models
- tradeoffs
- discovery source

## Private Mode

```bash
npm run dev -- route "Summarize a private document" --mode private
```

Private mode prefers local Ollama models. If the task looks complex and only basic local models are available, the router warns the user.

## Context Compression

```bash
npm run dev -- compress-context ./examples/permitready-task.json
```

Creates a clean handoff with project name, user goal, active files, rules, languages, errors, decisions, and next steps.

## Security Check

```bash
npm run dev -- security-check
```

Scans for obvious leaked secrets and unsafe non-local Ollama URLs.

## API Key Setup

```bash
npm run dev -- setup-keys --create-env
```

Shows the official provider pages for creating API keys and creates `.env` from `.env.example` if needed.
