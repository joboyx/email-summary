# Configuration Reference

## Runtime Flags (`src/config.ts`)
- `EMAIL_SEND_ENABLED` (default `true`): Enables sending the digest email. Set to `false` during testing to dry-run the pipeline.
- `EMAIL_ARCHIVE_ENABLED` (default `true`): Determines whether processed threads are archived.
- `EMAIL_LABEL_ENABLED` (default `true`): Controls whether action-required labels are added.
- `EMAIL_SEARCH_PREVIOUS_DAYS` (default `1`): Number of days back to include in the Gmail search.
- `EMAIL_SEARCH_RESULT_LIMIT` (default `undefined`): Maximum number of threads processed. Leave `undefined` for no limit.
- `EMAIL_MAX_CONTENT_LENGTH` (`1_000_000`): Maximum characters from each message forwarded to OpenRouter.
- `EMAIL_CATEGORIES_SKIPPED_FOR_ARCHIVE` (`["personal"]`): Categories exempted from archiving.
- `EMAIL_LABEL_ROOT` (`"🤖 EmailSummary"`): Root label name for auto-created labels.
- `EMAIL_LABEL_ACTION_REQUIRED` (derived): Full label applied when action items exist.
- `OPENROUTER_MODEL` (`"~openai/gpt-latest"`), `OPENAI_MAX_TOKENS` (`500_000`): Model alias and completion token budget for chat completions.

## Script Properties
- `OPENROUTER_API_KEY`: Required for authenticating to the OpenRouter API. Configure via Apps Script UI (`Project Settings > Script properties`). Remove legacy `OPENAI_API_KEY` after migration.

## Apps Script Project Settings (`src/appsscript.json`)
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
- `setup` / `setup:global` / `setup:local` / `auth:status`: clasp authentication (see [clasp-auth.md](clasp-auth.md)).
- Scripts for deploy, testing, log streaming, deployment management.
- `meta.activeDeploymentId`: Track the deployment number currently bound to triggers (must be updated manually post-deploy).

## External Files
- `.clasp.json`: Contains `projectId`, `scriptId`, and `rootDir` (set to `dist/`; not committed). Run `npm run build` before push/deploy.
- `credentials.json`: Desktop OAuth client for **local** clasp login (`setup:local`); not in repo.
- `~/.clasprc.json`: **Global** clasp auth for push, pull, deploy (`setup:global`); not in repo.
- `./.clasprc.json`: **Local** clasp auth for `clasp run` / `npm start`; not in repo.

## Trigger Configuration (manual)
- Time-based trigger should target `summarizeAndSendDailyEmail`, scheduled daily (5–6 AM recommended per README).
- Recreate the time-based trigger after every deploy so it points at the latest deployment version; this is still a manual post-deploy step.
- Failure notifications set to "Notify me immediately".
