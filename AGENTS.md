# AGENTS.md

- This repo finds and routes to the best available AI.
- Do not build bypass tools.
- Do not evade provider rate limits.
- Do not rotate accounts or API keys.
- Do not spoof identity.
- Do not claim to reset Claude, OpenAI, Anthropic, or provider tokens.
- Use official APIs only.
- Keep API keys in `.env` only.
- Never commit `.env`, real API keys, private prompts, customer data, or legal documents.
- Make ranking transparent and auditable.
- Always show why a model was selected.
- Run `npm run preflight` before upload, commit, or final handoff when security-related files changed.
- Prefer small focused files.
- Always run `npm run typecheck` before final response.
- Final response must include files changed and remaining stubs.
