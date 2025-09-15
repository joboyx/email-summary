# Configuration Guide

## Overview

This guide covers all configuration options for the Email Summary system, including environment setup, runtime settings, and deployment configuration.

## Environment Setup

### Prerequisites

#### System Requirements
- **Node.js**: Version 22 (managed by `.nvmrc`)
- **npm**: Latest version
- **Google Account**: With Gmail access
- **OpenAI Account**: With API access and credits

#### Development Tools
- **clasp**: Google Apps Script CLI (`@google/clasp`)
- **Git**: Version control
- **VS Code**: Recommended editor (with dev container support)

### Local Development Setup

#### 1. Node.js Installation
```bash
# Install Node.js version from .nvmrc
nvm install
nvm use
```

#### 2. Dependencies Installation
```bash
# Install project dependencies
npm install
```

#### 3. Google Apps Script Authentication
```bash
# Login to Google Apps Script
npm run setup
# This creates .clasprc.json with authentication tokens
```

#### 4. Project Configuration
Create `.clasp.json` in project root:
```json
{
  "projectId": "your-google-cloud-project-id",
  "scriptId": "your-apps-script-script-id",
  "rootDir": "~/workspace/email-summary"
}
```

#### 5. OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable Gmail API
4. Create OAuth 2.0 credentials (Desktop application)
5. Download `credentials.json` to project root

### Google Apps Script Configuration

#### Script Properties
Set the following in Google Apps Script > Settings > Script properties:
- **OPENAI_API_KEY**: Your OpenAI API key

#### OAuth Scopes
The following scopes are automatically configured in `appsscript.json`:
```json
{
  "oauthScopes": [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/script.external_request",
    "https://www.googleapis.com/auth/script.send_mail",
    "https://www.googleapis.com/auth/script.scriptapp"
  ]
}
```

#### Time Zone Configuration
Set in `appsscript.json`:
```json
{
  "timeZone": "Asia/Manila"
}
```

## Runtime Configuration

### Debug Flags

#### EMAIL_SEND_ENABLED
**Type:** `boolean`
**Default:** `true`
**Description:** Controls whether summary emails are sent to the user
**Usage:**
```javascript
const EMAIL_SEND_ENABLED = true; // Production
const EMAIL_SEND_ENABLED = false; // Testing/debugging
```

#### EMAIL_ARCHIVE_ENABLED
**Type:** `boolean`
**Default:** `true`
**Description:** Controls whether processed emails are archived
**Usage:**
```javascript
const EMAIL_ARCHIVE_ENABLED = true; // Production
const EMAIL_ARCHIVE_ENABLED = false; // Testing/debugging
```

#### EMAIL_LABEL_ENABLED
**Type:** `boolean`
**Default:** `true`
**Description:** Controls whether labels are applied to emails
**Usage:**
```javascript
const EMAIL_LABEL_ENABLED = true; // Production
const EMAIL_LABEL_ENABLED = false; // Testing/debugging
```

### Search Configuration

#### EMAIL_SEARCH_PREVIOUS_DAYS
**Type:** `number`
**Default:** `1`
**Description:** Number of days to look back for emails
**Valid Range:** 1-30
**Usage:**
```javascript
const EMAIL_SEARCH_PREVIOUS_DAYS = 1; // Yesterday only
const EMAIL_SEARCH_PREVIOUS_DAYS = 7; // Last week
```

#### EMAIL_SEARCH_RESULT_LIMIT
**Type:** `number | undefined`
**Default:** `undefined`
**Description:** Maximum number of emails to process (undefined = no limit)
**Usage:**
```javascript
const EMAIL_SEARCH_RESULT_LIMIT = undefined; // Process all
const EMAIL_SEARCH_RESULT_LIMIT = 50; // Limit to 50 emails
```

### Content Processing

#### EMAIL_MAX_CONTENT_LENGTH
**Type:** `number`
**Default:** `500000`
**Description:** Maximum email content length to process (characters)
**Purpose:** Prevents token limit issues with OpenAI API
**Usage:**
```javascript
const EMAIL_MAX_CONTENT_LENGTH = 500000; // Default
const EMAIL_MAX_CONTENT_LENGTH = 100000; // Reduced for cost savings
```

### Archive Rules

#### EMAIL_CATEGORIES_SKIPPED_FOR_ARCHIVE
**Type:** `Array<string>`
**Default:** `["personal"]`
**Description:** Email categories to exclude from automatic archiving
**Usage:**
```javascript
const EMAIL_CATEGORIES_SKIPPED_FOR_ARCHIVE = ["personal"];
const EMAIL_CATEGORIES_SKIPPED_FOR_ARCHIVE = ["personal", "support"];
```

