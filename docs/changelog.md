# Changelog

## Unreleased
- Refactored monolithic `Code.js` into modular `src/` layout (config, Gmail search, OpenRouter, HTML format, Gmail actions, main entry).
- Updated clasp `rootDir` to `src/`; moved `appsscript.json` alongside source files.
- Migrated LLM integration from direct OpenAI API to OpenRouter (`~openai/gpt-latest`, low reasoning effort).
- Renamed script property to `OPENROUTER_API_KEY`; updated docs across architecture, configuration, deployment, operations, API integrations, and troubleshooting.

## 1.0.0
- Initial Google Apps Script implementation for daily Gmail summary with OpenAI-powered categorization.
