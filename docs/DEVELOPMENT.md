# Development Guide

## Overview

This guide provides comprehensive instructions for developers working on the Email Summary system, including setup, testing, debugging, and deployment procedures.

## Development Environment Setup

### Prerequisites

#### System Requirements
- **Operating System**: Linux, macOS, or Windows with WSL
- **Node.js**: Version 22 (managed via `.nvmrc`)
- **npm**: Latest version (comes with Node.js)
- **Git**: Latest version for version control
- **VS Code**: Recommended editor with extensions

#### Required Accounts
- **Google Account**: With Gmail access and Apps Script permissions
- **OpenAI Account**: With API access and credits
- **GitHub Account**: For repository access and collaboration

### Local Development Setup

#### 1. Clone Repository
```bash
git clone https://github.com/yourusername/email-summary.git
cd email-summary
```

#### 2. Node.js Version Management
```bash
# Install Node.js version specified in .nvmrc
nvm install
nvm use

# Verify installation
node --version  # Should show v22.x.x
npm --version   # Should show latest version
```

#### 3. Install Dependencies
```bash
# Install project dependencies
npm install

# Verify clasp installation
npx clasp --version
```

#### 4. Development Container (Optional)
If using VS Code with dev containers:
```bash
# Open in VS Code
code .

# Use Command Palette: "Dev Containers: Reopen in Container"
# This provides a consistent development environment
```

### Google Apps Script Setup

#### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Gmail API
   - Google Apps Script API

#### 2. Create OAuth Credentials
1. Go to "Credentials" in the left sidebar
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Choose "Desktop application"
4. Download the JSON file as `credentials.json`
5. Place in project root directory

#### 3. Configure clasp
Create `.clasp.json` in project root:
```json
{
  "projectId": "your-google-cloud-project-id",
  "scriptId": "your-apps-script-script-id",
  "rootDir": "~/workspace/email-summary"
}
```

#### 4. Authenticate with Google
```bash
# Login to clasp (opens browser for authentication)
npm run setup

# This creates .clasprc.json with authentication tokens
```

#### 5. Set OpenAI API Key
1. Get API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. In Google Apps Script editor, go to Settings → Script properties
3. Add property: `OPENAI_API_KEY` with your API key value

## Development Workflow

### Daily Development Cycle

#### 1. Pull Latest Changes
```bash
git pull origin main
```

#### 2. Create Feature Branch
```bash
git checkout -b feature/your-feature-name
```

#### 3. Make Changes
- Edit `Code.js` for functionality changes
- Update configuration constants as needed
- Test changes locally

#### 4. Test Changes
```bash
# Test locally (with debug flags)
npm test

# Or run specific function
npm start
```

#### 5. Deploy and Test
```bash
# Deploy to development environment
npm run deploy

# Test in Google Apps Script
# Check logs: npm run watch
```

#### 6. Commit Changes
```bash
git add .
git commit -m "feat: add your feature description"
git push origin feature/your-feature-name
```

### Code Organization

#### File Structure
```
email-summary/
├── Code.js                 # Main application code
├── appsscript.json         # Apps Script configuration
├── package.json           # Node.js dependencies and scripts
├── .clasp.json           # clasp configuration (not in repo)
├── .clasprc.json         # Authentication tokens (not in repo)
├── credentials.json      # OAuth credentials (not in repo)
├── .nvmrc               # Node.js version specification
├── .gitignore          # Git ignore rules
├── README.md           # Project documentation
├── CLAUDE.md          # AI assistant guidance
└── docs/              # Comprehensive documentation
```

#### Code Style Guidelines
- **Language**: JavaScript ES6+ (V8 runtime)
- **Formatting**: Consistent indentation (2 spaces)
- **Naming**: camelCase for variables and functions
- **Comments**: JSDoc style for functions
- **Constants**: UPPER_SNAKE_CASE for configuration
- **Error Handling**: Try-catch blocks with meaningful messages

## Testing Procedures

### Testing Strategy

#### Unit Testing
- Test individual functions in isolation
- Mock external API calls (Gmail, OpenAI)
- Verify input/output contracts
- Test error conditions

#### Integration Testing
- Test function interactions
- Verify API integrations
- Test end-to-end workflows
- Validate data flow

#### Manual Testing
- Test in Google Apps Script environment
- Verify email processing and delivery
- Check Gmail organization features
- Validate user experience

### Debug Configuration

