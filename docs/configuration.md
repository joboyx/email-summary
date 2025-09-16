# Configuration Reference

## Runtime Flags (Code.js)
- `EMAIL_SEND_ENABLED` (default `true`): Enables sending the digest email. Set to `false` during testing to dry-run the pipeline.
- `EMAIL_ARCHIVE_ENABLED` (default `true`): Determines whether processed threads are archived.
- `EMAIL_LABEL_ENABLED` (default `true`): Controls whether action-required labels are added.
- `EMAIL_SEARCH_PREVIOUS_DAYS` (default `1`): Number of days back to include in the Gmail search.
- `EMAIL_SEARCH_RESULT_LIMIT` (default `undefined`): Maximum number of threads processed. Leave `undefined` for no limit.
- `EMAIL_MAX_CONTENT_LENGTH` (`500000`): Maximum characters from each message forwarded to OpenAI.
- `EMAIL_CATEGORIES_SKIPPED_FOR_ARCHIVE` (`["personal"]`): Categories exempted from archiving.
- `EMAIL_LABEL_ROOT` (`"🤖 EmailSummary"`): Root label name for auto-created labels.
- `EMAIL_LABEL_ACTION_REQUIRED` (derived): Full label applied when action items exist.
- `OPENAI_MODEL` (`"gpt-5"`), `OPENAI_MAX_TOKENS` (`50000`): Model and token budget for chat completions.

## Script Properties
- `OPENAI_API_KEY`: Required for authenticating to the OpenAI API. Configure via Apps Script UI (`Project Settings > Script properties`).

## Apps Script Project Settings (`appsscript.json`)
- `timeZone`: `Asia/Manila` (affects trigger scheduling and date calculations).
- `dependencies.enabledAdvancedServices`: Enables Gmail advanced service (not directly used in code but available).
- `exceptionLogging`: `STACKDRIVER` (routes logs to Stackdriver).
- `oauthScopes`:
  - `https://www.googleapis.com/auth/userinfo.email`
  - `https://www.googleapis.com/auth/gmail.modify`
  - `https://www.googleapis.com/auth/script.external_request`
  - `https://www.googleapis.com/auth/script.send_mail`
  - `https://www.googleapis.com/auth/script.scriptapp`
- `runtimeVersion`: `V8`.
- `executionApi.access`: `MYSELF` (limits execution API access to owner).

## Node & Clasp Metadata (`package.json`)
- `@google/clasp` pinned at `^2.4.2`.
- Scripts for setup, deploy, testing, log streaming, deployment management.
- `meta.activeDeploymentId`: Track the deployment number currently bound to triggers (must be updated manually post-deploy).

## External Files
- `.clasp.json`: Contains `projectId`, `scriptId`, and `rootDir` (not committed).
- `credentials.json`: OAuth credentials for clasp login (present locally, not in repo).

## Trigger Configuration (manual)
- Time-based trigger should target `summarizeAndSendDailyEmail`, scheduled daily (5–6 AM recommended per README).
- Failure notifications set to "Notify me immediately".
