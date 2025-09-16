# Security Guide

## Overview

This guide outlines the security measures, best practices, and considerations for the Email Summary system, ensuring the protection of user data, API credentials, and system integrity.

## Security Architecture

### Authentication and Authorization

#### Google OAuth 2.0
- **Scope Limitation**: Uses minimal required OAuth scopes
- **Token Management**: Automatic token refresh and secure storage
- **User Consent**: Explicit permission grants for Gmail access

**Required Scopes:**
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

#### OpenAI API Authentication
- **API Key Storage**: Secure storage in Google Apps Script properties
- **Key Rotation**: Regular key rotation procedures
- **Access Monitoring**: API usage tracking and alerting

### Data Protection

#### Email Content Handling
- **Temporary Processing**: Email content processed in memory only
- **No Persistent Storage**: Emails not stored after processing
- **Content Truncation**: Automatic content size limits
- **Secure Transmission**: HTTPS encryption for all data transfer

#### Data Minimization
- **Essential Data Only**: Only processes necessary email metadata
- **Content Filtering**: Removes sensitive information when possible
- **Processing Scope**: Limited to user's own emails
- **Cleanup Procedures**: Automatic data cleanup after processing

## API Key Management

### OpenAI API Key Security

#### Storage Best Practices
```javascript
// Secure storage in Apps Script properties
const OPENAI_API_KEY = PropertiesService.getScriptProperties().getProperty("OPENAI_API_KEY");

// Never expose in code or logs
console.log("API Key:", OPENAI_API_KEY); // ❌ NEVER DO THIS
console.log("API Key configured:", !!OPENAI_API_KEY); // ✅ SAFE
```

