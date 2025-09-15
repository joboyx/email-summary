# API Reference

## Overview

This document provides comprehensive reference for all functions, external APIs, and data structures used in the Email Summary system.

## Internal Functions

### Core Functions

#### `summarizeAndSendDailyEmail()`
Main orchestration function that coordinates the entire email processing pipeline.

**Parameters:** None

**Returns:**
```javascript
{
  success: boolean,
  message: string
}
```

**Behavior:**
1. Retrieves previous day emails
2. Summarizes emails using AI
3. Formats HTML summary
4. Sends summary email
5. Archives threads
6. Applies labels

**Error Handling:** Returns error status and message on failure

---

#### `getPreviousDayEmails()`
Retrieves emails from Gmail inbox based on configured search parameters.

**Parameters:** None (uses global constants)

**Returns:** `Array<EmailObject>`

**Behavior:**
- Constructs Gmail search string for specified date range
- Excludes previously sent summary emails
- Processes threads and extracts message data
- Applies result limits if configured

**Dependencies:** `GmailApp.search()`, `getSearchStringForLastNDays()`

---

#### `summarizeEmails(emails)`
Processes each email through OpenAI API for categorization and summarization.

**Parameters:**
- `emails: Array<EmailObject>` - Array of email objects to process

**Returns:** `Array<SummaryObject>`

**Behavior:**
- Iterates through each email
- Constructs OpenAI prompt with email content and category definitions
- Sends request to OpenAI API
- Parses and validates response
- Sorts results by category and date

**Dependencies:** `UrlFetchApp.fetch()`, OpenAI API

---

#### `formatSummariesAsHTML(summaries)`
Creates HTML-formatted email summary from processed email data.

**Parameters:**
- `summaries: Array<SummaryObject>` - Array of summarized email objects

**Returns:** `string` - HTML content for email

**Behavior:**
- Groups emails by category
- Creates responsive HTML table layout
- Highlights action items
- Includes category legend
- Adds links to original emails

**Dependencies:** None (pure JavaScript)

---

#### `sendSummaryEmail(formattedSummary)`
Sends the formatted HTML summary to the user.

**Parameters:**
- `formattedSummary: string` - HTML content to send

**Returns:** `void`

**Behavior:**
- Checks `EMAIL_SEND_ENABLED` flag
- Constructs email with subject and HTML body
- Sends via Gmail API

**Dependencies:** `MailApp.sendEmail()`

---

#### `archiveThreads(emails)`
Moves processed email threads to archive based on category rules.

**Parameters:**
- `emails: Array<SummaryObject>` - Array of processed emails

**Returns:** `void`

**Behavior:**
- Checks `EMAIL_ARCHIVE_ENABLED` flag
- Applies category-based archive rules
- Skips categories in `EMAIL_CATEGORIES_SKIPPED_FOR_ARCHIVE`
- Logs archive operations

**Dependencies:** `GmailApp.moveThreadToArchive()`

---

#### `addLabels(emails)`
Applies Gmail labels to emails with action items.

**Parameters:**
- `emails: Array<SummaryObject>` - Array of processed emails

**Returns:** `void`

**Behavior:**
- Checks `EMAIL_LABEL_ENABLED` flag
- Identifies emails with action items
- Creates hierarchical labels if needed
- Uses label caching for performance

**Dependencies:** `getOrCreateLabel()`, Gmail API

### Utility Functions

#### `getSearchStringForLastNDays(n)`
Generates Gmail search string for emails from last N days.

**Parameters:**
- `n: number` - Number of days to look back

**Returns:** `string` - Gmail search string (e.g., "after:2024/01/01")

**Behavior:**
- Calculates date N days ago
- Formats as YYYY/MM/DD
- Returns Gmail-compatible search string

---

#### `getOrCreateLabel(labelName)`
Retrieves or creates Gmail labels with caching.

**Parameters:**
- `labelName: string` - Label name (supports hierarchy with "/")

**Returns:** `GmailLabel` - Gmail label object

**Behavior:**
- Checks label cache first
- Creates hierarchical labels as needed
- Updates cache for performance

**Dependencies:** `GmailApp.getUserLabelByName()`, `GmailApp.createLabel()`

---

#### `explainEmail(email)`
Creates human-readable description of email for logging.

**Parameters:**
- `email: EmailObject | SummaryObject` - Email object

**Returns:** `string` - Formatted description

**Behavior:**
- Formats key email properties
- Used for logging and debugging

## Data Structures

### EmailObject
```javascript
{
  threadId: string,      // Gmail thread identifier
  messageId: string,     // Gmail message identifier
  messageDate: string,   // ISO date string
  from: string,          // Sender email address
  subject: string,       // Email subject line
  content: string,       // Email body (truncated)
  link: string           // Gmail permalink
}
```

