# Contributing Guide

## Overview

Welcome to the Email Summary project! This guide provides comprehensive information for contributors, including development setup, coding standards, contribution workflows, and best practices.

## Getting Started

### Prerequisites

#### Required Software
- **Node.js**: Version 22 (managed via `.nvmrc`)
- **npm**: Latest version (comes with Node.js)
- **Git**: Latest version for version control
- **VS Code**: Recommended editor with extensions

#### Required Accounts
- **GitHub Account**: For repository access and pull requests
- **Google Account**: With Gmail access for testing
- **OpenAI Account**: With API access for development

### Development Environment Setup

#### 1. Fork and Clone
```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/yourusername/email-summary.git
cd email-summary
```

#### 2. Set Up Upstream Remote
```bash
# Add upstream remote
git remote add upstream https://github.com/original-owner/email-summary.git

# Verify remotes
git remote -v
```

#### 3. Install Dependencies
```bash
# Install Node.js version
nvm install
nvm use

# Install project dependencies
npm install
```

#### 4. Configure Development Environment
```bash
# Copy environment configuration
cp .clasp.json.example .clasp.json

# Edit with your development project details
# {
#   "projectId": "your-dev-project-id",
#   "scriptId": "your-dev-script-id",
#   "rootDir": "~/workspace/email-summary"
# }
```

#### 5. Set Up Google Apps Script
```bash
# Authenticate with Google
npm run setup

# This creates .clasprc.json with authentication
```

## Development Workflow

### Branching Strategy

#### Branch Naming Convention
```
feature/description-of-feature
bugfix/issue-description
hotfix/critical-fix
refactor/component-name
docs/update-documentation
test/add-test-coverage
```

#### Creating a Feature Branch
```bash
# Ensure you're on main branch
git checkout main
git pull upstream main

# Create and switch to feature branch
git checkout -b feature/add-new-category

# Push branch to your fork
git push -u origin feature/add-new-category
```

### Commit Guidelines

#### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

#### Commit Types
- **feat**: New features
- **fix**: Bug fixes
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

#### Examples
```bash
# Feature commit
git commit -m "feat(categorization): add support for custom email categories"

# Bug fix commit
git commit -m "fix(api): handle OpenAI rate limit errors gracefully

Rate limiting was causing script failures during high usage.
Added exponential backoff retry logic."

# Documentation commit
git commit -m "docs(api): update API reference for new endpoints"
```

### Pull Request Process

#### Before Creating a PR
- [ ] Ensure your branch is up to date with main
- [ ] Run tests and verify functionality
- [ ] Update documentation if needed
- [ ] Follow coding standards
- [ ] Write clear commit messages

#### Creating a Pull Request
1. **Push your branch** to your fork
2. **Go to GitHub** and navigate to your fork
3. **Click "New Pull Request"**
4. **Select your feature branch** as the compare branch
5. **Fill out the PR template** with:
   - Clear title describing the change
   - Detailed description of what was changed
   - Screenshots if UI changes
   - Testing instructions
   - Related issue numbers

#### PR Template
```markdown
## Description
Brief description of the changes made.

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested these changes:
- [ ] Unit tests pass
- [ ] Manual testing completed
- [ ] No breaking changes

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
```

## Coding Standards

### JavaScript Style Guide

#### Code Formatting
```javascript
// Use 2 spaces for indentation
function exampleFunction() {
  if (condition) {
    doSomething();
  }
}

// Use camelCase for variables and functions
const emailSummary = "example";
function processEmails() { }

// Use UPPER_SNAKE_CASE for constants
const EMAIL_MAX_CONTENT_LENGTH = 500000;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// Use single quotes for strings
const message = 'Hello world';

// Use template literals for string interpolation
const greeting = `Hello ${name}!`;
```

#### Naming Conventions
```javascript
// Functions: camelCase, descriptive names
function summarizeAndSendDailyEmail() { }
function getPreviousDayEmails() { }
function formatSummariesAsHTML() { }

// Variables: camelCase, descriptive names
const emailSummaries = [];
const processingStartTime = new Date();

// Constants: UPPER_SNAKE_CASE
const EMAIL_SEND_ENABLED = true;
const OPENAI_MODEL = "gpt-5";

// Classes/Constructors: PascalCase (if used)
function EmailProcessor() { }
```

### Code Structure

#### File Organization
```
Code.js
├── Configuration Constants (top of file)
├── Utility Functions
├── Core Processing Functions
├── API Integration Functions
├── Main Orchestration Function
└── Helper Functions
```

#### Function Organization
```javascript
// 1. Configuration and constants at top
const EMAIL_SEND_ENABLED = true;
// ... other constants

// 2. Utility functions
function getSearchStringForLastNDays(n) {
  // Implementation
}

// 3. Core business logic
function getPreviousDayEmails() {
  // Implementation
}

function summarizeEmails(emails) {
  // Implementation
}

// 4. Main orchestration
function summarizeAndSendDailyEmail() {
  // Implementation
}
```

