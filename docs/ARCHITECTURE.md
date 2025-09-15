# Architecture

## Overview

The Email Summary system is a Google Apps Script application that automatically processes daily emails, categorizes them using AI, and sends formatted summaries to users. The system integrates with Gmail and OpenAI APIs to provide intelligent email management.

## System Architecture

### High-Level Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Gmail Inbox   │───▶│ Email Processor │───▶│   AI Summarizer │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Email Archive │    │   Label Manager │    │ Summary Email   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Core Components

#### 1. Email Retrieval (`getPreviousDayEmails()`)
- **Purpose**: Fetches emails from Gmail inbox based on configurable time windows
- **Input**: Gmail search parameters (date range, exclusions)
- **Output**: Array of email objects with metadata
- **Dependencies**: Gmail API (`GmailApp.search()`)

#### 2. AI Processing (`summarizeEmails()`)
- **Purpose**: Processes each email through OpenAI API for categorization and summarization
- **Input**: Email content, subject, sender information
- **Output**: Categorized and summarized email data
- **Dependencies**: OpenAI API (`UrlFetchApp.fetch()`)

#### 3. Summary Generation (`formatSummariesAsHTML()`)
- **Purpose**: Creates HTML-formatted email summaries
- **Input**: Processed email data with categories and action items
- **Output**: HTML email content
- **Dependencies**: None (pure JavaScript)

#### 4. Email Delivery (`sendSummaryEmail()`)
- **Purpose**: Sends formatted summary to user
- **Input**: HTML content and recipient information
- **Output**: Email sent to user's inbox
- **Dependencies**: Gmail API (`MailApp.sendEmail()`)

#### 5. Post-Processing (`archiveThreads()`, `addLabels()`)
- **Purpose**: Organizes processed emails in Gmail
- **Input**: Email metadata and processing results
- **Output**: Archived threads and applied labels
- **Dependencies**: Gmail API (`GmailApp.moveThreadToArchive()`, `GmailApp.createLabel()`)

## Data Flow

### Processing Pipeline

1. **Trigger Activation**
   - Time-based trigger executes `summarizeAndSendDailyEmail()`
   - Configurable execution time (default: 5-6 AM)

2. **Email Collection**
   ```
   Gmail Search ──▶ Filter Messages ──▶ Extract Content ──▶ Email Array
   ```

3. **AI Processing Loop**
   ```
   For Each Email:
   ├── Build OpenAI Prompt
   ├── Send to OpenAI API
   ├── Parse Response
   ├── Validate Categories
   └── Add to Summaries Array
   ```

4. **Summary Generation**
   ```
   Sort by Category ──▶ Format HTML ──▶ Add Metadata ──▶ Final Summary
   ```

5. **Distribution & Organization**
   ```
   Send Email ──▶ Archive Threads ──▶ Apply Labels ──▶ Complete
   ```

## Data Structures

### Email Object
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

### Summary Object
```javascript
{
  ...email,              // Original email data
  summary: string,       // AI-generated summary with emoji
  category: string,      // Email category name
  actionItem: string     // Action item or "None"
}
```

### Category Definition
```javascript
{
  name: string,          // Category identifier
  emoji: string,         // Display emoji
  description: string    // Category description
}
```

## External Dependencies

### Google Services
- **Gmail API**: Email retrieval, archiving, labeling
- **Apps Script Services**:
  - `GmailApp`: Gmail operations
  - `MailApp`: Email sending
  - `UrlFetchApp`: HTTP requests
  - `PropertiesService`: Configuration storage

### Third-Party Services
- **OpenAI API**: AI-powered email categorization and summarization
- **Google Cloud Platform**: OAuth authentication, Apps Script runtime

## Configuration Architecture

### Runtime Configuration
- **Debug Flags**: Control email sending, archiving, labeling
- **Search Parameters**: Date ranges, result limits
- **Content Limits**: Email truncation settings
- **Category Rules**: Archive exclusions, label triggers

### Environment Configuration
- **OAuth Scopes**: Gmail access permissions
- **API Keys**: OpenAI authentication
- **Project Settings**: Script ID, timezone

## Error Handling Architecture

### Error Types
- **API Errors**: OpenAI or Gmail API failures
- **Authentication Errors**: Invalid credentials or permissions
- **Network Errors**: Connectivity issues
- **Data Errors**: Malformed email content or responses

### Error Recovery
- **Graceful Degradation**: Continue processing other emails on individual failures
- **Logging**: Comprehensive error logging for debugging
- **Retry Logic**: Automatic retries for transient failures
- **Fallback Behavior**: Default values for missing data

## Performance Considerations

### Optimization Strategies
- **Email Truncation**: Limit content size to reduce API costs
- **Batch Processing**: Process multiple emails in single execution
- **Label Caching**: Cache Gmail labels to reduce API calls
- **Search Optimization**: Efficient Gmail search queries

### Resource Limits
- **Execution Time**: Apps Script 6-minute timeout
- **API Quotas**: Gmail and OpenAI rate limits
- **Memory Limits**: Apps Script memory constraints
- **Email Size**: Gmail attachment and content limits

## Security Architecture

### Authentication
- **OAuth 2.0**: Google account authentication
- **API Keys**: Secure storage in script properties
- **Scope Limitations**: Minimal required permissions

### Data Protection
- **Encryption**: HTTPS for all external communications
- **Access Control**: User-specific email processing
- **Data Minimization**: Only process necessary email content

## Deployment Architecture

### Development Environment
- **Local Development**: Node.js with clasp CLI
- **Version Control**: Git-based source management
- **Testing**: Local execution and validation

### Production Environment
- **Google Apps Script**: Server-side execution
- **Version Management**: Deployment versioning
- **Monitoring**: Execution logs and error tracking

## Future Extensibility

### Modular Design
- **Single File Structure**: Easy maintenance and deployment
- **Configuration-Driven**: Behavior changes without code modifications
- **API Abstraction**: Clear separation of concerns

### Enhancement Points
- **Additional AI Models**: Support for different LLM providers
- **Custom Categories**: User-defined categorization rules
- **Advanced Filtering**: More sophisticated email selection
- **Integration APIs**: Webhook support for external systems