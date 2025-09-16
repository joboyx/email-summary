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

## OpenAI Errors (`Failed to summarize email`) 
- Confirm `OPENAI_API_KEY` is valid and has usage quota.
- Review response payload in logs (if available) for rate limit or validation errors.
- Reduce email volume or implement retry logic during peak load (future enhancement).

## Invalid Emoji Warning
- Occurs when OpenAI response omits or changes the emoji prefix.
- Review the email content and prompt; adjust `EMAIL_CATEGORIES` descriptions as needed.
- Consider re-running summarization after prompt updates.

## Labels Not Appearing
- Ensure `EMAIL_LABEL_ENABLED` is `true`.
- Check that action item line is not `None` (case-insensitive) in the OpenAI response.
- Verify label hierarchy exists; `getOrCreateLabel` logs creation steps.

## Archiving Unexpected Emails
- Review `EMAIL_CATEGORIES_SKIPPED_FOR_ARCHIVE`; add categories to exclude.
- Temporarily set `EMAIL_ARCHIVE_ENABLED` to `false` during investigation.
- Examine logs (`Moved to Archive`) for context via `explainEmail` output.

## Authentication Problems with Clasp
- Re-run `npm run setup` to refresh OAuth tokens.
- Confirm `credentials.json` matches the Google Cloud project attached to the Apps Script.
- Delete `.clasprc.json` (if stale) and log in again.

## Permission Errors When Running Script
- Ensure Apps Script project scopes match the ones in `appsscript.json`.
- If running as a different user, share the Apps Script project and reauthorize Gmail permissions.
