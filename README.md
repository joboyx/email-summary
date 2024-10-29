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
   - Install [clasp](https://github.com/google/clasp) globally:
     ```bash
     npm install -g @google/clasp
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

## References

- For more information on `clasp`, visit the [clasp GitHub repository](https://github.com/google/clasp).
- Detailed instructions on running scripts can be found in the [clasp run documentation](https://github.com/google/clasp/blob/master/docs/run.md).