#### Key Rotation Procedure
1. **Generate New Key**
   - Go to [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create new API key
   - Note the key value securely

2. **Update in Apps Script**
   - Open Google Apps Script editor
   - Go to Settings → Script properties
   - Update `OPENAI_API_KEY` with new key
   - Save changes

3. **Test New Key**
   ```bash
   npm start
   # Verify no authentication errors
   ```

4. **Revoke Old Key**
   - Return to OpenAI Platform
   - Delete or revoke the old API key
   - Confirm key is no longer valid

5. **Update Documentation**
   - Update any secure key references
   - Notify team members of key rotation

#### Key Security Checklist
- [ ] Key stored only in Apps Script properties
- [ ] Key never logged or exposed in code
- [ ] Key rotated every 90 days
- [ ] Key access limited to authorized personnel
- [ ] Key usage monitored for anomalies

### Google Service Account Keys (Optional)

#### For CI/CD Pipelines
```bash
# Create service account key
gcloud iam service-accounts keys create key.json \
  --iam-account=email-summary-deployer@email-summary-prod.iam.gserviceaccount.com

# Secure key storage
# Use GitHub Secrets or similar secure storage
# Never commit to version control
```

## Access Control

### Google Apps Script Permissions

#### Script Access Control
- **Owner Only**: Script execution limited to owner
- **No Public Access**: No web app deployment
- **Trigger Restrictions**: Time-based triggers only

#### Gmail Permissions
- **Read Access**: Required for email retrieval
- **Modify Access**: Required for archiving and labeling
- **Send Access**: Required for summary emails
- **No Delete Access**: Cannot delete user emails

### Development Environment Security

#### Local Development
```bash
# Secure credential storage
chmod 600 credentials.json
chmod 600 .clasprc.json

# Environment variables for sensitive data
export OPENAI_API_KEY="your-key-here"
export CLASP_PROJECT_ID="your-project-id"
```

#### Version Control Security
```bash
# .gitignore configuration
echo "credentials.json" >> .gitignore
echo ".clasprc.json" >> .gitignore
echo ".env" >> .gitignore
echo "secrets/" >> .gitignore
```

## Data Privacy

### Email Content Privacy

#### Processing Scope
- **User's Own Emails**: Only processes emails owned by the user
- **No Third-Party Access**: No sharing of email content
- **Temporary Access**: Content accessed only during processing
- **No Data Retention**: Content not stored after processing

#### Content Handling Rules
- **Content truncation**: `EMAIL_MAX_CONTENT_LENGTH` limits the body captured for each email before it is sent to OpenAI.
- **No automatic redaction**: The current implementation does not strip PII beyond truncation. Add custom sanitization in `summarizeEmails` if stricter handling is required for your environment.

### Privacy Compliance

#### Data Processing Agreement
- **Purpose Limitation**: Processing only for email summarization
- **Legal Basis**: User consent via OAuth
- **Data Minimization**: Only necessary data processed
- **Storage Limitation**: No persistent storage

#### User Rights
- **Access Right**: Users can view processed emails
- **Rectification Right**: Users can correct categorization
- **Erasure Right**: Users can delete processed data
- **Portability Right**: Users can export their data

## Network Security

### HTTPS Encryption

#### External API Communications
```javascript
// Always use HTTPS URLs
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// Verify SSL certificates
const options = {
  method: "post",
  contentType: "application/json",
  muteHttpExceptions: false, // Verify SSL
  headers: {
    Authorization: `Bearer ${OPENAI_API_KEY}`
  },
  payload: JSON.stringify(payload)
};
```

#### Request Validation
- **URL Validation**: Only allow approved domains
- **Header Validation**: Sanitize all request headers
- **Payload Validation**: Validate JSON structure
- **Response Validation**: Verify API response format

### Firewall and Network Controls

#### Apps Script Restrictions
- **Outbound Connections**: Limited to approved APIs
- **Inbound Connections**: No public endpoints
- **IP Restrictions**: No IP-based access control
- **Domain Restrictions**: Limited to Google services and OpenAI

## Secure Coding Practices

### Input Validation

#### Email Content Validation
```javascript
function validateEmailContent(content) {
  // Check content type
  if (typeof content !== 'string') {
    throw new Error('Invalid content type');
  }

  // Check content length
  if (content.length > EMAIL_MAX_CONTENT_LENGTH) {
    console.warn('Content truncated due to size');
    content = content.substring(0, EMAIL_MAX_CONTENT_LENGTH);
  }

  // Sanitize content
  content = content.replace(/<script[^>]*>.*?<\/script>/gi, '[SCRIPT REMOVED]');
  content = content.replace(/javascript:/gi, '[JAVASCRIPT REMOVED]');

  return content;
}
```

#### API Response Validation
```javascript
function validateAPIResponse(response) {
  // Check response status
  if (response.getResponseCode() !== 200) {
    throw new Error(`API returned status ${response.getResponseCode()}`);
  }

  // Parse and validate JSON
  let data;
  try {
    data = JSON.parse(response.getContentText());
  } catch (error) {
    throw new Error('Invalid JSON response from API');
  }

  // Validate expected structure
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error('Unexpected API response structure');
  }

  return data;
}
```

### Error Handling Security

#### Secure Error Messages
```javascript
// Safe error logging
try {
  // Risky operation
  const result = callExternalAPI();
} catch (error) {
  // Log safe error information
  console.error('API call failed:', {
    message: error.message,
    timestamp: new Date().toISOString(),
    operation: 'external_api_call'
    // Don't log: API keys, email content, personal data
  });

  // User-friendly error for email
  const userMessage = "Unable to process emails at this time. Please try again later.";
}
```

#### Exception Handling Best Practices
- **Catch Specific Exceptions**: Handle known error types
- **Log Safely**: Never log sensitive information
- **Fail Gracefully**: Continue processing other emails
- **Alert on Critical Errors**: Notify administrators of security issues

## Monitoring and Alerting

### Security Monitoring

#### API Usage Monitoring
```javascript
// Track API usage patterns
function monitorAPIUsage(response) {
  const usage = response.usage;
  console.log('API Usage:', {
    prompt_tokens: usage.prompt_tokens,
    completion_tokens: usage.completion_tokens,
    total_tokens: usage.total_tokens,
    timestamp: new Date().toISOString()
  });

  // Alert on unusual usage
  if (usage.total_tokens > 10000) {
    console.warn('High token usage detected:', usage.total_tokens);
  }
}
```

#### Authentication Monitoring
```javascript
// Monitor authentication attempts
function logAuthAttempt(success, method) {
  console.log('Authentication attempt:', {
    success: success,
    method: method,
    timestamp: new Date().toISOString(),
    ip: 'N/A (Apps Script)'
  });

  if (!success) {
    console.error('Authentication failure detected');
    // Could trigger alert here
  }
}
```

### Security Alerts

#### Automated Alerts
```javascript
function sendSecurityAlert(type, details) {
  const alertConfig = {
    to: "security@example.com",
    subject: `Security Alert: ${type}`,
    htmlBody: `
      <h2>Security Alert</h2>
      <p><strong>Type:</strong> ${type}</p>
      <p><strong>Details:</strong> ${JSON.stringify(details, null, 2)}</p>
      <p><strong>Time:</strong> ${new Date().toISOString()}</p>
      <p><strong>Action Required:</strong> Review and investigate</p>
    `
  };

  try {
    MailApp.sendEmail(alertConfig);
  } catch (error) {
    console.error('Failed to send security alert:', error);
  }
}
```

#### Alert Triggers
- **Authentication Failures**: Multiple failed login attempts
- **API Key Issues**: Invalid or expired keys
- **Unusual Usage**: Spike in API calls or data processing
- **Permission Changes**: Unexpected scope or access modifications
- **Data Exposure**: Potential data leakage incidents

## Incident Response

### Security Incident Procedure

#### Detection Phase
1. **Monitor Logs**: Check for unusual activity patterns
2. **Review Alerts**: Investigate triggered security alerts
3. **Analyze Access**: Verify authorized access only
4. **Check Integrity**: Ensure system components unchanged

#### Containment Phase
1. **Disable Access**: Temporarily disable compromised accounts
2. **Rotate Credentials**: Change all affected API keys
3. **Isolate System**: Disconnect from external services if needed
4. **Preserve Evidence**: Save logs and system state

#### Recovery Phase
1. **Clean System**: Remove any malicious components
2. **Restore from Backup**: Use clean backup if available
3. **Update Security**: Implement additional security measures
4. **Test System**: Verify system functionality

#### Lessons Learned Phase
1. **Document Incident**: Record what happened and why
2. **Update Procedures**: Improve security measures
3. **Train Team**: Share lessons with team members
4. **Prevent Recurrence**: Implement preventive measures

### Breach Notification

#### Legal Requirements
- **Assess Impact**: Determine scope of data exposure
- **Notify Authorities**: Report to relevant data protection authorities
- **Inform Users**: Notify affected users if personal data exposed
- **Document Response**: Maintain records of incident response

#### Communication Plan
```javascript
function notifyUsersOfBreach() {
  const notification = {
    to: "users@example.com",
    subject: "Important Security Update",
    htmlBody: `
      <h2>Security Incident Notification</h2>
      <p>We detected a security incident that may have affected your data.</p>
      <p><strong>What happened:</strong> [Brief description]</p>
      <p><strong>What we're doing:</strong> [Response actions]</p>
      <p><strong>What you should do:</strong> [User actions]</p>
      <p>For more information, contact: security@example.com</p>
    `
  };

  // Send to affected users
  MailApp.sendEmail(notification);
}
```

## Compliance Considerations

### Data Protection Regulations

#### GDPR Compliance
- **Lawful Processing**: User consent via OAuth
- **Data Minimization**: Only necessary data processed
- **Purpose Limitation**: Clear processing purpose
- **Storage Limitation**: No persistent storage
- **Security Measures**: Encryption and access controls

#### CCPA Compliance
- **Right to Know**: Transparent data processing
- **Right to Delete**: Ability to remove processed data
- **Data Security**: Secure handling of personal information
- **Opt-out Rights**: User can disable processing

### Industry Standards

#### Security Best Practices
- **OWASP Guidelines**: Web application security standards
- **NIST Framework**: Cybersecurity framework compliance
- **ISO 27001**: Information security management
- **Zero Trust**: Verify all access requests

## Security Testing

### Vulnerability Assessment

#### Code Review Checklist
- [ ] Input validation on all user inputs
- [ ] Secure storage of sensitive data
- [ ] Proper error handling and logging
- [ ] Secure API communications
- [ ] Access control implementation

#### Penetration Testing
```bash
# Test API key exposure
grep -r "OPENAI_API_KEY" . --exclude-dir=node_modules

# Check for hardcoded secrets
grep -r "sk-" . --exclude-dir=node_modules

# Verify file permissions
ls -la credentials.json
```

### Security Scanning

#### Dependency Scanning
```bash
# Check for vulnerable dependencies
npm audit

# Update dependencies
npm update

# Check for security advisories
npm audit --audit-level=high
```

#### Configuration Scanning
```javascript
// Validate security configuration
function validateSecurityConfig() {
  const issues = [];

  // Check OAuth scopes
  const requiredScopes = [
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/script.external_request"
  ];

  // Check API key configuration
  if (!OPENAI_API_KEY) {
    issues.push("OpenAI API key not configured");
  }

  // Check debug settings
  if (EMAIL_SEND_ENABLED === false) {
    issues.push("Email sending is disabled. Verify this is intentional before a production deployment.");
  }

  return issues;
}
```

## Maintenance and Updates

### Regular Security Tasks

#### Monthly Security Review
- [ ] Review access logs for unusual activity
- [ ] Check API key usage and rotate if needed
- [ ] Update dependencies for security patches
- [ ] Review and update security policies
- [ ] Test backup and recovery procedures

#### Quarterly Security Assessment
- [ ] Conduct security audit of codebase
- [ ] Review OAuth scopes and permissions
- [ ] Test incident response procedures
- [ ] Update security documentation
- [ ] Train team on security best practices

### Security Updates

#### Dependency Updates
```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Test after updates
npm test
```

#### Platform Updates
- **Apps Script Runtime**: Monitor for V8 engine updates
- **Google Services**: Stay current with API changes
- **OpenAI API**: Update for new security features
- **OAuth Standards**: Follow latest OAuth best practices

## Emergency Contacts

### Security Team
- **Security Officer**: security@example.com
- **Development Lead**: dev@example.com
- **System Administrator**: admin@example.com

### External Resources
- **Google Security**: security@google.com
- **OpenAI Security**: security@openai.com
- **CERT Coordination**: cert@example.com

### Incident Response Hotline
- **24/7 Support**: +1-800-SECURITY
- **Emergency Response**: emergency@example.com

## Conclusion

Security is a critical aspect of the Email Summary system. By following the practices outlined in this guide, we can ensure the protection of user data, maintain system integrity, and comply with relevant security standards and regulations.

Regular security reviews, proactive monitoring, and incident response planning are essential for maintaining a secure system. All team members should be familiar with these security practices and report any potential security issues immediately.