### SummaryObject
```javascript
{
  ...EmailObject,        // All EmailObject properties
  summary: string,       // AI-generated summary with emoji
  category: string,      // Email category name
  actionItem: string     // Action item or "None"
}
```

### CategoryDefinition
```javascript
{
  name: string,          // Category identifier
  emoji: string,         // Display emoji
  description: string    // Category description
}
```

## External APIs

### Google Apps Script Services

#### Gmail API (`GmailApp`)
- **Purpose:** Email retrieval, archiving, and labeling operations
- **Key Methods:**
  - `search(query)` - Search emails with Gmail query syntax
  - `getThreadById(id)` - Retrieve thread by ID
  - `moveThreadToArchive(thread)` - Archive email thread
  - `createLabel(name)` - Create new Gmail label
  - `getUserLabelByName(name)` - Retrieve existing label

#### Mail Service (`MailApp`)
- **Purpose:** Sending emails from the script
- **Key Methods:**
  - `sendEmail(options)` - Send email with HTML content

#### URL Fetch Service (`UrlFetchApp`)
- **Purpose:** Making HTTP requests to external APIs
- **Key Methods:**
  - `fetch(url, options)` - Make HTTP request

#### Properties Service (`PropertiesService`)
- **Purpose:** Storing script configuration and secrets
- **Key Methods:**
  - `getScriptProperties().getProperty(key)` - Retrieve stored value

### OpenAI API

#### Endpoint
- **URL:** `https://api.openai.com/v1/chat/completions`
- **Method:** POST
- **Authentication:** Bearer token (API key)

#### Request Format
```javascript
{
  model: string,              // Model identifier (e.g., "gpt-5")
  messages: Array<Message>,   // Conversation messages
  max_completion_tokens: number // Token limit
}
```

#### Message Format
```javascript
{
  role: "user",              // Message role
  content: string            // Message content
}
```

#### Response Format
```javascript
{
  choices: Array<{
    message: {
      content: string        // AI response content
    }
  }>
}
```

#### Prompt Structure
The system sends structured prompts containing:
- Email subject, sender, and content
- Category definitions in YAML format
- Specific guidelines for categorization
- Action item detection criteria
- Output format requirements

## Configuration Constants

### Debug Flags
```javascript
const EMAIL_SEND_ENABLED = true;        // Controls email sending
const EMAIL_ARCHIVE_ENABLED = true;     // Controls archiving
const EMAIL_LABEL_ENABLED = true;       // Controls labeling
```

### Search Parameters
```javascript
const EMAIL_SEARCH_PREVIOUS_DAYS = 1;   // Days to look back
const EMAIL_SEARCH_RESULT_LIMIT = undefined; // Email limit (undefined = no limit)
```

### Content Limits
```javascript
const EMAIL_MAX_CONTENT_LENGTH = 500000; // Content truncation limit
```

### Archive Rules
```javascript
const EMAIL_CATEGORIES_SKIPPED_FOR_ARCHIVE = ["personal"];
```

### Label Configuration
```javascript
const EMAIL_LABEL_ROOT = "🤖 EmailSummary";
const EMAIL_LABEL_ACTION_REQUIRED = `${EMAIL_LABEL_ROOT}/⚠️ ActionRequired`;
```

### Email Settings
```javascript
const EMAIL_RECIPIENT = Session.getActiveUser().getEmail();
const EMAIL_SUBJECT = `📝 Daily Email Summary for ${new Date().toISOString().split('T')[0]}`;
```

### OpenAI Configuration
```javascript
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_API_KEY = PropertiesService.getScriptProperties().getProperty("OPENAI_API_KEY");
const OPENAI_MODEL = "gpt-5";
const OPENAI_MAX_TOKENS = 50000;
```

### Category Definitions
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

## Error Handling

### Function Return Patterns
- **Success:** `{ success: true, message: "..." }`
- **Failure:** `{ success: false, message: "Error description" }`

### Exception Handling
- Individual email processing failures don't stop the entire pipeline
- API errors are logged but allow continuation
- Network failures trigger retry logic where applicable

### Logging
- All operations are logged using `console.log()`
- Errors include context and stack traces
- Email processing includes thread/message IDs for debugging

## Performance Considerations

### Optimization Techniques
- **Label Caching:** `labelCache` object prevents redundant API calls
- **Content Truncation:** Limits email content to reduce API costs
- **Batch Processing:** Processes multiple emails in single execution
- **Search Optimization:** Efficient Gmail query construction

### Resource Limits
- **Execution Time:** 6-minute Apps Script timeout
- **API Quotas:** Gmail and OpenAI rate limits
- **Memory:** Apps Script memory constraints
- **Email Size:** Gmail content limits

## Security Considerations

### Authentication
- OAuth 2.0 for Google services
- API keys stored securely in script properties
- Minimal required permission scopes

### Data Protection
- HTTPS encryption for all external API calls
- Temporary processing of email content
- No persistent storage of email data
- User-specific processing scope