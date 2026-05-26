# Security Policy

## Supported Version

This project is early-stage. Security fixes should target the current `main` branch.

## Secrets

Never commit real API keys, OAuth tokens, private prompts, customer data, legal documents, or `.env` files.

Use `.env.example` only for placeholder names:

```bash
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
OPENROUTER_API_KEY=
OLLAMA_BASE_URL=http://localhost:11434
```

Before uploading or committing, run:

```bash
npm run preflight
```

## Provider Safety

This repo must use official APIs, user-provided keys, lawful public catalogs, lawful benchmark sources, and local models the user already has installed.

Do not add features that reset tokens, bypass billing, evade usage limits, rotate accounts or API keys, spoof identity, or scrape against provider terms.

## Sensitive Tasks

Use `private` mode for sensitive tasks:

```bash
npm run dev -- route "Review this private document" --mode private
```

Private mode prefers local Ollama models. If a local model is not strong enough, the router warns before selecting a non-local provider.

## Reporting Issues

If you find a security problem, do not open a public issue with secrets or exploit details. Remove any exposed key immediately, rotate it in the provider dashboard, and document the fix without including the secret.