#### Development Settings
```javascript
// Code.js - Top of file
const EMAIL_SEND_ENABLED = false;        // Disable email sending
const EMAIL_ARCHIVE_ENABLED = false;     // Disable archiving
const EMAIL_LABEL_ENABLED = false;       // Disable labeling
const EMAIL_SEARCH_PREVIOUS_DAYS = 1;    // Recent emails only
const EMAIL_SEARCH_RESULT_LIMIT = 5;     // Limit processing
```

#### Testing Checklist
- [ ] Debug flags set appropriately
- [ ] OpenAI API key configured
- [ ] OAuth credentials valid
- [ ] Gmail permissions granted
- [ ] Test emails available in inbox

### Running Tests

#### Local Testing
```bash
# Run main function locally
npm start

# This executes summarizeAndSendDailyEmail() with current debug settings
```

#### Remote Testing
```bash
# Push and deploy to Apps Script
npm run deploy

# Run remotely
npm run start

# Watch logs in real-time
npm run watch
```

#### Full Test Workflow
```bash
# Complete test cycle
npm test

# This does:
# 1. Push code to Apps Script
# 2. Deploy new version
# 3. Execute main function
# 4. Check results
```

## Debugging Techniques

### Logging and Monitoring

#### Console Logging
```javascript
// Add debug logging throughout Code.js
console.log("Processing email:", email.subject);
console.log("API Response:", JSON.stringify(response, null, 2));

// View logs
npm run watch
```

#### Gmail Search Debugging
```javascript
// Log search strings for verification
const searchString = `in:inbox ${getSearchStringForLastNDays(EMAIL_SEARCH_PREVIOUS_DAYS)}`;
console.log("Gmail search string:", searchString);

// Test search in Gmail UI to verify results
```

#### OpenAI API Debugging
```javascript
// Log API requests and responses
console.log("OpenAI Request:", JSON.stringify(payload, null, 2));
console.log("OpenAI Response:", JSON.stringify(json, null, 2));

// Check token usage
console.log("Token usage:", json.usage);
```

### Common Debugging Scenarios

#### Authentication Issues
**Symptoms:**
- "Authentication failed" errors
- Permission denied messages

**Debug Steps:**
1. Check `.clasprc.json` exists and is valid
2. Re-run `npm run setup`
3. Verify Google account permissions
4. Check OAuth scopes in `appsscript.json`

#### API Errors
**Symptoms:**
- OpenAI API failures
- Gmail API errors

**Debug Steps:**
1. Verify API keys in script properties
2. Check API quotas and limits
3. Test API endpoints manually
4. Review error messages in logs

#### Email Processing Issues
**Symptoms:**
- No emails found
- Incorrect categorization
- Missing summaries

**Debug Steps:**
1. Log Gmail search results
2. Verify email content parsing
3. Check OpenAI prompt structure
4. Test with sample emails

### Performance Debugging

#### Execution Time Issues
```javascript
// Add timing measurements
const startTime = new Date();
console.log("Starting processing...");

// ... processing code ...

const endTime = new Date();
console.log("Processing completed in:", endTime - startTime, "ms");
```

#### Memory Usage
```javascript
// Monitor memory-intensive operations
console.log("Processing", emails.length, "emails");
console.log("Email content lengths:", emails.map(e => e.content.length));
```

#### API Call Optimization
```javascript
// Track API usage
let apiCallCount = 0;
console.log("API calls made:", apiCallCount++);
```

## Deployment Procedures

### Environment Management

#### Development Environment
- Use debug flags for testing
- Limited email processing
- Separate Google Cloud project
- Frequent deployments

#### Production Environment
- Production configuration enabled
- Full email processing
- Stable Google Cloud project
- Controlled deployments

### Deployment Steps

#### 1. Pre-deployment Checklist
- [ ] All tests passing
- [ ] Debug flags set for production
- [ ] Configuration validated
- [ ] OpenAI API key verified
- [ ] OAuth credentials current

#### 2. Deploy to Apps Script
```bash
# Deploy using custom command
npm run deploy

# Or manual deployment
npx clasp push --force
npx clasp deploy
```

