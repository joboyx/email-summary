# Testing Strategy

## Current Coverage
- **Manual execution**: `npm start` runs `summarizeAndSendDailyEmail` against live Gmail data. This is the primary validation path.
- **Deploy-and-run (`npm test`)**: Forces a push, deploy, and execution. Useful for end-to-end verification but creates a new deployment each time.
- **Logging review**: Reliant on console output for verifying pipeline stages (search results, OpenAI responses, label operations).

## Gaps
- No unit or integration tests for helper functions (`getPreviousDayEmails`, `summarizeEmails`, etc.).
- No mocking of OpenAI or Gmail APIs; behavior depends on live services.
- No automated regression suite for HTML rendering or label management.

## Suggested Enhancements (for rewrite)
1. Introduce a local test harness using clasp's `--dev` scripts with stubbed Gmail/UrlFetch responses.
2. Add contract tests for OpenAI prompt/response parsing to guard against format drift.
3. Validate HTML output structure with snapshot-style tests.
4. Provide a dry-run mode that logs actions without modifying Gmail (archiving, labeling) for safer manual tests.

## Pre-Deploy Checklist
- Ensure debug flags (`EMAIL_SEND_ENABLED`, `EMAIL_ARCHIVE_ENABLED`, `EMAIL_LABEL_ENABLED`) are set to production-ready values, as documented in README.
- Run `npm start` to confirm pipeline success and inspect logs for warnings or errors.
