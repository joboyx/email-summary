# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Google Apps Script that automatically summarizes daily emails using OpenRouter (OpenAI-compatible chat completions) and sends a formatted summary to the user. The script categorizes emails, identifies action items, and can automatically archive threads and add labels based on configurable rules.

## Technology Stack

- **Runtime**: Google Apps Script (V8 runtime) ⚙️
- **Language**: TypeScript (compiled to JavaScript for Apps Script)
- **APIs**: Gmail API, OpenRouter API (`~openai/gpt-latest`), Google Script Services
- **Deployment**: Google clasp CLI tool
- **Node Version**: v22 (see `.nvmrc`)

## Key Components

### Core Architecture

- **Modular source layout**: TypeScript source lives under `src/`; `npm run build` emits Apps Script-compatible JavaScript to `dist/`; clasp `rootDir` points at `dist/`
- **Configuration-driven**: Debug flags at the top of `src/config.ts` control behavior
- **AI-powered Categorization**: Uses OpenRouter to categorize and summarize emails
- **Gmail Integration**: Uses Gmail API for email processing, archiving, and labeling

### Module Map (`src/` → `dist/` after build)

| File               | Responsibility                                                      |
| ------------------ | ------------------------------------------------------------------- |
| `types.d.ts`       | Shared interfaces (`EmailInput`, `EmailSummary`, OpenRouter shapes) |
| `config.ts`        | Side-effect flags, search limits, categories, OpenRouter constants  |
| `gmail-search.ts`  | Gmail search string builder and message retrieval                   |
| `openrouter.ts`    | OpenRouter API client and summarization prompt/parse logic          |
| `html-format.ts`   | Digest HTML builder and category legend                             |
| `gmail-actions.ts` | Send digest, archive threads, labels, label cache                   |
| `main.ts`          | Entry point: `summarizeAndSendDailyEmail` orchestration             |
| `appsscript.json`  | Manifest (timezone, scopes, runtime); copied to `dist/` on build    |

Apps Script loads all compiled `.js` files in `dist/` into a shared global namespace (`tsconfig` `module: "None"`). No duplicate function names across files.

### Email Processing Pipeline

1. **Email Retrieval**: Searches inbox for emails from the last N days
2. **AI Summarization**: Each email is processed by OpenRouter to generate category, summary, and action items
3. **Summary Generation**: Creates HTML-formatted email with categorized summaries
4. **Email Delivery**: Sends summary email to user
5. **Post-processing**: Archives threads and adds labels based on rules

### Configuration Constants

Key configuration variables at the top of `src/config.ts`:

- `EMAIL_SEND_ENABLED`: Controls email sending (set to `false` for testing)
- `EMAIL_ARCHIVE_ENABLED`: Controls automatic archiving
- `EMAIL_LABEL_ENABLED`: Controls label management
- `EMAIL_SEARCH_PREVIOUS_DAYS`: Number of days to look back for emails
- `EMAIL_SEARCH_RESULT_LIMIT`: Limit number of emails processed

## Development Commands

### Setup and Authentication

```bash
# Install Node.js version from .nvmrc
nvm install && nvm use

# Install dependencies
npm install

# Clasp: global (~/.clasprc.json) for push/pull/deploy, then local (./.clasprc.json) for clasp run
npm run setup
npm run auth:status
```

See `docs/clasp-auth.md` for dual-auth details and troubleshooting (`invalid_grant` usually means stale **global** creds — run `npm run setup:global`).

### Development Workflow

```bash
# Compile TypeScript to dist/
npm run build

# Run the main function directly (builds first)
npm start

# Local verification: lint with zero warnings, Jest (TypeScript tests), and build
npm test

# Deploy to Google Apps Script
npm run deploy

# Watch logs in terminal
npm run watch

# Watch logs in browser
npm run watch:open
```

### Deployment Management

```bash
# List all deployments
npm run deployments:list

# Clean up old deployments (keeps active and HEAD)
npm run deployments:cleanup
```

## Required Configuration Files

### `.clasp.json` (not in repo)

```json
{
  "projectId": "your-google-cloud-project-id",
  "scriptId": "your-apps-script-id",
  "rootDir": "path-to-project/dist"
}
```

### `credentials.json` (not in repo)

OAuth 2.0 credentials file from Google Cloud Console for desktop application.

### Script Properties

Set in Google Apps Script > Settings > Script properties:

- `OPENROUTER_API_KEY`: Your OpenRouter API key for GPT access via `~openai/gpt-latest`

## Email Categories System

The script uses a predefined categorization system with emojis:

- 📢 marketing: Promotional content, ads, special offers
- 👥 personal: Messages from family, friends, personal contacts
- 📱 social-media: Notifications from social platforms
- 💳 transactions: Purchase receipts, orders, subscriptions
- 💼 jobs: Job postings, recruiter emails
- 🚫 spam: Unwanted or junk emails
- 📰 newsletter: Subscriptions to newsletters and blogs
- 🛟 support: Customer service communications
- 🔔 notifications: System notifications and alerts

## Gmail Integration Features

### Search and Processing

- Searches inbox for recent emails (excludes previous summaries)
- Processes email content (truncated to `EMAIL_MAX_CONTENT_LENGTH`)
- Extracts thread and message IDs for operations

### Labeling System

- Creates hierarchical labels: `🤖 EmailSummary/⚠️ ActionRequired`
- Automatically applies labels to emails with action items
- Implements label caching for performance

### Archive Management

- Automatically archives processed emails (except personal category)
- Configurable categories to skip archiving via `EMAIL_CATEGORIES_SKIPPED_FOR_ARCHIVE`

## OpenRouter Integration

### AI Prompt Structure

The script sends structured prompts to OpenRouter with:

- Email subject and content
- Category definitions in YAML format
- Specific guidelines for categorization and action item detection
- Output format requirements

### Response Processing

- Parses AI response for category, summary, and action items
- Validates emoji usage in summaries
- Handles API errors gracefully with logging

## Automation Setup

### Time-based Trigger

Set up in Google Apps Script console:

1. Function: `summarizeAndSendDailyEmail`
2. Event source: Time-driven
3. Type: Day timer
4. Time: 5-6 AM (recommended)
5. Error Notification: `Notify me immediately`

Recreate this trigger after every deploy so it points at the latest deployment version. Trigger automation is not implemented yet.

### Deployment Tracking

- `package.json` includes `meta.activeDeploymentId` for deployment management
- Deployment scripts handle versioning and cleanup

## Development Notes

### Debugging

- Set debug flags to `false` for testing without side effects
- Use `console.log` statements throughout for debugging
- Gmail search strings are logged for verification

### Error Handling

- Main function returns success/error objects
- Individual email processing failures are logged but don't stop execution
- API errors are caught and logged with context

### Performance Considerations

- Email content is truncated to avoid token limits
- Label caching reduces API calls
- Batch processing of emails in single execution

## Time Zone Configuration

- Configured for Asia/Manila timezone in `src/appsscript.json`
- Date formatting uses ISO strings for consistency
