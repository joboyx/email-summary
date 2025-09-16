# Gmail Integration

## Services Used
- `GmailApp`
  - `search(query)`: Retrieves threads matching inbox criteria.
  - `getThreadById(id)`, `moveThreadToArchive(thread)`: Archive operations.
- `MailApp`
  - `sendEmail({ to, subject, htmlBody })`: Sends the digest email.

## Search Strategy
- Query pattern: `in:inbox after:<YYYY/MM/DD> -subject:"📝 Daily Email Summary"`.
- `getSearchStringForLastNDays(n)` computes the `after:` date anchored to midnight n days ago.
- Local filtering enforces the same cutoff on individual messages (important when threads contain older replies).

## Message Normalization
- For each message in matched threads:
  - Extract `message.getId()`, `thread.getId()`, `message.getDate()`, `getFrom()`, `getSubject()`, `getPlainBody()` (trimmed), `thread.getPermalink()`.
  - Emails logged as JSON for debugging.

## Archiving
- Controlled via `EMAIL_ARCHIVE_ENABLED`.
- `EMAIL_CATEGORIES_SKIPPED_FOR_ARCHIVE` prevents archiving categories (default `personal`).
- Uses `GmailApp.moveThreadToArchive(thread)` and logs action with `explainEmail` helper.

## Labeling
- Enabled via `EMAIL_LABEL_ENABLED`.
- `getOrCreateLabel` splits label path (`🤖 EmailSummary/⚠️ ActionRequired`) and ensures each level exists, caching results per execution.
- Labels applied only when `actionItem` is present and not case-insensitive `none`.

## Sending Digest
- `MailApp.sendEmail` invoked only if `EMAIL_SEND_ENABLED` is true.
- Recipient determined dynamically (`Session.getActiveUser().getEmail()`).

## OAuth Scopes
Defined in `appsscript.json`:
- `https://www.googleapis.com/auth/gmail.modify`
- `https://www.googleapis.com/auth/script.send_mail`
- `https://www.googleapis.com/auth/script.scriptapp`
- `https://www.googleapis.com/auth/userinfo.email`
- `https://www.googleapis.com/auth/script.external_request`

## Error Handling & Logging
- Logs search string, message payloads, and archiving/labeling decisions.
- Gmail operations rely on Apps Script built-ins; failures appear in execution logs.

## Enhancements to Consider
- Use `Gmail.Users.Messages` advanced service for more granular control (currently enabled but unused).
- Implement batching or caching for repeated `getThreadById` calls if performance becomes an issue.