### Documentation Standards

#### Function Documentation
```javascript
/**
 * Get emails from the previous N days
 * @param {number} days - Number of days to look back
 * @returns {string} Gmail search string
 */
function getSearchStringForLastNDays(days) {
  // Implementation
}
```

#### Inline Comments
```javascript
// Good: Explains why, not what
// Check if email should be archived based on category rules
if (!EMAIL_CATEGORIES_SKIPPED_FOR_ARCHIVE.includes(email.category)) {
  // Archive non-personal emails to reduce inbox clutter
  GmailApp.moveThreadToArchive(thread);
}

// Bad: Just repeats the code
// If category is not in skipped list
if (!EMAIL_CATEGORIES_SKIPPED_FOR_ARCHIVE.includes(email.category)) {
  // Move thread to archive
  GmailApp.moveThreadToArchive(thread);
}
```

#### Configuration Documentation
```javascript
// Debug flags - set to false for production
const EMAIL_SEND_ENABLED = true;        // Controls email sending
const EMAIL_ARCHIVE_ENABLED = true;     // Controls automatic archiving
const EMAIL_LABEL_ENABLED = true;       // Controls label management

// Search parameters
const EMAIL_SEARCH_PREVIOUS_DAYS = 1;   // Days to look back for emails
const EMAIL_SEARCH_RESULT_LIMIT = undefined; // Email limit (undefined = no limit)
```

## Testing Guidelines

### Testing Strategy

#### Manual Testing Checklist
- [ ] Test with various email types (marketing, personal, transactions)
- [ ] Verify categorization accuracy
- [ ] Check action item detection
- [ ] Test email delivery to correct address
- [ ] Verify Gmail archiving and labeling
- [ ] Test error scenarios (API failures, network issues)

#### Debug Testing
```javascript
// Enable debug mode for testing
const EMAIL_SEND_ENABLED = false;
const EMAIL_ARCHIVE_ENABLED = false;
const EMAIL_LABEL_ENABLED = false;

// Add logging for verification
console.log("Processing", emails.length, "emails");
console.log("Categories found:", [...new Set(emails.map(e => e.category))]);
```

### Performance Testing

#### Execution Time Monitoring
```javascript
// Track function execution time
function measureExecutionTime(func, ...args) {
  const start = Date.now();
  const result = func(...args);
  const duration = Date.now() - start;
  console.log(`${func.name} took ${duration}ms`);
  return result;
}

// Usage
const emails = measureExecutionTime(getPreviousDayEmails);
const summaries = measureExecutionTime(summarizeEmails, emails);
```

#### Memory Usage Tracking
```javascript
// Monitor memory-intensive operations
console.log("Processing batch of", emails.length, "emails");
console.log("Total content size:",
  emails.reduce((sum, email) => sum + email.content.length, 0));

// Warn about large batches
if (emails.length > 50) {
  console.warn("Large email batch detected, consider performance impact");
}
```

## Security Best Practices

### API Key Handling
```javascript
// Secure API key access
const OPENAI_API_KEY = PropertiesService.getScriptProperties().getProperty("OPENAI_API_KEY");

// Never log sensitive information
console.log("API configured:", !!OPENAI_API_KEY); // ✅ Safe
console.log("API key:", OPENAI_API_KEY);          // ❌ Dangerous
```

### Input Validation
```javascript
// Validate email content
function validateEmailContent(content) {
  if (typeof content !== 'string') {
    throw new Error('Content must be a string');
  }

  if (content.length > EMAIL_MAX_CONTENT_LENGTH) {
    console.warn('Content truncated due to length');
    content = content.substring(0, EMAIL_MAX_CONTENT_LENGTH);
  }

  return content;
}
```

### Error Handling
```javascript
// Safe error handling
try {
  const result = callExternalAPI();
} catch (error) {
  // Log safe error information
  console.error('API call failed:', {
    message: error.message,
    timestamp: new Date().toISOString()
    // Don't log sensitive data
  });

  // Continue processing other items
  return null;
}
```

## Code Review Guidelines

### Review Checklist
- [ ] **Functionality**: Does the code work as intended?
- [ ] **Code Quality**: Is the code clean and maintainable?
- [ ] **Documentation**: Are functions and changes documented?
- [ ] **Testing**: Has the code been tested appropriately?
- [ ] **Security**: Are there any security concerns?
- [ ] **Performance**: Does the code perform well?
- [ ] **Standards**: Does the code follow project conventions?

### Review Comments
```javascript
// Good review comment
"This function is doing too many things. Consider breaking it into smaller, focused functions."

// Bad review comment
"This is wrong."
```

### Self-Review Checklist
Before requesting review:
- [ ] Code compiles without errors
- [ ] Functions have clear, single responsibilities
- [ ] Variables and functions are well-named
- [ ] Code is properly commented
- [ ] No console.log statements in production code
- [ ] Error handling is appropriate
- [ ] Tests pass (if applicable)

