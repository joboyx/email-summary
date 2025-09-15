# Migration Guide

## Overview

This guide provides instructions for migrating between versions of the Email Summary system, including upgrade procedures, breaking changes, and data migration steps.

## Current Version: 1.0.0

This migration guide is for the current stable release (v1.0.0). Future versions will add migration paths as needed.

## General Migration Process

### Pre-Migration Checklist
- [ ] Backup current configuration
- [ ] Test migration in development environment
- [ ] Review breaking changes documentation
- [ ] Plan rollback procedure
- [ ] Schedule maintenance window
- [ ] Notify users of potential downtime

### Migration Steps
1. **Preparation**: Set up new environment
2. **Data Backup**: Preserve existing configuration
3. **Code Update**: Deploy new version
4. **Configuration**: Update settings for new version
5. **Testing**: Verify functionality
6. **Deployment**: Switch to production
7. **Monitoring**: Watch for issues
8. **Cleanup**: Remove old versions

### Rollback Plan
- Keep previous version deployed but disabled
- Maintain backup of configuration
- Document rollback triggers and procedures
- Test rollback process before migration

## Version-Specific Migrations

### Migrating from v0.9.0 to v1.0.0

#### What Changed
- **Configuration**: Debug flags now default to `true` for safety
- **API Integration**: Updated to OpenAI GPT-5 model
- **Error Handling**: Enhanced error recovery and logging
- **Performance**: Improved caching and batch processing
- **Security**: Better input validation and secure logging

#### Migration Steps

**Step 1: Code Update**
```bash
# Deploy new version
npm run deploy

# Update deployment tracking
# Edit package.json
{
  "meta": {
    "activeDeploymentId": 72  // New deployment ID
  }
}
```

**Step 2: Configuration Updates**
```javascript
// Code.js - Update debug flags for production
const EMAIL_SEND_ENABLED = true;        // Now defaults to true
const EMAIL_ARCHIVE_ENABLED = true;     // Now defaults to true
const EMAIL_LABEL_ENABLED = true;       // Now defaults to true

// Update API model
const OPENAI_MODEL = "gpt-5";           // Updated from older models

// New configuration options
const EMAIL_MAX_CONTENT_LENGTH = 500000; // Content limit
const EMAIL_CATEGORIES_SKIPPED_FOR_ARCHIVE = ["personal"];
```

**Step 3: API Key Verification**
```bash
# Verify OpenAI API key in Apps Script
# Settings → Script properties → OPENAI_API_KEY

# Test API connectivity
npm start
```

