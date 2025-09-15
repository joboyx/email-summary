# Troubleshooting Guide

## Overview

This guide provides solutions for common issues encountered with the Email Summary system, including error diagnosis, debugging procedures, and preventive measures.

## Quick Diagnosis

### System Health Check

#### Check Execution Status
```bash
# View recent executions
npm run watch

# Check for errors in logs
npm run watch | grep -i error

# Verify deployment status
npx clasp deployments
```

#### Test Basic Functionality
```bash
# Test script execution
npm start

# Check Gmail permissions
# Verify OpenAI API key
# Confirm email delivery
```

### Common Symptoms and Solutions

#### No Summary Email Received
**Possible Causes:**
- Script execution failed
- Email sending disabled
- Gmail filters blocking email
- Authentication issues

**Diagnostic Steps:**
1. Check execution logs for errors
2. Verify `EMAIL_SEND_ENABLED = true`
3. Check spam/junk folder
4. Test manual execution

#### Emails Not Being Processed
**Possible Causes:**
- Gmail search returning no results
- Email content too large
- API rate limits exceeded
- Authentication failures

**Diagnostic Steps:**
1. Log Gmail search string
2. Check email dates and filters
3. Verify API quotas
4. Test with smaller email set

#### Incorrect Categorization
**Possible Causes:**
- OpenAI API issues
- Prompt structure problems
- Category definitions unclear
- Content parsing errors

**Diagnostic Steps:**
1. Check OpenAI API responses
2. Review prompt structure
3. Test with sample emails
4. Verify category definitions

## Error Types and Solutions

### Authentication Errors

#### OAuth Authentication Failed
**Error Message:** "Authentication failed" or "Permission denied"

**Solutions:**
```bash
# Re-authenticate with Google
rm .clasprc.json
npm run setup

# Check OAuth scopes in appsscript.json
# Verify Google Cloud project permissions
# Confirm Gmail API is enabled
```

#### OpenAI API Key Invalid
**Error Message:** "Invalid API key" or "Authentication failed"

**Solutions:**
- Check script properties in Apps Script editor
- Verify API key format and validity
- Ensure key has sufficient credits
- Rotate API key if compromised

### API Errors

#### Gmail API Errors

**Rate Limit Exceeded:**
```
Error: Gmail API quota exceeded
```
**Solutions:**
- Reduce `EMAIL_SEARCH_RESULT_LIMIT`
- Implement exponential backoff
- Process emails in batches
- Monitor API usage dashboard

**Permission Denied:**
```
Error: Insufficient permissions
```
**Solutions:**
- Check OAuth scopes
- Re-authorize the application
- Verify Gmail API is enabled
- Confirm account has Gmail access

#### OpenAI API Errors

**Token Limit Exceeded:**
```
Error: Maximum token limit reached
```
**Solutions:**
- Reduce `EMAIL_MAX_CONTENT_LENGTH`
- Truncate email content earlier
- Use smaller OpenAI models
- Process emails individually

**Rate Limit Exceeded:**
```
Error: OpenAI API rate limit exceeded
```
**Solutions:**
- Implement request throttling
- Add delays between API calls
- Monitor usage patterns
- Upgrade OpenAI plan if needed

**Invalid Response:**
```
Error: Unexpected API response format
```
**Solutions:**
- Check API model availability
- Verify prompt structure
- Handle API changes gracefully
- Implement response validation

### Execution Errors

#### Script Timeout
**Error Message:** "Script execution timed out"

**Solutions:**
- Reduce `EMAIL_SEARCH_RESULT_LIMIT`
- Optimize processing loops
- Implement batch processing
- Cache frequently used data

#### Memory Limit Exceeded
**Error Message:** "Memory limit exceeded"

**Solutions:**
- Process fewer emails at once
- Clear unused variables
- Use streaming for large data
- Optimize data structures

#### Syntax Errors
**Error Message:** "SyntaxError" or "ReferenceError"

**Solutions:**
- Check JavaScript syntax in Code.js
- Verify variable declarations
- Test with Node.js locally
- Use Apps Script linter

### Data Processing Errors

#### Email Parsing Issues
**Symptoms:** Incorrect email content or missing data

**Solutions:**
- Check email format handling
- Verify content extraction logic
- Handle special characters
- Test with various email types

#### Date Processing Errors
**Symptoms:** Incorrect date filtering or timezone issues

