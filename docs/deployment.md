# Deployment Guide

## Prerequisites

- Node.js version from `.nvmrc` (install via `nvm install && nvm use`).
- `@google/clasp` dev dependency installed (`npm install`).
- Google OAuth credentials stored at `credentials.json` (downloaded from Google Cloud console).
- `.clasp.json` configured with correct `projectId`, `scriptId`, and `rootDir` (must point at `dist/` after TypeScript build).
- Script property `OPENROUTER_API_KEY` set in the Apps Script project settings (remove legacy `OPENAI_API_KEY` after migration).

## Initial Setup

```bash
nvm install
nvm use
npm install
npm run setup        # setup:global (~/.clasprc.json) then setup:local (./.clasprc.json)
npm run auth:status  # verify global login
```

Clasp auth is split: **global** for push/deploy, **local** (`credentials.json`) for `clasp run`. See [clasp-auth.md](clasp-auth.md).

## Routine Deployment

```bash
npm run deploy
```

This executes:

1. `npm run build`: Compiles `src/*.ts` to `dist/*.js` and copies `appsscript.json`.
2. `clasp push --force`: Uploads compiled files from `dist/` to Apps Script.
3. `clasp deploy`: Creates a new deployment version.
4. Prints a reminder to recreate the time trigger and the project URL.

### Post-Deploy Steps

1. Copy the Apps Script URL emitted by the deploy command (or stored in README).
2. Open the Apps Script editor, navigate to Triggers, delete the existing time-based trigger, and create a new one pointing to the latest deployment (`summarizeAndSendDailyEmail`).
3. Update `package.json` → `meta.activeDeploymentId` with the deployment number displayed in the deploy output.
4. Commit and push the change to `package.json` to record the active deployment.

**OpenRouter migration:** Ensure `OPENROUTER_API_KEY` is set in script properties before deploying. Remove `OPENAI_API_KEY` after verifying a successful run.

## Testing the Deployment

```bash
npm start  # run summarizeAndSendDailyEmail via clasp run
```

`npm test` is local-only verification: lint with zero warnings, Jest tests in `test/`, and the TypeScript build.

## Deployment Maintenance

- List deployments: `npm run deployments:list` (wraps `clasp deployments`).
- Clean up old deployments: `npm run deployments:cleanup`.
  - Retains the active deployment ID from `package.json` and the `HEAD` deployment.
  - Uses shell pipeline in `package.json` to undeploy older versions.

## Rollback Strategy

- Identify the previous stable deployment ID (`npm run deployments:list`).
- Update `package.json` → `meta.activeDeploymentId` to that ID for tracking.
- In Apps Script, set the trigger to use the older deployment.
- Optionally redeploy the previous version using `clasp deploy -i <deploymentId>` if the version was deleted.

## Continuous Improvements

- Consider automating trigger updates via Apps Script API if manual steps become a bottleneck.
- Maintain a changelog (`docs/changelog.md`) for human-readable history of deployment updates and configuration changes.
