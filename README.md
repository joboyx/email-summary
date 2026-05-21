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
       "rootDir": "~/workspace/email-summary/src"
     }
     ```

   - Ensure you have a `credentials.json` file for Google API access. This file should be obtained from the Google Cloud Console > Credentials > OAuth 2.0 Client IDs > Desktop App > Download JSON.

4. Authenticate with clasp (two logins required):

   Clasp keeps **global** and **local** credentials separately. Push, pull, and deploy use global auth (`~/.clasprc.json`). `clasp run` / `npm start` use local auth (`./.clasprc.json` from your `credentials.json`).

   ```bash
   npm run setup          # runs setup:global, then setup:local (browser sign-in each)
   npm run auth:status    # confirm global login (prints your Google account)
   npx clasp pull         # optional: confirm push/pull auth works
   ```

   To refresh tokens later:

   ```bash
   npm run setup:global   # push, pull, deploy, logs
   npm run setup:local    # npm start / clasp run only
   ```

   See [docs/clasp-auth.md](docs/clasp-auth.md) for `invalid_grant`, WSL/headless, and `setup:local` exiting with code 1 after credentials are saved.

5. Set the OpenRouter API key in Apps Script:

   - Open the [script editor](https://script.google.com/home/projects/18591sxMWX_gcdwUgzcfiQcjzKhZGxWj1WPJPHrznwuhMNZDQbK7HaEz0/edit) → **Project Settings** → **Script properties**
   - Add `OPENROUTER_API_KEY` with your OpenRouter API key ([openrouter.ai/keys](https://openrouter.ai/keys))
   - Remove legacy `OPENAI_API_KEY` if present

   **Migration note:** Set `OPENROUTER_API_KEY` before deploying code that reads it; the script fails fast if the property is missing.

6. Deploy the script:

   - Push and deploy the script:
     ```bash
     npm run deploy
     ```

7. Create a trigger for the script to run daily:
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
- Ensure all debug configuration values in `src/config.js` are set to their default production values:
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
The Claude Code CLI bundles an automated deployment helper. Launch the CLI and run the command:
```bash
claude
claude> /project:deploy
```

This runs the scripted flow described in [the deployment helper](.claude/commands/project/deploy.md). If you prefer to execute each step manually, follow the procedures in Deployment Steps and do it manually.

## References

- [Clasp authentication (this project)](docs/clasp-auth.md) — global vs local credentials, troubleshooting
- [clasp GitHub repository](https://github.com/google/clasp)
- [clasp run documentation](https://github.com/google/clasp/blob/master/docs/run.md)
