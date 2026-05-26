# Roadmap

## Ready Now

- CLI commands for `discover`, `rank`, `route`, `compress-context`, and `security-check`
- cache fallback when API keys are missing
- live Ollama discovery
- provider adapters for OpenAI, Anthropic, OpenRouter, and Ollama
- transparent ranking explanations
- security preflight
- Claude Code instructions

## Next Useful Features

- Add `--json` output for automation and CI.
- Add a `send` command that routes and then sends the prompt to the selected provider.
- Add richer benchmark source metadata.
- Add user-editable provider preferences.
- Add route history for auditability.
- Add tests for classifier, ranker, and security scanner.

## Not Planned

- token resets
- provider limit bypasses
- billing bypasses
- account or API key rotation to avoid limits
- identity spoofing
- scraping against provider terms