**Solutions:**
- Verify timezone settings in appsscript.json
- Check date format parsing
- Test with different date ranges
- Handle daylight saving time

## Debugging Procedures

### Enable Debug Mode

#### Temporary Debug Configuration
```javascript
// Code.js - Top of file
const EMAIL_SEND_ENABLED = false;        // Disable email sending
const EMAIL_ARCHIVE_ENABLED = false;     // Disable archiving
const EMAIL_LABEL_ENABLED = false;       // Disable labeling
const EMAIL_SEARCH_RESULT_LIMIT = 5;     // Limit processing
```

#### Logging Configuration
```javascript
// Add detailed logging
console.log("=== DEBUG START ===");
console.log("Email count:", emails.length);
console.log("Search string:", searchString);
console.log("First email:", JSON.stringify(emails[0], null, 2));
console.log("=== DEBUG END ===");
```

### Step-by-Step Debugging

#### 1. Test Gmail Integration
```javascript
// Test Gmail search
function testGmailSearch() {
  const searchString = "in:inbox newer_than:1d";
  const threads = GmailApp.search(searchString);
  console.log("Found threads:", threads.length);

  threads.forEach(thread => {
    console.log("Thread:", thread.getFirstMessageSubject());
  });
}
```

#### 2. Test OpenAI Integration
```javascript
// Test OpenAI API
function testOpenAI() {
  const payload = {
    model: OPENAI_MODEL,
    messages: [{ role: "user", content: "Test message" }],
    max_completion_tokens: 100
  };

  try {
    const response = UrlFetchApp.fetch(OPENAI_API_URL, {
      method: "post",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
      payload: JSON.stringify(payload)
    });
    console.log("OpenAI test successful");
  } catch (error) {
    console.error("OpenAI test failed:", error);
  }
}
```

#### 3. Test Email Processing
```javascript
// Test email processing pipeline
function testEmailProcessing() {
  const testEmail = {
    subject: "Test Subject",
    from: "test@example.com",
    content: "Test content for processing"
  };

  const result = summarizeEmails([testEmail]);
  console.log("Processing result:", result);
}
```

### Log Analysis

#### View Execution Logs
```bash
# Real-time log monitoring
npm run watch

# Filter for specific content
npm run watch | grep "ERROR"
npm run watch | grep "Processing"

# Save logs for analysis
npm run watch > execution_log.txt
```

#### Common Log Patterns

**Successful Execution:**
```
Starting email processing...
Found 15 emails
Processing email: Subject line here
OpenAI API call successful
Summary generated: 📢 Marketing Summary...
Email sent successfully
Execution completed successfully
```

**Error Patterns:**
```
Authentication failed
API quota exceeded
Script execution timed out
Invalid email format
OpenAI API error: 429
```

### Performance Debugging

#### Execution Time Analysis
```javascript
// Add timing measurements
const startTime = new Date();

console.log("Starting processing...");
// ... processing code ...

const endTime = new Date();
const duration = endTime - startTime;
console.log(`Processing completed in ${duration}ms`);

if (duration > 300000) { // 5 minutes
  console.warn("Execution time exceeded 5 minutes");
}
```

#### Memory Usage Monitoring
```javascript
// Monitor memory-intensive operations
console.log("Processing", emails.length, "emails");
console.log("Total content size:", emails.reduce((sum, e) => sum + e.content.length, 0));

if (emails.length > 50) {
  console.warn("Processing large email batch, consider reducing limit");
}
```

#### API Usage Tracking
```javascript
// Track API calls
let apiCallCount = 0;
let totalTokens = 0;

function trackAPICall(tokens) {
  apiCallCount++;
  totalTokens += tokens;
  console.log(`API Call ${apiCallCount}: ${tokens} tokens`);
}

console.log(`Total API calls: ${apiCallCount}, Total tokens: ${totalTokens}`);
```

## Common Issues and Fixes

### Email Delivery Issues

#### Emails Going to Spam
**Problem:** Summary emails are marked as spam

**Solutions:**
- Check sender reputation
- Add summary emails to safe senders
- Use consistent subject format
- Avoid spam trigger words

#### Missing Summary Emails
**Problem:** No summary email received despite successful execution

