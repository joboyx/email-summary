# Security & Compliance

## Data Handling
- Processes Gmail message metadata and plain text bodies. Content is transmitted to OpenAI for summarization.
- Truncates content at `EMAIL_MAX_CONTENT_LENGTH` but otherwise passes email text verbatim to OpenAI. Treat as sharing email data with a third party.
- Digest email is sent back to the same Gmail account; no external recipients.

## Authentication & Secrets
- Uses OAuth scopes listed in `appsscript.json` to read, modify, and send Gmail messages, and perform external HTTP requests.
- Requires `OPENAI_API_KEY` stored as a script property. Protect this key; avoid logging or committing it.
- `credentials.json` and `.clasp.json` contain OAuth client information and should remain local.

## Access Control
- Execution API is set to `MYSELF`, limiting programmatic access to the script owner.
- Gmail labels created (`🤖 EmailSummary/...`) inherit Gmail's sharing model; only the account owner sees them unless mailbox is delegated.

## Compliance Considerations
- Sending email content to OpenAI may have privacy/regulatory implications; ensure alignment with organizational policies.
- `EMAIL_CATEGORIES` include emojis; verify they are acceptable for target audience and do not violate accessibility requirements.
- Apps Script exception logging to Stackdriver may store message metadata; follow data retention policies.

## Recommendations
1. Document user consent for OpenAI processing if multiple stakeholders access the mailbox.
2. Rotate `OPENAI_API_KEY` periodically and revoke keys on compromise.
3. Consider redacting sensitive sections of emails before sending to OpenAI if privacy is a concern.
4. Audit OAuth scopes periodically; remove unused advanced services if unnecessary.
