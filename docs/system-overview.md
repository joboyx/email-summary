# System Overview

## Purpose

This Google Apps Script project assembles a daily digest of recent Gmail messages. It queries the inbox for messages from the previous day, sends each message to OpenRouter for categorization and summarization, formats the results into an HTML report, delivers that report via email, and optionally archives and labels the processed threads. The goal is to keep the user informed while reducing inbox clutter.

## Current Scope

- Processes only the active user's inbox (`Session.getActiveUser()`).
- Considers messages from the last `EMAIL_SEARCH_PREVIOUS_DAYS` days (default 1). Older threads are ignored.
- Excludes prior summary emails by filtering the subject prefix (`Daily Email Summary`).
- Truncates message bodies to `EMAIL_MAX_CONTENT_LENGTH` (1,000,000 characters) before sending them to OpenRouter.
- Uses a fixed taxonomy of nine categories (`EMAIL_CATEGORIES`) with emoji prefixes.
- Sends summaries through Gmail and optionally archives threads and applies action-required labels.

## Stakeholders & Consumers

- **Primary user**: Gmail account owner receiving the digest email.
- **Maintainers**: Developers managing the Apps Script and associated deployment scripts.
- **External services**: OpenRouter (OpenAI-compatible chat completions via `~openai/gpt-latest`) and Gmail services invoked through Apps Script.

## High-Level Flow

1. Trigger invokes `summarizeAndSendDailyEmail`.
2. Recent inbox emails are fetched with `GmailApp.search` and filtered to match Gmail's `after:` behavior.
3. Each message is summarized by OpenRouter using the predefined prompt and taxonomy.
4. Summaries are sorted by category and date, then rendered into HTML.
5. HTML digest is emailed to the user, threads may be archived, and action labels applied.

## Key User-Facing Output

- Daily digest email titled `📝 Daily Email Summary for <YYYY-MM-DD>`.
- Gmail label hierarchy rooted at `🤖 EmailSummary` (action items are tagged with `⚠️ ActionRequired`).

## Dependencies at a Glance

- Google Apps Script V8 runtime.
- GmailApp, MailApp, UrlFetchApp services.
- Script property `OPENROUTER_API_KEY` for outbound API calls.
- Deployment managed via `clasp` commands in `package.json`.

## Known Constraints

- Execution time limited by Apps Script quotas and OpenRouter latency.
- Summaries depend on OpenRouter response format; malformed responses reduce labeling/archiving accuracy.
- Only one recipient (the active user) is supported in the current implementation.
