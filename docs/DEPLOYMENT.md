# Deployment Guide

## Overview

This guide covers the complete deployment process for the Email Summary Google Apps Script, including environment setup, configuration management, and production deployment procedures.

## Deployment Environments

### Development Environment
- **Purpose**: Testing and development
- **Configuration**: Debug flags enabled, limited processing
- **Deployment Frequency**: Frequent, on-demand
- **Risk Level**: Low impact

### Production Environment
- **Purpose**: Live email processing
- **Configuration**: Production settings, full processing
- **Deployment Frequency**: Controlled, scheduled
- **Risk Level**: High impact

### Staging Environment (Optional)
- **Purpose**: Pre-production testing
- **Configuration**: Production-like settings
- **Deployment Frequency**: Before production releases
- **Risk Level**: Medium impact

## Pre-deployment Preparation

### Environment Prerequisites

#### Google Cloud Platform Setup
1. **Create Project**
   ```bash
   # Development project
   gcloud projects create email-summary-dev --name="Email Summary Dev"
   
   # Production project
   gcloud projects create email-summary-prod --name="Email Summary Prod"
   ```

2. **Enable Required APIs**
   ```bash
   # Enable Gmail API
   gcloud services enable gmail.googleapis.com
   
   # Enable Apps Script API
   gcloud services enable script.googleapis.com
   ```

3. **Create Service Account** (Optional)
   ```bash
   # Create service account for CI/CD
   gcloud iam service-accounts create email-summary-deployer \
     --description="Email Summary deployment service account" \
     --display-name="Email Summary Deployer"
   ```

