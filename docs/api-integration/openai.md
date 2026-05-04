# OpenAI Integration

## Endpoint
- URL: `https://api.openai.com/v1/chat/completions`
- Method: `POST`
- Auth: Bearer token from `OPENAI_API_KEY` script property.

## Request Structure
```json
{
  "model": "gpt-5.5",
  "messages": [
    {
      "role": "user",
      "content": "... see prompt template ..."
    }
  ],
  "max_completion_tokens": 50000
}
```
- `messages[0].content` embeds email metadata and a YAML-formatted list of categories with emoji and descriptions.
- Prompt guidelines emphasize:
  - Focus on new content in replies.
  - Choose category strictly from the provided list.
  - Prefix summary with the category emoji.
  - Emit `actionItem: None` when no critical action is required.

## Response Handling
- The code expects the completion to contain newline-separated `category: ...`, `summary: ...`, and `actionItem: ...` lines.
- `summarizeEmails` splits the text by newline and extracts values by prefix matching.
- Emoji validation ensures the summary begins with one of the configured emojis; otherwise the summary is replaced with `⚠️ Invalid emoji detected. Please review.`

## Error Handling
- Fetch failures or parsing errors log `Failed to summarize email: <subject>. Error: <message>`.
- Emails causing errors are skipped; processing continues for remaining messages.
- Consider rate limiting or retries if OpenAI errors become frequent (not currently implemented).

## Token Management
- `EMAIL_MAX_CONTENT_LENGTH` controls message body size prior to API call.
- `OPENAI_MAX_TOKENS` (50,000) caps the completion size. Adjust if OpenAI quotas require lower limits.

## Future Enhancements
- Capture structured JSON by requesting `response_format`. This would remove reliance on string parsing.
- Batch multiple emails per request to reduce API calls, if latency or cost becomes an issue.
