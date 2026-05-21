# Changelog

## Unreleased

- Converted modular source to TypeScript (`src/*.ts`, `src/types.d.ts`); `npm run build` emits Apps Script-compatible JavaScript to `dist/`.
- Updated clasp `rootDir` to `dist/`; `start`, `test`, and `deploy` scripts run build before clasp operations.
- Refactored monolithic `Code.js` into modular `src/` layout (config, Gmail search, OpenRouter, HTML format, Gmail actions, main entry).
- Moved `appsscript.json` alongside source files (copied to `dist/` on build).
- Migrated LLM integration from direct OpenAI API to OpenRouter (`~openai/gpt-latest`, low reasoning effort).
- Renamed script property to `OPENROUTER_API_KEY`; updated docs across architecture, configuration, deployment, operations, API integrations, and troubleshooting.

## 1.0.0

- Initial Google Apps Script implementation for daily Gmail summary with OpenAI-powered categorization.