#### OpenAI API Setup
1. **Create API Key**
   - Go to [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create new API key for production use
   - Store securely (never in code)

2. **Monitor Usage**
   - Set up billing alerts
   - Monitor API usage dashboard
   - Plan for usage limits

### Configuration Files

#### .clasp.json Templates

**Development:**
```json
{
  "projectId": "email-summary-dev-123456",
  "scriptId": "1A2B3C4D5E6F7G8H9I0J",
  "rootDir": "~/workspace/email-summary"
}
```

**Production:**
```json
{
  "projectId": "email-summary-prod-123456",
  "scriptId": "1K2L3M4N5O6P7Q8R9S0T",
  "rootDir": "~/workspace/email-summary"
}
```

#### appsscript.json Configuration
```json
{
  "timeZone": "Asia/Manila",
  "dependencies": {
    "enabledAdvancedServices": [
      {
        "userSymbol": "Gmail",
        "version": "v1",
        "serviceId": "gmail"
      }
    ]
  },
  "exceptionLogging": "STACKDRIVER",
  "oauthScopes": [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/script.external_request",
    "https://www.googleapis.com/auth/script.send_mail",
    "https://www.googleapis.com/auth/script.scriptapp"
  ],
  "runtimeVersion": "V8",
  "executionApi": {
    "access": "MYSELF"
  }
}
```

## Deployment Process

### Automated Deployment

#### Using Custom Claude Command
```bash
# Run the automated deployment
project:deploy
```

This command performs:
1. Configuration validation
2. Code deployment
3. Trigger updates
4. Cleanup operations
5. Git operations

#### Manual Deployment Steps

**Step 1: Pre-deployment Validation**
```bash
# Check debug configuration
grep "EMAIL_SEND_ENABLED" Code.js
grep "EMAIL_ARCHIVE_ENABLED" Code.js
grep "EMAIL_LABEL_ENABLED" Code.js

# Verify API key exists
# Check in Google Apps Script > Settings > Script properties
```

**Step 2: Deploy Code**
```bash
# Push code to Apps Script
npx clasp push --force

# Create new deployment
npx clasp deploy

# Output includes deployment ID and URL
# Example: https://script.google.com/home/projects/1A2B3C...
```

**Step 3: Update Triggers**
1. Open the deployment URL from step 2
2. Go to Triggers (clock icon in left sidebar)
3. Delete existing trigger (if any)
4. Click "Add Trigger"
5. Configure:
   - **Function:** `summarizeAndSendDailyEmail`
   - **Event source:** Time-driven
   - **Type:** Day timer
   - **Time:** 5-6 AM (recommended)
   - **Failure notification:** Notify me immediately

**Step 4: Update Deployment Tracking**
```bash
# Get deployment ID from clasp deploy output
# Update package.json
{
  "meta": {
    "activeDeploymentId": 72
  }
}
```

**Step 5: Cleanup Old Deployments**
```bash
# List all deployments
npm run deployments:list

# Remove old deployments (keeps active and HEAD)
npm run deployments:cleanup
```

**Step 6: Commit Changes**
```bash
git add package.json
git commit -m "chore(deploy): update active deployment ID to 72"
git push origin main
```

### Environment-Specific Deployments

#### Development Deployment
```bash
# Switch to dev configuration
cp .clasp.dev.json .clasp.json

# Deploy with debug settings
npm run deploy

# Test execution
npm start
```

#### Production Deployment
```bash
# Switch to prod configuration
cp .clasp.prod.json .clasp.json

# Ensure production settings
# EMAIL_SEND_ENABLED = true
# EMAIL_ARCHIVE_ENABLED = true
# EMAIL_LABEL_ENABLED = true

# Deploy to production
npm run deploy
```

## Configuration Management

### Production Configuration Checklist

#### Debug Flags
- [ ] `EMAIL_SEND_ENABLED = true`
- [ ] `EMAIL_ARCHIVE_ENABLED = true`
- [ ] `EMAIL_LABEL_ENABLED = true`

#### Processing Limits
- [ ] `EMAIL_SEARCH_PREVIOUS_DAYS = 1`
- [ ] `EMAIL_SEARCH_RESULT_LIMIT = undefined`

#### Content Settings
- [ ] `EMAIL_MAX_CONTENT_LENGTH = 500000`
- [ ] `OPENAI_MAX_TOKENS = 50000`

#### Archive Rules
- [ ] `EMAIL_CATEGORIES_SKIPPED_FOR_ARCHIVE = ["personal"]`

### Environment Variables

#### Script Properties (Google Apps Script)
Set in Apps Script > Settings > Script properties:
- `OPENAI_API_KEY`: Your OpenAI API key

#### Local Environment Variables
```bash
# For CI/CD pipelines
export CLASP_PROJECT_ID="your-project-id"
export CLASP_SCRIPT_ID="your-script-id"
export OPENAI_API_KEY="your-api-key"
```

## Testing and Validation

### Pre-deployment Testing

#### Configuration Validation
```bash
# Check all settings are production-ready
node -e "
const fs = require('fs');
const code = fs.readFileSync('Code.js', 'utf8');
console.log('EMAIL_SEND_ENABLED:', /EMAIL_SEND_ENABLED = (true|false)/.exec(code)[1]);
console.log('EMAIL_ARCHIVE_ENABLED:', /EMAIL_ARCHIVE_ENABLED = (true|false)/.exec(code)[1]);
console.log('EMAIL_LABEL_ENABLED:', /EMAIL_LABEL_ENABLED = (true|false)/.exec(code)[1]);
"
```

#### Functional Testing
```bash
# Test deployment
npm run deploy

# Execute function
npm start

# Monitor logs
npm run watch
```

#### Email Testing
1. Send test emails to your Gmail account
2. Trigger manual execution
3. Verify:
   - Summary email received
   - Emails properly categorized
   - Archive/label behavior correct
   - No errors in logs

### Post-deployment Validation

#### Health Checks
- [ ] Summary email sent successfully
- [ ] No execution errors in logs
- [ ] Gmail labels created correctly
- [ ] Archive behavior working
- [ ] OpenAI API calls successful

#### Performance Monitoring
```bash
# Check execution time
npm run watch | grep "Execution completed"

# Monitor API usage
# Check OpenAI dashboard for usage statistics
```

## Rollback Procedures

### Emergency Rollback
```bash
# List available versions
npx clasp versions

# Deploy previous version
npx clasp deploy --version 71

# Update package.json
{
  "meta": {
    "activeDeploymentId": 71
  }
}

# Update triggers to use new deployment
# Follow trigger update steps above
```

### Gradual Rollback
```bash
# Deploy new version with reduced functionality
# EMAIL_SEARCH_RESULT_LIMIT = 10
# Test with limited processing

# Gradually increase limits
# Monitor for issues
# Full rollback if problems persist
```

## Monitoring and Maintenance

### Execution Monitoring

#### Apps Script Dashboard
- View execution history
- Check error logs
- Monitor execution times
- Review failure notifications

#### Log Analysis
```bash
# Watch real-time logs
npm run watch

# View execution logs
npm run watch:open
```

### Performance Monitoring

#### Key Metrics
- **Execution Time**: Should complete within 5 minutes
- **Success Rate**: Target 95%+ successful executions
- **Email Processing**: Monitor number of emails processed
- **API Usage**: Track OpenAI API costs and limits

#### Alerts and Notifications
- Set up Google Cloud monitoring alerts
- Configure OpenAI usage alerts
- Monitor Gmail API quota usage
- Set up email notifications for failures

### Maintenance Tasks

#### Regular Maintenance
```bash
# Weekly: Clean up old deployments
npm run deployments:cleanup

# Monthly: Review and rotate API keys
# Check OpenAI dashboard for usage patterns

# Quarterly: Update dependencies
npm audit
npm update
```

#### Log Rotation
```bash
# Apps Script logs are automatically managed
# Export important logs for long-term storage
# Clear old logs to maintain performance
```

## Troubleshooting Deployment Issues

### Common Deployment Problems

#### Authentication Issues
**Symptoms:**
- "Authentication failed"
- "Permission denied"

**Solutions:**
```bash
# Re-authenticate
rm .clasprc.json
npm run setup

# Check OAuth scopes
# Verify Google Cloud project permissions
```

#### Deployment Failures
**Symptoms:**
- "Deployment failed"
- Script errors during push

**Solutions:**
```bash
# Force push
npx clasp push --force

# Check for syntax errors
node -c Code.js

# Verify project configuration
cat .clasp.json
```

#### Trigger Issues
**Symptoms:**
- Function not executing on schedule
- Trigger errors

**Solutions:**
- Verify trigger configuration in Apps Script
- Check function name matches exactly
- Ensure proper permissions
- Test manual execution first

#### API Configuration Issues
**Symptoms:**
- OpenAI API errors
- Gmail API failures

**Solutions:**
- Verify API keys in script properties
- Check API quotas and limits
- Test API endpoints manually
- Review error messages in logs

### Advanced Troubleshooting

#### Debug Mode Deployment
```bash
# Deploy with debug settings for testing
const EMAIL_SEND_ENABLED = false;
const EMAIL_ARCHIVE_ENABLED = false;
const EMAIL_LABEL_ENABLED = false;

# Test individual components
npm start
```

#### Log Analysis
```bash
# Search for specific errors
npm run watch | grep "ERROR"

# Check execution flow
npm run watch | grep "Processing"

# Monitor API calls
npm run watch | grep "OpenAI\|Gmail"
```

## Security Considerations

### API Key Management
- Store OpenAI key in script properties only
- Never commit keys to version control
- Rotate keys regularly
- Monitor API usage for unauthorized access

### Access Control
- Limit script access to owner only
- Use minimal required OAuth scopes
- Regularly review account permissions
- Enable 2FA on Google accounts

### Data Protection
- Process emails temporarily only
- Use HTTPS for all external communications
- Clear sensitive data from logs
- Implement proper error handling

## Backup and Recovery

### Configuration Backup
```bash
# Backup clasp configuration
cp .clasp.json .clasp.backup.json

# Export script properties
# Manual process through Apps Script UI

# Backup deployment IDs
cp package.json package.backup.json
```

### Disaster Recovery
1. **Code Recovery**
   ```bash
   git checkout last-known-good-commit
   npm run deploy
   ```

2. **Configuration Recovery**
   ```bash
   cp .clasp.backup.json .clasp.json
   # Restore script properties manually
   ```

3. **Trigger Recovery**
   - Recreate triggers following standard procedure
   - Test execution manually
   - Verify email delivery

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Deploy Email Summary
on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '22'
        
    - name: Install dependencies
      run: npm install
      
    - name: Authenticate with Google
      run: npx clasp login --creds credentials.json
      env:
        CLASP_PROJECT_ID: ${{ secrets.CLASP_PROJECT_ID }}
        
    - name: Deploy to Apps Script
      run: npm run deploy
      
    - name: Update deployment tracking
      run: |
        DEPLOYMENT_ID=$(npx clasp deployments | grep -o '[0-9]\+' | tail -1)
        sed -i "s/\"activeDeploymentId\": [0-9]\+/\"activeDeploymentId\": $DEPLOYMENT_ID/" package.json
        
    - name: Commit deployment update
      run: |
        git config --local user.email "action@github.com"
        git config --local user.name "GitHub Action"
        git add package.json
        git commit -m "chore(deploy): update deployment ID" || echo "No changes to commit"
        git push
```

### Automated Testing
```yaml
- name: Run tests
  run: npm test
  
- name: Validate configuration
  run: |
    if ! grep -q "EMAIL_SEND_ENABLED = true" Code.js; then
      echo "Production configuration not set"
      exit 1
    fi
```

## Best Practices

### Deployment Best Practices
- Always test in development before production
- Use version control for all changes
- Document deployment procedures
- Monitor deployments closely
- Have rollback procedures ready

### Configuration Management
- Keep configuration separate from code
- Use environment-specific settings
- Document all configuration options
- Validate configuration before deployment

### Monitoring and Alerting
- Set up comprehensive monitoring
- Configure alerts for failures
- Monitor performance metrics
- Keep detailed deployment logs

### Security Best Practices
- Use secure credential storage
- Implement least privilege access
- Regular security audits
- Keep dependencies updated

## Support and Resources

### Documentation
- [Google Apps Script Deployment](https://developers.google.com/apps-script/guides/deployments)
- [clasp Deployment Guide](https://github.com/google/clasp/blob/master/docs/deploy.md)
- [OpenAI API Best Practices](https://platform.openai.com/docs/introduction)

### Getting Help
- Check Apps Script execution logs
- Review clasp documentation
- Search Google Apps Script community
- Contact development team for issues

### Emergency Contacts
- Development team for code issues
- Google Cloud support for platform issues
- OpenAI support for API issues
- System administrator for infrastructure issues