**Solutions:**
```javascript
// Verify email configuration
console.log("Recipient:", EMAIL_RECIPIENT);
console.log("Subject:", EMAIL_SUBJECT);
console.log("Send enabled:", EMAIL_SEND_ENABLED);

// Test email sending
MailApp.sendEmail({
  to: EMAIL_RECIPIENT,
  subject: "Test Email",
  htmlBody: "<p>Test</p>"
});
```

### Processing Issues

#### No Emails Found
**Problem:** Gmail search returns empty results

**Debug Steps:**
```javascript
// Test search string
const searchString = getSearchStringForLastNDays(EMAIL_SEARCH_PREVIOUS_DAYS);
console.log("Search string:", searchString);

// Manual Gmail search
// Go to Gmail and test the search string manually
const testResults = GmailApp.search(searchString);
console.log("Test results:", testResults.length);
```

#### Large Email Content
**Problem:** Emails exceed processing limits

**Solutions:**
- Increase `EMAIL_MAX_CONTENT_LENGTH` (if within limits)
- Implement content truncation
- Process large emails separately
- Skip attachments in content

### Categorization Issues

#### Poor Categorization Accuracy
**Problem:** Emails categorized incorrectly

**Debug Steps:**
```javascript
// Log categorization details
console.log("Email subject:", email.subject);
console.log("Email content preview:", email.content.substring(0, 200));
console.log("Assigned category:", summary.category);
console.log("AI response:", aiResponse);

// Test with different prompts
const testPrompt = `Categorize: ${email.subject}`;
```

#### Missing Action Items
**Problem:** Important emails not flagged for action

**Solutions:**
- Review action item guidelines in prompt
- Adjust sensitivity in categorization logic
- Test with sample action-required emails
- Update prompt with better examples

### Performance Issues

#### Slow Execution
**Problem:** Script takes too long to execute

**Optimization Steps:**
```javascript
// Profile execution time
console.time("Email Retrieval");
const emails = getPreviousDayEmails();
console.timeEnd("Email Retrieval");

console.time("AI Processing");
const summaries = summarizeEmails(emails);
console.timeEnd("AI Processing");

console.time("Email Generation");
const html = formatSummariesAsHTML(summaries);
console.timeEnd("Email Generation");
```

#### High API Costs
**Problem:** OpenAI API usage too expensive

**Optimization Steps:**
- Reduce `EMAIL_MAX_CONTENT_LENGTH`
- Use smaller OpenAI models
- Implement response caching
- Process fewer emails per execution

### Gmail Integration Issues

#### Labeling Problems
**Problem:** Gmail labels not created or applied

**Debug Steps:**
```javascript
// Test label creation
const testLabel = getOrCreateLabel("🤖 TestLabel");
console.log("Label created:", testLabel.getName());

// Check permissions
console.log("Can create labels:", true); // GmailApp permission check
```

#### Archiving Issues
**Problem:** Emails not archived as expected

**Debug Steps:**
```javascript
// Check archive conditions
const shouldArchive = !EMAIL_CATEGORIES_SKIPPED_FOR_ARCHIVE.includes(email.category);
console.log("Should archive:", shouldArchive);
console.log("Category:", email.category);
console.log("Skipped categories:", EMAIL_CATEGORIES_SKIPPED_FOR_ARCHIVE);
```

## Preventive Measures

### Regular Maintenance

#### Weekly Checks
- [ ] Review execution logs for errors
- [ ] Check API usage and costs
- [ ] Verify email delivery success
- [ ] Test with sample emails

#### Monthly Maintenance
- [ ] Clean up old deployments
- [ ] Review and rotate API keys
- [ ] Update dependencies
- [ ] Check Gmail API quotas

#### Configuration Validation
```javascript
// Add configuration validation
function validateConfiguration() {
  const issues = [];

  if (!EMAIL_SEND_ENABLED && process.env.NODE_ENV === 'production') {
    issues.push("EMAIL_SEND_ENABLED should be true in production");
  }

  if (EMAIL_SEARCH_RESULT_LIMIT === 0) {
    issues.push("EMAIL_SEARCH_RESULT_LIMIT set to 0 will process no emails");
  }

  if (!OPENAI_API_KEY) {
    issues.push("OpenAI API key not configured");
  }

  if (issues.length > 0) {
    console.error("Configuration issues found:", issues);
    return false;
  }

  return true;
}
```

### Monitoring Setup