## Issue Reporting

### Bug Reports
When reporting bugs, include:
- **Clear title** describing the issue
- **Steps to reproduce** the problem
- **Expected behavior** vs actual behavior
- **Environment details** (OS, Node version, etc.)
- **Screenshots or logs** if applicable
- **Severity level** (Critical, High, Medium, Low)

### Feature Requests
When requesting features, include:
- **Clear description** of the proposed feature
- **Use case** explaining why it's needed
- **Implementation ideas** if you have them
- **Impact assessment** on existing functionality
- **Priority level** for the feature

### Issue Labels
- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Documentation improvements
- `question`: Further information needed
- `wontfix`: Will not be implemented
- `duplicate`: Duplicate of existing issue

## Release Process

### Version Numbering
Follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Version number updated in package.json
- [ ] Deployment tested in staging
- [ ] Breaking changes documented
- [ ] Migration guide provided (if needed)

### Deployment Steps
1. **Create release branch**
   ```bash
   git checkout -b release/v1.2.0
   ```

2. **Update version**
   ```bash
   # Update package.json
   {
     "version": "1.2.0"
   }
   ```

3. **Update changelog**
   ```bash
   # Add entry to CHANGELOG.md
   ## [1.2.0] - 2024-01-15
   ### Added
   - New email categorization feature
   ### Fixed
   - API error handling improvements
   ```

4. **Create pull request**
   - Merge release branch to main
   - Tag the release
   - Deploy to production

## Community Guidelines

### Communication
- **Be respectful** and professional in all interactions
- **Help others** when you can
- **Ask for help** when you need it
- **Share knowledge** and best practices
- **Give credit** where due

### Getting Help
- **Check documentation** first
- **Search existing issues** for similar problems
- **Create clear, detailed issues** when needed
- **Be patient** waiting for responses
- **Follow up** if no response within a week

### Recognition
Contributors are recognized through:
- **GitHub contributor statistics**
- **Mention in release notes**
- **Credit in documentation**
- **Community recognition**

## Advanced Topics

### Working with Google Apps Script

#### Script Properties
```javascript
// Setting script properties programmatically
PropertiesService.getScriptProperties().setProperty("OPENAI_API_KEY", "your-key");

// Getting properties
const apiKey = PropertiesService.getScriptProperties().getProperty("OPENAI_API_KEY");
```

#### Triggers Management
```javascript
// List existing triggers
const triggers = ScriptApp.getProjectTriggers();
triggers.forEach(trigger => {
  console.log(trigger.getHandlerFunction());
});

// Create time-based trigger
ScriptApp.newTrigger("summarizeAndSendDailyEmail")
  .timeBased()
  .everyDays(1)
  .atHour(6)
  .create();
```

### OpenAI API Integration

#### Prompt Engineering
```javascript
// Well-structured prompt
const prompt = `
Categorize this email and identify action items:

Subject: ${email.subject}
From: ${email.from}
Content: ${email.content}

Guidelines:
- Be specific about categories
- Only flag essential action items
- Consider user context

Output format:
category: [category-name]
summary: [brief-summary]
actionItem: [action-or-none]
`;
```

#### Error Handling
```javascript
// Robust API error handling
function callOpenAI(prompt) {
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const response = UrlFetchApp.fetch(OPENAI_API_URL, options);
      return JSON.parse(response.getContentText());
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) throw error;

      // Exponential backoff
      Utilities.sleep(Math.pow(2, attempt) * 1000);
    }
  }
}
```

### Performance Optimization

#### Caching Strategies
```javascript
// Label caching
const labelCache = {};

function getOrCreateLabel(labelName) {
  if (labelCache[labelName]) {
    return labelCache[labelName];
  }

  let label = GmailApp.getUserLabelByName(labelName);
  if (!label) {
    label = GmailApp.createLabel(labelName);
  }

  labelCache[labelName] = label;
  return label;
}
```

#### Batch Processing
```javascript
// Process emails in batches
function processEmailsBatch(emails, batchSize = 10) {
  const results = [];

  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);
    const batchResults = processBatch(batch);
    results.push(...batchResults);

    // Prevent timeout
    if (i % 50 === 0) {
      Utilities.sleep(1000);
    }
  }

  return results;
}
```

## Resources

### Documentation
- [Google Apps Script Reference](https://developers.google.com/apps-script/reference)
- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [JavaScript MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

### Tools
- [clasp CLI](https://github.com/google/clasp)
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io/) for code formatting
- [GitHub Desktop](https://desktop.github.com/) for Git GUI

### Learning Resources
- [Apps Script Tutorials](https://developers.google.com/apps-script/guides)
- [JavaScript Best Practices](https://github.com/airbnb/javascript)
- [Git Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows)

Thank you for contributing to the Email Summary project! Your contributions help make email management more efficient for everyone.