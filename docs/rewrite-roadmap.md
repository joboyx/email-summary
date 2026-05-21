# Rewrite Roadmap

## Drivers for Rewrite
- Single-file script (`Code.js`) mixes orchestration, API integration, and presentation logic.
- Tight coupling to LLM response format (string parsing) increases fragility.
- Lack of automated tests or mocks makes regression detection difficult.
- Manual deployment and trigger management steps are error-prone.

## Goals
1. Modularize codebase (separate data access, AI integration, templating, and Gmail actions).
2. Introduce structured data contracts (e.g., JSON responses from OpenRouter) to simplify parsing.
3. Establish testing harness with mocked services and automated verification.
4. Improve configurability (externalize flags, support per-user settings).
5. Streamline deployment and monitoring (scripts, dashboards, alerting).

## Proposed Phases
1. **Assessment (Current Stage)**
   - Complete documentation of existing behavior (this doc set).
   - Identify critical metrics (daily volume, failure rates) via logs.
2. **Foundation**
   - Extract configuration into dedicated module and external config files.
   - Create lightweight wrapper classes for Gmail and OpenRouter interactions.
   - Add unit tests for pure functions (date filtering, HTML formatting).
3. **Enhancements**
   - Migrate to structured OpenRouter responses (`response_format: { type: "json_object" }`).
   - Implement error retries/backoff and better logging/monitoring.
   - Provide CLI or UI to manage categories, labels, and thresholds.
4. **Deployment & Ops**
   - Automate trigger updates, integrate with CI for clasp push/deploy.
   - Add health checks and notification when summaries fail.

## Open Questions
- Should multiple recipients be supported (team inbox scenarios)?
- Do we need to redact or anonymize email content before sending to OpenRouter for compliance?
- Is the Gmail advanced service required for future optimizations?

## Measuring Success
- Reduced failure rate in Apps Script logs.
- Faster triage time thanks to clearer logs and structured data.
- Ability to run automated tests locally before deploy.
- Simplified onboarding with modular code and updated docs.