#### 3. Update Triggers
1. Open [Google Apps Script Editor](https://script.google.com/)
2. Go to Triggers (clock icon)
3. Update or create time-based trigger
4. Select new deployment version
5. Set execution time (5-6 AM recommended)

#### 4. Post-deployment Verification
- [ ] Check execution logs
- [ ] Verify email delivery
- [ ] Test Gmail organization
- [ ] Monitor for errors

### Version Management

#### Deployment Tracking
```javascript
// package.json
{
  "meta": {
    "activeDeploymentId": 71
  }
}
```

#### Rollback Procedures
```bash
# List all deployments
npm run deployments:list

# Undeploy specific version
npx clasp undeploy <deployment-id>

# Deploy previous version
npx clasp deploy --version <previous-version>
```

## Code Quality Practices

### Code Reviews
- **Pull Request Template**: Use descriptive titles and detailed descriptions
- **Review Checklist**:
  - [ ] Code follows style guidelines
  - [ ] Functions have proper error handling
  - [ ] Configuration changes documented
  - [ ] Tests added for new features
  - [ ] Performance considerations addressed

### Documentation
- **Inline Comments**: Explain complex logic
- **Function Documentation**: JSDoc for all public functions
- **Configuration Changes**: Update relevant documentation
- **Breaking Changes**: Document migration steps

### Security Practices
- **API Keys**: Never commit to version control
- **Credentials**: Store securely, rotate regularly
- **Permissions**: Use minimal required scopes
- **Input Validation**: Sanitize all inputs
- **Error Messages**: Don't expose sensitive information

## Troubleshooting Development Issues

### Build and Deployment Issues

#### clasp Authentication Problems
```bash
# Clear authentication
rm .clasprc.json
npm run setup
```

#### Deployment Failures
```bash
# Force push
npx clasp push --force

# Check Apps Script logs
npm run watch
```

#### Version Conflicts
```bash
# List deployments
npm run deployments:list

# Clean up old deployments
npm run deployments:cleanup
```

### Runtime Issues

#### Script Timeouts
- Reduce `EMAIL_SEARCH_RESULT_LIMIT`
- Optimize API calls
- Implement batching for large datasets

#### Memory Limits
- Truncate email content earlier
- Process emails in smaller batches
- Clear unused variables

#### API Quotas
- Monitor OpenAI usage
- Implement rate limiting
- Cache frequently used data

### Testing Issues

#### Inconsistent Test Results
- Use fixed test data
- Mock external dependencies
- Isolate test environments

#### Gmail API Limitations
- Test with smaller email sets
- Use Gmail search filters
- Implement pagination for large results

## Advanced Development Topics

### Customizing AI Prompts
```javascript
// Modify prompt structure in summarizeEmails()
const prompt = `
Analyze this email and categorize it:
Subject: ${email.subject}
Content: ${email.content}

Categories: ${categoryList}
Guidelines: [your custom guidelines]
`;
```

### Adding New Categories
```javascript
// Add to EMAIL_CATEGORIES array
const EMAIL_CATEGORIES = [
  // ... existing categories
  { name: "custom", emoji: "🎯", description: "Your custom category" }
];
```

### Extending Gmail Integration
```javascript
// Add custom Gmail operations
function customGmailOperation(threadId) {
  const thread = GmailApp.getThreadById(threadId);
  // Your custom logic here
}
```

### Performance Optimization
```javascript
// Implement caching
const cache = CacheService.getScriptCache();

// Cache expensive operations
function getCachedLabels() {
  const cached = cache.get("labels");
  if (cached) return JSON.parse(cached);

  const labels = GmailApp.getUserLabels();
  cache.put("labels", JSON.stringify(labels), 300); // 5 min cache
  return labels;
}
```

## Contributing Guidelines

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Testing
- `chore`: Maintenance

### Branch Naming
```
feature/description-of-feature
bugfix/issue-description
hotfix/critical-fix
```

### Pull Request Process
1. Create feature branch from `main`
2. Make changes and commit
3. Push branch and create PR
4. Request review
5. Address review feedback
6. Merge after approval

## Support and Resources

### Documentation
- [Google Apps Script Reference](https://developers.google.com/apps-script/reference)
- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [clasp Documentation](https://github.com/google/clasp)

### Community Resources
- [Apps Script Stack Overflow](https://stackoverflow.com/questions/tagged/google-apps-script)
- [OpenAI Developer Forum](https://community.openai.com/)
- [Google Cloud Community](https://cloud.google.com/community)

### Getting Help
- Check existing issues and documentation
- Create detailed bug reports with reproduction steps
- Include relevant logs and error messages
- Provide environment information