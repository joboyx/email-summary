# Troubleshooting

## Missing Daily Digest Email
- Confirm trigger exists and is set to `summarizeAndSendDailyEmail`.
- Run `npm start` to trigger manually; check execution logs.
- Ensure `EMAIL_SEND_ENABLED` is `true`.
- Verify Gmail send quota has not been exceeded.

## No Emails Processed
- Check log output for `searchString:` value; confirm it returns threads when run in Gmail search box.
- Validate `EMAIL_SEARCH_PREVIOUS_DAYS` and `EMAIL_SEARCH_RESULT_LIMIT` settings.
- Ensure digest subject filter (`-subject:"📝 Daily Email Summary"`) matches actual sent subject.

## OpenRouter Errors (`Failed to summarize email`) 
- Confirm `OPENROUTER_API_KEY` is set in script properties and has credits/quota on OpenRouter.
- Remove legacy `OPENAI_API_KEY` if the script was migrated but the old property remains unused.
- Review response payload in logs (if available) for rate limit or validation errors.
- HTTP 429 responses retry automatically (3 attempts, 2s delay). Persistent 429s may indicate inbox volume exceeding OpenRouter rate limits — reduce `EMAIL_SEARCH_RESULT_LIMIT` temporarily.

## Invalid Emoji Warning
- Occurs when OpenRouter/model response omits or changes the emoji prefix.
- Review the email content and prompt; adjust `EMAIL_CATEGORIES` descriptions as needed.
- Consider re-running summarization after prompt updates.

## Labels Not Appearing
- Ensure `EMAIL_LABEL_ENABLED` is `true`.
- Check that action item line is not `None` (case-insensitive) in the OpenRouter response.
- Verify label hierarchy exists; `getOrCreateLabel` logs creation steps.

## Archiving Unexpected Emails
- Review `EMAIL_CATEGORIES_SKIPPED_FOR_ARCHIVE`; add categories to exclude.
- Temporarily set `EMAIL_ARCHIVE_ENABLED` to `false` during investigation.
- Examine logs (`Moved to Archive`) for context via `explainEmail` output.

## Authentication Problems with Clasp

Clasp uses **two** credential files. See [clasp-auth.md](clasp-auth.md).

### `invalid_grant` on `clasp pull`, `push`, or `deploy`

These commands use **global** auth (`~/.clasprc.json`), not `./.clasprc.json`.

```bash
npm run setup:global
npm run auth:status
npx clasp pull
```

### `invalid_grant` or auth errors on `npm start` / `clasp run`

Uses **local** auth (`./.clasprc.json` from `credentials.json`):

```bash
npm run setup:local
```

### `npm run setup:local` exits 1 after "Authorization successful"

Local credentials are often saved anyway. Verify global auth with `npm run auth:status` and `npx clasp pull`, then retry `npm start`.

### General checks

- Confirm `credentials.json` is a Desktop OAuth client for the GCP project in `.clasp.json` (`projectId`).
- Delete stale tokens and re-login: `rm ~/.clasprc.json` → `npm run setup:global`; `rm .clasprc.json` → `npm run setup:local`.
- WSL/headless: `clasp login --no-localhost` or `clasp login --creds credentials.json --no-localhost`.

## Permission Errors When Running Script
- Ensure Apps Script project scopes match the ones in `appsscript.json`.
- If running as a different user, share the Apps Script project and reauthorize Gmail permissions.