### Label Configuration

#### EMAIL_LABEL_ROOT
**Type:** `string`
**Default:** `"🤖 EmailSummary"`
**Description:** Root label for all email summary labels
**Usage:**
```javascript
const EMAIL_LABEL_ROOT = "🤖 EmailSummary";
```

#### EMAIL_LABEL_ACTION_REQUIRED
**Type:** `string`
**Default:** `"🤖 EmailSummary/⚠️ ActionRequired"`
**Description:** Label applied to emails with action items
**Usage:**
```javascript
const EMAIL_LABEL_ACTION_REQUIRED = `${EMAIL_LABEL_ROOT}/⚠️ ActionRequired`;
```

### Email Settings

#### EMAIL_RECIPIENT
**Type:** `string`
**Default:** `Session.getActiveUser().getEmail()`
**Description:** Email address to receive summaries
**Note:** Automatically set to the script owner's email

#### EMAIL_SUBJECT
**Type:** `string`
**Default:** `"📝 Daily Email Summary for [current-date]"`
**Description:** Subject line for summary emails
**Usage:**
```javascript
const EMAIL_SUBJECT = `📝 Daily Email Summary for ${new Date().toISOString().split('T')[0]}`;
```

### OpenAI Configuration

#### OPENAI_API_URL
**Type:** `string`
**Default:** `"https://api.openai.com/v1/chat/completions"`
**Description:** OpenAI API endpoint URL
**Note:** Should not be changed for standard usage

#### OPENAI_API_KEY
**Type:** `string`
**Default:** Retrieved from script properties
**Description:** OpenAI API key for authentication
**Setup:**
1. Get API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add to Google Apps Script > Settings > Script properties
3. Key name: `OPENAI_API_KEY`

#### OPENAI_MODEL
**Type:** `string`
**Default:** `"gpt-5"`
**Description:** OpenAI model to use for email processing
**Available Options:**
- `"gpt-4"` - More accurate but expensive
- `"gpt-3.5-turbo"` - Faster and cheaper
- `"gpt-5"` - Latest model (if available)

#### OPENAI_MAX_TOKENS
**Type:** `number`
**Default:** `50000`
**Description:** Maximum tokens for OpenAI API response
**Usage:**
```javascript
const OPENAI_MAX_TOKENS = 50000; // Default
const OPENAI_MAX_TOKENS = 10000; // Reduced for cost control
```

## Category Configuration

### EMAIL_CATEGORIES
**Type:** `Array<CategoryDefinition>`
**Default:**
```javascript
const EMAIL_CATEGORIES = [
  { name: "marketing", emoji: "📢", description: "Promotional content, ads, special offers" },
  { name: "personal", emoji: "👥", description: "Messages from family, friends, personal contacts" },
  { name: "social-media", emoji: "📱", description: "Notifications from social platforms" },
  { name: "transactions", emoji: "💳", description: "Purchase receipts, orders, subscriptions" },
  { name: "jobs", emoji: "💼", description: "Job postings, recruiter emails" },
  { name: "spam", emoji: "🚫", description: "Unwanted or junk emails" },
  { name: "newsletter", emoji: "📰", description: "Subscriptions to newsletters and blogs" },
  { name: "support", emoji: "🛟", description: "Customer service communications" },
  { name: "notifications", emoji: "🔔", description: "System notifications and alerts" }
];
```

### Adding Custom Categories
To add a new category:
1. Add to `EMAIL_CATEGORIES` array
2. Include unique emoji and descriptive name
3. Update archive rules if needed
4. Test categorization with sample emails

**Example:**
```javascript
const EMAIL_CATEGORIES = [
  // ... existing categories
  { name: "finance", emoji: "💰", description: "Financial reports and statements" }
];
```

## Deployment Configuration

### Development vs Production Settings

#### Development Configuration
```javascript
// Debug flags for testing
const EMAIL_SEND_ENABLED = false;
const EMAIL_ARCHIVE_ENABLED = false;
const EMAIL_LABEL_ENABLED = false;

// Limited processing for testing
const EMAIL_SEARCH_PREVIOUS_DAYS = 1;
const EMAIL_SEARCH_RESULT_LIMIT = 10;
```