#### Error Alerting
```javascript
// Add error alerting
function sendErrorAlert(error, context) {
  const alertEmail = {
    to: "admin@example.com",
    subject: "Email Summary Error Alert",
    htmlBody: `
      <h2>Error Alert</h2>
      <p><strong>Error:</strong> ${error.message}</p>
      <p><strong>Context:</strong> ${context}</p>
      <p><strong>Time:</strong> ${new Date().toISOString()}</p>
    `
  };

  try {
    MailApp.sendEmail(alertEmail);
  } catch (emailError) {
    console.error("Failed to send error alert:", emailError);
  }
}
```

#### Performance Monitoring
```javascript
// Add performance tracking
function trackPerformance(metric, value) {
  console.log(`PERF: ${metric} = ${value}`);

  // Store in script properties for trending
  const perfData = PropertiesService.getScriptProperties().getProperty("performance") || "{}";
  const perf = JSON.parse(perfData);

  if (!perf[metric]) perf[metric] = [];
  perf[metric].push({ timestamp: Date.now(), value });

  // Keep only last 100 entries
  if (perf[metric].length > 100) {
    perf[metric] = perf[metric].slice(-100);
  }

  PropertiesService.getScriptProperties().setProperty("performance", JSON.stringify(perf));
}
```

## Emergency Procedures

### Complete System Reset
1. **Stop all triggers** in Apps Script dashboard
2. **Disable the script** temporarily
3. **Clear all labels** created by the system
4. **Reset configuration** to defaults
5. **Test basic functionality** with debug mode
6. **Gradually re-enable** features

### Data Recovery
1. **Check Gmail trash** for accidentally archived emails
2. **Use Gmail search** to find affected emails
3. **Restore from backups** if available
4. **Re-run processing** with corrected configuration

### Support Escalation
- **Development team** for code-related issues
- **Google support** for Apps Script platform issues
- **OpenAI support** for API-related problems
- **System administrator** for infrastructure issues

## Advanced Troubleshooting

### Network Diagnostics
```javascript
// Test network connectivity
function testConnectivity() {
  try {
    const response = UrlFetchApp.fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` }
    });
    console.log("Network test successful");
  } catch (error) {
    console.error("Network test failed:", error);
  }
}
```

### API Response Analysis
```javascript
// Detailed API response logging
function analyzeAPIResponse(response, request) {
  console.log("Request:", JSON.stringify(request, null, 2));
  console.log("Response status:", response.getResponseCode());
  console.log("Response headers:", response.getHeaders());
  console.log("Response content:", response.getContentText());

  if (response.getResponseCode() !== 200) {
    console.error("API Error Details:", {
      status: response.getResponseCode(),
      headers: response.getHeaders(),
      body: response.getContentText()
    });
  }
}
```

### Memory Leak Detection
```javascript
// Memory usage tracking
function trackMemoryUsage(label) {
  // Note: Apps Script doesn't provide direct memory monitoring
  // Use execution time and object counts as proxies
  console.log(`Memory check [${label}]:`, {
    timestamp: new Date().toISOString(),
    executionTime: new Date() - startTime,
    activeObjects: "Monitor via execution logs"
  });
}
```

## Getting Help

### Documentation Resources
- [Apps Script Error Reference](https://developers.google.com/apps-script/reference)
- [Gmail API Troubleshooting](https://developers.google.com/gmail/api/guides/troubleshooting)
- [OpenAI API Status](https://status.openai.com/)

### Community Support
- Stack Overflow: `google-apps-script` tag
- Apps Script Community Forum
- OpenAI Developer Community

### Professional Support
- Google Cloud Support (for Apps Script issues)
- OpenAI Enterprise Support (for API issues)
- Development team (for application-specific issues)

## Best Practices

### Proactive Monitoring
- Set up regular health checks
- Monitor API usage and costs
- Review execution logs weekly
- Test with sample data regularly

### Error Prevention
- Validate configuration before deployment
- Use try-catch blocks for all API calls
- Implement graceful degradation
- Test edge cases thoroughly

### Documentation
- Keep troubleshooting runbook updated
- Document all configuration changes
- Maintain change log for deployments
- Record lessons learned from incidents

### Continuous Improvement
- Analyze error patterns for systemic issues
- Implement fixes for recurring problems
- Update monitoring based on findings
- Refine processes based on experience