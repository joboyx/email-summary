# OpenRouter Integration

## Endpoint

- URL: `https://openrouter.ai/api/v1/chat/completions`
- Method: `POST`
- Auth: Bearer token from `OPENROUTER_API_KEY` script property.
- Headers: `HTTP-Referer` and `X-Title` identify the app per OpenRouter quickstart guidance.

## Model

- Model alias: `~openai/gpt-latest`
- OpenRouter redirects this alias to the latest model in the OpenAI GPT family without code changes when OpenAI releases new models.
- Pricing and behavior may change when the alias target changes; monitor OpenRouter usage dashboards after major GPT releases.

## Request Structure

```json
{
  "model": "~openai/gpt-latest",
  "messages": [
    {
      "role": "user",
      "content": "... see prompt template ..."
    }
  ],
  "max_completion_tokens": 500000,
  "reasoning": {
    "effort": "low",
    "exclude": true
  }
}
```

- `messages[0].content` embeds email metadata and a YAML-formatted list of categories with emoji and descriptions.
- `reasoning.effort: "low"` allocates roughly 20% of completion tokens to internal reasoning while keeping latency and cost reasonable for per-email summarization.
- `reasoning.exclude: true` omits reasoning tokens from `message.content` so existing newline parsing (`category:` / `summary:` / `actionItem:`) stays valid.
- Prompt guidelines emphasize:
  - Focus on new content in replies.
  - Choose category strictly from the provided list.
  - Prefix summary with the category emoji.
  - Emit `actionItem: None` when no critical action is required.

## Response Handling

- The code expects the completion to contain newline-separated `category: ...`, `summary: ...`, and `actionItem: ...` lines in `choices[0].message.content`.
- `summarizeEmails` splits the text by newline and extracts values by prefix matching.
- Emoji validation ensures the summary begins with one of the configured emojis; otherwise the summary is replaced with `⚠️ Invalid emoji detected. Please review.`

## Error Handling

- Missing `OPENROUTER_API_KEY` throws before any API calls with a message pointing to script properties.
- `fetchOpenRouterChatCompletion` uses `muteHttpExceptions` and validates the response before parsing `choices`.
- HTTP 429 and `{ error: { code: 429 } }` responses retry up to 3 times with a 2s delay between attempts.
- Other API errors throw with the OpenRouter message instead of failing on undefined `choices`.
- Per-email failures log `Failed to summarize email: <subject>. Error: <message>`; processing continues for remaining messages.

## Token Management

- `EMAIL_MAX_CONTENT_LENGTH` (`1_000_000`) controls message body size prior to API call.
- `OPENROUTER_MAX_TOKENS` (`500_000`) caps completion size via `max_completion_tokens`.

## Migration from OpenAI Direct

1. Create an OpenRouter API key at [openrouter.ai/keys](https://openrouter.ai/keys).
2. In Apps Script → Project Settings → Script properties, add `OPENROUTER_API_KEY`.
3. Remove the legacy `OPENAI_API_KEY` property.
4. Deploy updated code before the next scheduled run.

## Future Enhancements

- Capture structured JSON by requesting `response_format`. This would remove reliance on string parsing.
- Batch multiple emails per request to reduce API calls, if latency or cost becomes an issue.
