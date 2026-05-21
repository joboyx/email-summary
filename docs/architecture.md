# Architecture

## Runtime Context

- **Platform**: Google Apps Script, V8 runtime (`src/appsscript.json`).
- **Deployment tooling**: `clasp` CLI (see `package.json` scripts); TypeScript in `src/` compiles to `dist/`; `rootDir` in `.clasp.json` points at `dist/`.
- **Hosting**: Bound to the user's Google account; execution scoped to the owner's Gmail data.

## Components

Apps Script loads all compiled `.js` files in `dist/` into a shared global namespace (`tsconfig` `module: "None"`; no ES modules).

| Module (source)        | Key symbols                                                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------------------------------- |
| `src/main.ts`          | **Entry point**: `summarizeAndSendDailyEmail` orchestrates the workflow                                       |
| `src/config.ts`        | `EMAIL_*` flags, `EMAIL_CATEGORIES`, `OPENROUTER_*` constants                                                 |
| `src/gmail-search.ts`  | `getSearchStringForLastNDays`, `getPreviousDayEmails`                                                         |
| `src/openrouter.ts`    | `fetchOpenRouterChatCompletion`, `summarizeEmails`                                                            |
| `src/html-format.ts`   | `formatSummariesAsHTML`                                                                                       |
| `src/gmail-actions.ts` | `sendSummaryEmail`, `archiveThreads`, `addLabels`, `getOrCreateLabel`, `explainEmail`, `labelCache`           |
| `src/types.d.ts`       | Shared interfaces for email and OpenRouter data contracts                                                     |
| `src/appsscript.json`  | Time zone (Asia/Manila), OAuth scopes, advanced Gmail API (copied to `dist/` on build)                        |
| `package.json`         | Node metadata, clasp scripts, `meta.activeDeploymentVersion` (auto-updated on deploy) |
| `scripts/clasp-deployment.mjs` | Resolve clasp ID from version, redeploy in place, cleanup stale deployments |
| `credentials.json`     | OAuth credentials for clasp (not tracked in git)                                                              |

## Data Flow

1. **Input**: Gmail threads returned by `GmailApp.search` using the timestamp filter from `getSearchStringForLastNDays`.
2. **Transformation**:
   - Messages filtered to same date range client-side.
   - Plain text content trimmed to `EMAIL_MAX_CONTENT_LENGTH`.
   - OpenRouter chat completions request formed with category YAML block, reasoning config, and behavior guidelines.
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
- **UrlFetchApp**: Send HTTPS POST request to `https://openrouter.ai/api/v1/chat/completions`.
- **PropertiesService**: Read `OPENROUTER_API_KEY` script property for authorization header.

## Error Surfaces

- `summarizeAndSendDailyEmail` wraps flow in try/catch and returns `{ success, message }`.
- OpenRouter failures logged with the subject; failing emails are skipped but do not halt execution.
- Emoji validation warns if the response does not include a known category emoji, substituting an error marker.
- Label creation falls back to on-demand creation per segment using cached references (`labelCache`).

## Concurrency & Idempotency

- No explicit locking; daily trigger reprocesses the last `n` days. Since Gmail search excludes the summary email subject, digest email itself is not reprocessed.
- Archiving modifies inbox state; reruns will not find archived threads unless labels or time window includes them.
