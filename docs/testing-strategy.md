# Testing Strategy

## Current Coverage

- **Manual execution**: `npm start` runs `summarizeAndSendDailyEmail` against live Gmail data. This is the primary validation path.
- **Local verification (`npm test`)**: Runs ESLint with `--max-warnings=0`, `type-coverage` on `src/` (100% threshold via `tsconfig.json`), Jest tests in `test/*.test.ts`, and the TypeScript build without clasp side effects.
- **Logging review**: Reliant on console output for verifying pipeline stages (search results, OpenRouter responses, label operations).

## Local Unit Tests (`test/`)

Jest runs against a VM sandbox that transpiles `src/` modules in Apps Script load order. Gmail, UrlFetch, MailApp, PropertiesService, and related services are stubbed in `test/support/gas-mocks.ts`.

| Area | Coverage |
|------|----------|
| Gmail search | `getSearchStringForLastNDays`, `getPreviousDayEmails` (date window filtering) |
| OpenRouter | `parseSummaryLine`, `fetchOpenRouterChatCompletion` (429 retry), `summarizeEmails` |
| HTML / Gmail actions | `formatSummariesAsHTML`, `sendSummaryEmail`, `archiveThreads`, `addLabels`, `getOrCreateLabel` |
| Orchestration | `summarizeAndSendDailyEmail` happy path and missing API key failure |

## Gaps

- No end-to-end test against live Gmail or OpenRouter (`npm start` remains the integration path).
- HTML output is asserted with string checks, not snapshot tests.
- No dry-run mode that logs archive/label actions without modifying Gmail.

## Suggested Enhancements

1. Add snapshot-style tests for HTML digest structure.
2. Provide a dry-run mode that logs actions without modifying Gmail (archiving, labeling) for safer manual tests.
3. Add timezone-edge-case coverage for date-window logic (Apps Script runs in `Asia/Manila`).

## Pre-Deploy Checklist

- Ensure debug flags (`EMAIL_SEND_ENABLED`, `EMAIL_ARCHIVE_ENABLED`, `EMAIL_LABEL_ENABLED`) are set to production-ready values, as documented in README.
- Run `npm start` to confirm pipeline success and inspect logs for warnings or errors.