**Step 4: Trigger Updates**
1. Open [Google Apps Script Editor](https://script.google.com/)
2. Go to Triggers (clock icon)
3. Delete old trigger
4. Create new trigger:
   - Function: `summarizeAndSendDailyEmail`
   - Time-driven → Day timer → 5-6 AM

**Step 5: Testing**
```javascript
// Test with debug mode first
const EMAIL_SEND_ENABLED = false;
const EMAIL_ARCHIVE_ENABLED = false;
const EMAIL_LABEL_ENABLED = false;

// Run test execution
npm start

// Verify logs and functionality
npm run watch
```

#### Breaking Changes
- None in v1.0.0 (backwards compatible)
- All changes are additive or improvements

#### Rollback Procedure
```bash
# If issues occur, rollback to v0.9.0
npx clasp deploy --version 65  # Previous deployment ID

# Restore old configuration
# Revert debug flags to previous settings
# Update triggers to point to old deployment
```

### Migrating from v0.8.0 to v1.0.0

#### Additional Steps for v0.8.0 Users
Since v0.8.0 was an alpha release, additional setup may be required:

**Step 1: Complete Initial Setup**
```bash
# Ensure all prerequisites are met
npm install
npm run setup

# Verify Google Cloud project configuration
cat .clasp.json
```

**Step 2: API Configuration**
```bash
# Set up OpenAI API key
# This was not required in v0.8.0
# Add to Apps Script properties
```

**Step 3: Category System Setup**
```javascript
// v1.0.0 includes full category system
// Previous versions had basic categorization
const EMAIL_CATEGORIES = [
  // Full category definitions now available
];
```

## Future Version Migrations

### Planned: v1.1.0 Migration

#### Expected Changes
- Enhanced categorization with custom categories
- Improved action item detection
- Performance optimizations
- Additional logging features

#### Migration Preview
```javascript
// New configuration options (example)
const CUSTOM_CATEGORIES_ENABLED = true;
const ENHANCED_LOGGING_ENABLED = true;
const PERFORMANCE_MONITORING = true;

// New category definitions
const CUSTOM_EMAIL_CATEGORIES = [
  { name: "finance", emoji: "💰", description: "Financial reports" }
];
```

#### Migration Steps (Projected)
1. Update to new category system
2. Enable enhanced features
3. Configure performance monitoring
4. Test with sample emails

### Planned: v1.2.0 Migration

#### Expected Changes
- Multi-language support
- Advanced filtering options
- Calendar API integration
- Mobile-responsive templates

#### Migration Preview
```javascript
// New features configuration
const MULTI_LANGUAGE_ENABLED = true;
const CALENDAR_INTEGRATION = true;
const MOBILE_TEMPLATES = true;

// Language settings
const SUPPORTED_LANGUAGES = ["en", "es", "fr"];
const DEFAULT_LANGUAGE = "en";
```

### Planned: v2.0.0 Migration (Major)

#### Breaking Changes Expected
- Architecture changes for multi-platform support
- API endpoint exposure
- Database integration for persistence
- Authentication system changes

#### Migration Considerations
- **Data Migration**: User preferences and configuration
- **API Changes**: New endpoints and authentication
- **UI Changes**: Updated user interface
- **Integration Changes**: Third-party service connections

## Environment Migration

### Development to Production

#### Configuration Differences
```javascript
// Development
const EMAIL_SEND_ENABLED = false;
const EMAIL_SEARCH_RESULT_LIMIT = 5;

// Production
const EMAIL_SEND_ENABLED = true;
const EMAIL_SEARCH_RESULT_LIMIT = undefined;
```

#### Migration Steps
1. Update `.clasp.json` with production project ID
2. Change configuration constants for production
3. Update API keys for production environment
4. Test in production-like conditions
5. Deploy and monitor

### Google Cloud Project Migration

#### Moving Between Projects
```bash
# Create new clasp configuration
cp .clasp.json .clasp.prod.json

# Edit with new project details
{
  "projectId": "new-project-id",
  "scriptId": "new-script-id"
}

# Deploy to new project
npx clasp clone
npx clasp push
```

#### Permission Migration
1. Grant necessary permissions in new project
2. Update OAuth consent screen
3. Re-authorize applications
4. Test API access

## Data Migration

### Configuration Migration

#### Exporting Configuration
```javascript
// Script to export current configuration
function exportConfiguration() {
  const config = {
    debugFlags: {
      EMAIL_SEND_ENABLED,
      EMAIL_ARCHIVE_ENABLED,
      EMAIL_LABEL_ENABLED
    },
    searchParams: {
      EMAIL_SEARCH_PREVIOUS_DAYS,
      EMAIL_SEARCH_RESULT_LIMIT
    },
    apiSettings: {
      OPENAI_MODEL,
      EMAIL_MAX_CONTENT_LENGTH
    },
    categories: EMAIL_CATEGORIES,
    labels: {
      EMAIL_LABEL_ROOT,
      EMAIL_LABEL_ACTION_REQUIRED
    }
  };

  console.log("Current Configuration:", JSON.stringify(config, null, 2));
  return config;
}
```

#### Importing Configuration
```javascript
// Script to import configuration
function importConfiguration(config) {
  // Validate configuration
  if (!config.debugFlags) {
    throw new Error("Invalid configuration: missing debug flags");
  }

  // Apply configuration
  // Note: This would require code changes for each version
  console.log("Configuration imported successfully");
}
```

### User Data Migration

#### Gmail Label Migration
```javascript
// Migrate existing labels
function migrateLabels() {
  const oldLabels = GmailApp.getUserLabels();
  const migratedLabels = [];

  oldLabels.forEach(label => {
    if (label.getName().startsWith("OldPrefix")) {
      // Create new label structure
      const newName = label.getName().replace("OldPrefix", EMAIL_LABEL_ROOT);
      const newLabel = getOrCreateLabel(newName);
      migratedLabels.push({ old: label.getName(), new: newName });
    }
  });

  console.log("Labels migrated:", migratedLabels);
  return migratedLabels;
}
```

#### Email History Migration
- Email processing history is not stored (privacy protection)
- No migration needed for historical data
- New processing starts fresh with each version

## Troubleshooting Migration

### Common Migration Issues

#### Configuration Errors
**Problem:** New configuration options not set
**Solution:**
```javascript
// Check for missing configuration
const requiredConfig = [
  'EMAIL_SEND_ENABLED',
  'EMAIL_ARCHIVE_ENABLED',
  'EMAIL_LABEL_ENABLED'
];

requiredConfig.forEach(config => {
  if (typeof eval(config) === 'undefined') {
    console.error(`Missing configuration: ${config}`);
  }
});
```

#### API Key Issues
**Problem:** API keys not transferred
**Solution:**
- Check Apps Script properties
- Verify API key validity
- Test API connectivity
- Update key if expired

#### Permission Errors
**Problem:** OAuth permissions not granted
**Solution:**
- Re-run authentication flow
- Check OAuth scopes
- Verify Google Cloud project permissions
- Update consent screen if needed

#### Trigger Failures
**Problem:** Time-based triggers not working
**Solution:**
- Delete old triggers
- Create new triggers with correct function names
- Verify deployment version
- Check execution permissions

### Rollback Troubleshooting

#### Failed Rollback
**Problem:** Cannot rollback to previous version
**Solution:**
- Check deployment history
- Verify previous version exists
- Restore from backup
- Manual configuration recovery

#### Data Loss During Rollback
**Problem:** Configuration lost during rollback
**Solution:**
- Use backup configuration
- Recreate settings manually
- Test functionality after rollback
- Document lessons learned

## Testing Migration

### Migration Testing Checklist
- [ ] Configuration validation
- [ ] API connectivity testing
- [ ] Email processing verification
- [ ] Trigger functionality testing
- [ ] Error handling validation
- [ ] Performance testing
- [ ] User acceptance testing

### Automated Testing
```javascript
// Migration test suite
function runMigrationTests() {
  const tests = [
    { name: "Configuration Test", func: testConfiguration },
    { name: "API Test", func: testAPIConnectivity },
    { name: "Processing Test", func: testEmailProcessing },
    { name: "Trigger Test", func: testTriggers }
  ];

  const results = [];
  tests.forEach(test => {
    try {
      test.func();
      results.push({ test: test.name, status: "PASS" });
    } catch (error) {
      results.push({ test: test.name, status: "FAIL", error: error.message });
    }
  });

  console.log("Migration Test Results:", results);
  return results;
}
```

## Best Practices

### Migration Planning
- **Test First**: Always test migration in development
- **Backup Everything**: Preserve all configuration and data
- **Plan Rollback**: Have rollback procedures ready
- **Communicate**: Inform users of migration schedule
- **Monitor Closely**: Watch for issues post-migration

### Risk Mitigation
- **Staged Rollback**: Deploy to subset of users first
- **Feature Flags**: Use feature flags for gradual rollout
- **Monitoring**: Implement comprehensive monitoring
- **Support Ready**: Have support team ready for issues

### Documentation
- **Update Docs**: Keep migration guides current
- **Version Tracking**: Track which version each user is on
- **Change Logs**: Document all changes in changelog
- **User Communication**: Inform users of changes and benefits

## Support and Resources

### Getting Help
- Check this migration guide
- Review troubleshooting documentation
- Create issue in repository
- Contact development team

### Additional Resources
- [Version Changelog](CHANGELOG.md)
- [Troubleshooting Guide](TROUBLESHOOTING.md)
- [Configuration Guide](CONFIGURATION.md)
- [Development Guide](DEVELOPMENT.md)

### Emergency Contacts
- **Migration Issues**: development@example.com
- **System Problems**: support@example.com
- **Security Concerns**: security@example.com

---

## Future Migration Templates

### Template for Minor Version Updates
```markdown
## Migrating from v{current} to v{next}

### Changes
- List of changes and new features

### Migration Steps
1. Step-by-step migration instructions
2. Configuration updates needed
3. Testing procedures

### Breaking Changes
- List any breaking changes
- Alternative approaches for affected features

### Rollback
- How to rollback if needed
- Data preservation considerations
```

### Template for Major Version Updates
```markdown
## Migrating from v{current} to v{next} (Major)

### Major Changes
- Architecture changes
- Breaking API changes
- New required dependencies

### Pre-Migration Requirements
- System requirements
- Data backup procedures
- User communication plan

### Migration Process
1. Detailed step-by-step process
2. Configuration migration
3. Data migration procedures
4. Testing and validation

### Post-Migration
- Monitoring and support
- Performance optimization
- User training if needed

### Rollback Considerations
- Feasibility of rollback
- Data restoration procedures
- Alternative approaches
```

---

*This migration guide will be updated with each new version release.*