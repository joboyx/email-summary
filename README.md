# Email Summary

## Overview

This project is a Google Apps Script that summarizes daily emails and sends a summary to the user's email. It categorizes emails, highlights action items, and archives threads based on predefined rules.

## Installation

To set up the project, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/email-summary.git
   cd email-summary
   ```

2. Install dependencies:

   - Use `nvm` to install `node` and `npm`
     ```bash
     nvm install
     nvm use
     ```

3. Set up configuration files:

   - Create a `.clasp.json` file with your project details:

     ```json
     {
       "projectId": "emailsummary-438014",
       "scriptId": "18591sxMWX_gcdwUgzcfiQcjzKhZGxWj1WPJPHrznwuhMNZDQbK7HaEz0",
       "rootDir": "~/workspace/email-summary"
     }
     ```

   - Ensure you have a `credentials.json` file for Google API access. This file should be obtained from the Google Cloud Console > Credentials > OAuth 2.0 Client IDs > Desktop App > Download JSON.

4. Set up Google Apps Script:

   - Log in to clasp with your Google account, this would generate a `.clasprc.json` file:
     ```bash
     npm run setup
     ```

5. Deploy the script:

   - Push and deploy the script:
     ```bash
     npm run deploy
     ```

6. Create a trigger for the script to run daily:
   - Go to the Apps Script editor
   - Click on the clock icon on the left sidebar to open the triggers page
   - Click on `+ Add Trigger`
   - Select `summarizeAndSendDailyEmail` from the function dropdown
   - Select `Time-driven` from the `Event source` dropdown
   - Select `Day timer` from the `Type of time` dropdown
   - Select `5 to 6am` from the `Time of day` dropdown
   - Select `Notify me immediately` from the `Failure notification settings` dropdown

## Usage

To run the script and send the daily email summary, use the following command:

```bash
npm start
```

To test the script, which includes pushing, deploying, and running it, use:

```bash
npm test
```

To watch the logs in the terminal, use:

```bash
npm run watch
```

To open the logs in a browser, use:

```bash
npm run watch:open
```

## Deployment Process

After making local changes and testing, follow these steps to deploy to production:

### Pre-deployment Checklist
- Ensure all debug configuration values in `Code.js` are set to their default production values:
  - `EMAIL_SEND_ENABLED = true`
  - `EMAIL_ARCHIVE_ENABLED = true` 
  - `EMAIL_LABEL_ENABLED = true`
  - `EMAIL_SEARCH_PREVIOUS_DAYS = 1`
  - `EMAIL_SEARCH_RESULT_LIMIT = undefined`

### Deployment Steps

1. **Deploy the script:**
   ```bash
   npm run deploy
   ```
   
2. **Update the trigger:** 
   - Copy the Google Apps Script URL from the deploy output
   - Open the URL and update/recreate the time-based trigger for the new deployment

3. **Update deployment tracking:**
   - Note the deployment ID from the deploy command output
   - Update `package.json` → `meta.activeDeploymentId` with the new deployment number

4. **Clean up old deployments:**
   ```bash
   npm run deployments:list
   npm run deployments:cleanup
   ```

5. **Commit changes:**
   Since `package.json` was updated with the new deployment ID, commit and push the changes to track the active deployment.

### Quick Deployment Command
Use the custom Claude command for streamlined deployment:
```bash
project:deploy
```

This command automates the entire deployment process including configuration validation, deployment, cleanup, and git operations.

## References

- For more information on `clasp`, visit the [clasp GitHub repository](https://github.com/google/clasp).
- Detailed instructions on running scripts can be found in the [clasp run documentation](https://github.com/google/clasp/blob/master/docs/run.md).
