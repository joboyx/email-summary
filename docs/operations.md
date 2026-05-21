# Operations Guide

## Daily Monitoring
- **Digest delivery**: Confirm receipt of `📝 Daily Email Summary for <date>` email. Missing emails may indicate trigger issues or API failures.
- **Logs**: Review Apps Script execution logs via `npm run watch` (stream in terminal) or `npm run watch:open` (browser). Look for `Error in summarizeAndSendDailyEmail` entries or OpenRouter call failures.

## Troubleshooting Workflow
1. Check Apps Script dashboard for failed executions and error messages.
2. Run `npm start` locally to reproduce issues with live data.
3. Verify status of Gmail quota and OpenRouter usage/credits.
4. Inspect script properties to ensure `OPENROUTER_API_KEY` remains valid.
5. Review `docs/troubleshooting.md` for issue-specific remediation steps.

## Quotas & Limits
- **Apps Script**: Execution time per trigger, Gmail daily send quota, Gmail read/modify API limits.
- **OpenRouter**: Token throughput and rate limits; request is sized for individual emails, so throughput depends on inbox volume. The `~openai/gpt-latest` alias target may change without a code deploy—review usage after major GPT releases.

## Maintenance Tasks
- Rotate `OPENROUTER_API_KEY` periodically and update script properties accordingly.
- Audit Gmail labels to ensure `🤖 EmailSummary` hierarchy remains clean; remove obsolete labels if action item taxonomy changes.
- Review `EMAIL_CATEGORIES` list and update prompt/legend if new categories are required.

## Incident Response
- Failed OpenRouter responses are logged but skipped; monitor for repeated failures, which may result in missing summaries.
- Emoji validation warnings indicate taxonomy mismatches. If frequent, adjust prompt or `EMAIL_CATEGORIES` definitions.
- If Gmail archiving misbehaves, temporarily disable `EMAIL_ARCHIVE_ENABLED` to halt state changes while investigating.

## Access Control
- Execution API access is limited to the owner (`executionApi.access: MYSELF`). For collaboration, add additional editors in Apps Script and share credentials securely.

## Backups & Versioning
- Source controlled locally; ensure `clasp push` runs from a clean git state.
- Use `docs/changelog.md` to record meaningful changes or configuration updates for future maintainers.
