# Email Processing Pipeline

## 1. Trigger & Entry

- **Function**: `summarizeAndSendDailyEmail`
- **Invocation**: Manual run (`npm start` / clasp run) or time-based UI trigger bound to `meta.activeDeploymentVersion`.
- **Guardrails**: Wraps the entire flow in `try/catch`, logging errors and returning a status object.

## 2. Message Discovery (`getPreviousDayEmails`)

- Builds Gmail search query: `in:inbox after:<YYYY/MM/DD> -subject:"📝 Daily Email Summary"`.
- Retrieves threads with `GmailApp.search`; truncates to `EMAIL_SEARCH_RESULT_LIMIT` when defined.
- Recomputes the `after:` cutoff locally (`nDaysAgo` at start of day) to filter individual messages.
- Captures per-message payload containing thread/message IDs, timestamps, sender, subject, body snippet, and permalink.

## 3. Summarization (`summarizeEmails`)

- Constructs OpenRouter Chat Completions payload with:
  - Model `~openai/gpt-latest`, `max_completion_tokens` = 500,000, `reasoning: { effort: "low", exclude: true }`.
  - Single user message containing email metadata and YAML-formatted category list.
  - Behavioral guidelines emphasizing new content and action item threshold.
- Sends POST via `UrlFetchApp.fetch` with Bearer token from `OPENROUTER_API_KEY` script property and OpenRouter attribution headers.
- Parses returned text into key/value pairs (`category`, `summary`, `actionItem`).
- Validates emoji prefix; on mismatch, replaces summary with warning text.
- Collects successful summaries and sorts by category, then descending `messageDate`.

## 4. Digest Assembly (`formatSummariesAsHTML`)

- Produces HTML table listing summaries with subject, sender, category, and permalink.
- Highlights action items in a yellow callout when `actionItem` is defined and not `none` (case-insensitive).
- Appends legend enumerating all configured categories and descriptions.

## 5. Delivery (`sendSummaryEmail`)

- Respects `EMAIL_SEND_ENABLED`; skips sending when disabled.
- Uses `MailApp.sendEmail` with HTML body, subject `📝 Daily Email Summary for <date>`, recipient `Session.getActiveUser().getEmail()`.

## 6. Post Processing

- **Archiving (`archiveThreads`)**: when `EMAIL_ARCHIVE_ENABLED` is true, moves thread to archive unless its category is listed in `EMAIL_CATEGORIES_SKIPPED_FOR_ARCHIVE` (default excludes `personal`).
- **Labeling (`addLabels`)**: when `EMAIL_LABEL_ENABLED` is true, attaches `🤖 EmailSummary/⚠️ ActionRequired` to threads with actionable items. Labels are created on demand with `getOrCreateLabel`.

## 7. Logging & Observability

- Logs search string, individual email payloads, OpenRouter responses, final summary array, and label operations through `console.log`/`console.warn`.
- Errors during summarization or top-level execution are logged with `console.error` for visibility in Apps Script logs.
