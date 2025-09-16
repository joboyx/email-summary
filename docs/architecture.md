# Architecture

## Runtime Context
- **Platform**: Google Apps Script, V8 runtime (`appsscript.json`).
- **Deployment tooling**: `clasp` CLI (see `package.json` scripts).
- **Hosting**: Bound to the user's Google account; execution scoped to the owner's Gmail data.

## Components
- `Code.js`: Single script file containing all logic.
  - **Entry point**: `summarizeAndSendDailyEmail` orchestrates the workflow.
  - **Helpers**:
    - `getSearchStringForLastNDays` builds Gmail search queries.
    - `getPreviousDayEmails` pulls and normalizes Gmail messages.
    - `summarizeEmails` invokes OpenAI and parses responses.
    - `formatSummariesAsHTML` builds the digest email body.
    - `sendSummaryEmail`, `archiveThreads`, `addLabels` apply email actions.
    - `getOrCreateLabel`, `explainEmail` support label management and logging.
- `appsscript.json`: Configures time zone (Asia/Manila), OAuth scopes, and advanced Gmail API enabling.
- `package.json`: Node environment metadata plus `clasp` automation scripts and deployment tracking (`meta.activeDeploymentId`).
- `credentials.json`: OAuth credentials for clasp (not tracked in git).

## Data Flow
1. **Input**: Gmail threads returned by `GmailApp.search` using the timestamp filter from `getSearchStringForLastNDays`.
2. **Transformation**:
   - Messages filtered to same date range client-side.
   - Plain text content trimmed to `EMAIL_MAX_CONTENT_LENGTH`.
   - OpenAI chat completions request formed with category YAML block and behavior guidelines.
   - Response parsed into `summary`, `category`, `actionItem` fields.
   - Summaries sorted by category then message date (descending).
3. **Output**:
   - HTML digest string containing summary rows and category legend.
   - Email sent via `MailApp.sendEmail` (subject + HTML body).
   - Threads archived (unless category is in `EMAIL_CATEGORIES_SKIPPED_FOR_ARCHIVE`).
   - Label `🤖 EmailSummary/⚠️ ActionRequired` attached when `actionItem` is not `None`.

## External Integrations
- **GmailApp**: Search, thread access, move to archive.
- **MailApp**: Send composed summary email.
- **UrlFetchApp**: Send HTTPS POST request to `https://api.openai.com/v1/chat/completions`.
- **PropertiesService**: Read `OPENAI_API_KEY` script property for authorization header.

## Error Surfaces
- `summarizeAndSendDailyEmail` wraps flow in try/catch and returns `{ success, message }`.
- OpenAI failures logged with the subject; failing emails are skipped but do not halt execution.
- Emoji validation warns if the response does not include a known category emoji, substituting an error marker.
- Label creation falls back to on-demand creation per segment using cached references (`labelCache`).

## Concurrency & Idempotency
- No explicit locking; daily trigger reprocesses the last `n` days. Since Gmail search excludes the summary email subject, digest email itself is not reprocessed.
- Archiving modifies inbox state; reruns will not find archived threads unless labels or time window includes them.