#### Production Configuration
```javascript
// Enable all features
const EMAIL_SEND_ENABLED = true;
const EMAIL_ARCHIVE_ENABLED = true;
const EMAIL_LABEL_ENABLED = true;

// Full processing
const EMAIL_SEARCH_PREVIOUS_DAYS = 1;
const EMAIL_SEARCH_RESULT_LIMIT = undefined;
```

### Environment-Specific Files

#### .clasp.json (Development)
```json
{
  "projectId": "your-dev-project-id",
  "scriptId": "your-dev-script-id",
  "rootDir": "~/workspace/email-summary"
}
```

#### .clasp.json (Production)
```json
{
  "projectId": "your-prod-project-id",
  "scriptId": "your-prod-script-id",
  "rootDir": "~/workspace/email-summary"
}
```

## Automation Setup

### Time-Based Triggers

#### Setting Up Triggers
1. Deploy script to Google Apps Script
2. Open [Google Apps Script Editor](https://script.google.com/)
3. Go to Triggers (clock icon)
4. Click "Add Trigger"
5. Configure:
   - **Function:** `summarizeAndSendDailyEmail`
   - **Event Source:** Time-driven
   - **Type:** Day timer
   - **Time:** 5-6 AM (recommended)
   - **Failure Notification:** Notify me immediately

#### Multiple Triggers
You can set up multiple triggers for different times:
- Primary: 6:00 AM (main processing)
- Backup: 8:00 AM (if primary fails)
- Weekend: Different schedule if needed

### Monitoring Triggers
- Check execution logs in Apps Script dashboard
- Monitor failure notifications
- Review execution history for performance

## Validation and Testing

### Configuration Validation
Before deployment, verify:
- ✅ All required API keys are set
- ✅ OAuth scopes are correct
- ✅ Debug flags match environment
- ✅ Email limits are appropriate
- ✅ Category definitions are valid

### Testing Checklist
- [ ] Run with debug flags disabled
- [ ] Test email sending (check spam folder)
- [ ] Verify archiving behavior
- [ ] Check label creation
- [ ] Validate OpenAI API responses
- [ ] Test with various email types

## Troubleshooting Configuration

### Common Issues

#### Authentication Problems
**Symptom:** "Authentication failed"
**Solution:**
- Re-run `npm run setup`
- Check `.clasprc.json` exists
- Verify Google account permissions

#### API Key Issues
**Symptom:** "Invalid API key"
**Solution:**
- Check script properties in Apps Script editor
- Verify OpenAI API key is valid
- Ensure key has sufficient credits

#### Permission Errors
**Symptom:** "Insufficient permissions"
**Solution:**
- Review OAuth scopes in `appsscript.json`
- Re-authorize the script
- Check Gmail API is enabled

#### Configuration Not Applied
**Symptom:** Changes not taking effect
**Solution:**
- Redeploy after configuration changes
- Clear browser cache
- Check for syntax errors in Code.js

## Advanced Configuration

### Custom Search Filters
Modify email search behavior:
```javascript
// Exclude specific senders
const searchString = `in:inbox ${getSearchStringForLastNDays(EMAIL_SEARCH_PREVIOUS_DAYS)} -from:newsletter@example.com`;

// Include only specific labels
const searchString = `in:inbox label:important ${getSearchStringForLastNDays(EMAIL_SEARCH_PREVIOUS_DAYS)}`;
```

### Performance Tuning
```javascript
// Reduce API costs
const EMAIL_MAX_CONTENT_LENGTH = 100000;
const OPENAI_MAX_TOKENS = 10000;

// Increase processing speed
const EMAIL_SEARCH_RESULT_LIMIT = 25;
```

### Custom Email Templates
Modify `formatSummariesAsHTML()` function to customize:
- CSS styling
- Layout structure
- Content organization
- Branding elements

## Backup and Recovery

### Configuration Backup
- Keep `.clasp.json` in version control (without sensitive data)
- Document script properties separately
- Backup OAuth credentials securely

### Recovery Procedures
1. Restore from version control
2. Reconfigure script properties
3. Re-authorize OAuth if needed
4. Test configuration before deployment

## Security Best Practices

### API Key Management
- Store OpenAI key in script properties only
- Never commit API keys to version control
- Rotate keys periodically
- Monitor API usage for unauthorized access

### Access Control
- Limit script access to owner only
- Use minimal required OAuth scopes
- Regularly review account permissions
- Enable 2FA on Google account

### Data Protection
- Process emails temporarily only
- Don't store email content persistently
- Use HTTPS for all external communications
- Clear logs regularly if sensitive data is logged