# Project Deploy Command

Deploy the Email Summary Google Apps Script to production with full automation.

## Overview

This command automates the complete deployment process for the Google Apps Script email summarizer, including configuration validation, deployment, cleanup, and git operations.

## Pre-deployment Actions

1. **Validate production configuration in Code.js:**
   - Verify `EMAIL_SEND_ENABLED = true`
   - Verify `EMAIL_ARCHIVE_ENABLED = true`
   - Verify `EMAIL_LABEL_ENABLED = true`
   - Verify `EMAIL_SEARCH_PREVIOUS_DAYS = 1`
   - Verify `EMAIL_SEARCH_RESULT_LIMIT = undefined`
   - If any values are incorrect, update them to production defaults

## Deployment Process

Execute the following steps in sequence:

1. **Deploy the script:**
   ```bash
   npm run deploy
   ```
   - Capture and show the output, especially the Google Apps Script URL
   - Note the deployment ID from the command output

2. **Display trigger update instructions:**
   - Show the Google Apps Script URL from the deploy output
   - Remind user to update/recreate the time-based trigger using this URL
   - Emphasize this is a manual step they need to complete

3. **Update deployment tracking:**
   - Use the deployment ID from the deploy command output
   - Update `package.json` → `meta.activeDeploymentId` with the new deployment number. This is used by `npm run deployments:cleanup` to ignore this deployment ID since it's the one active in PROD.

4. **Clean up old deployments:**
   ```bash
   npm run deployments:list
   npm run deployments:cleanup
   ```
   - Show the output from both commands

5. **Commit changes:**
   - Add and commit the updated `package.json` with conventional commit format:
   ```bash
   git add package.json
   git commit -m "chore(deploy): update active deployment ID to [DEPLOYMENT_ID]"
   git push
   ```

## Success Criteria

- ✅ Configuration validated and set to production values
- ✅ Script successfully deployed to Google Apps Script
- ✅ Deployment ID updated in package.json
- ✅ Old deployments cleaned up
- ✅ Changes committed and pushed to repository
- ⚠️ User reminded to manually update trigger in Google Apps Script

## Error Handling

- If configuration validation fails, fix the values in Code.js before proceeding
- If deployment fails, check clasp authentication and project configuration
- If git operations fail, ensure working directory is clean and repository is accessible

## Post-deployment Reminder

Always remind the user that they need to manually update the trigger in Google Apps Script using the URL provided in the deploy output. This is a critical manual step that cannot be automated.