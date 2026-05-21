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

## One-Time Trigger Setup

Create the daily trigger **once** in the Apps Script UI. Routine deploys update the bound deployment in place; you do not recreate the trigger after each deploy.

1. Open the [script editor](https://script.google.com/home/projects/18591sxMWX_gcdwUgzcfiQcjzKhZGxWj1WPJPHrznwuhMNZDQbK7HaEz0/edit) → Triggers → **Add Trigger**
2. Function: `summarizeAndSendDailyEmail`
3. Deployment: **Version `@N`** matching `package.json` → `meta.activeDeploymentVersion`
4. Event source: Time-driven → Day timer → 5am to 6am (GMT+08:00)
5. Failure notification: **Notify me immediately** (UI-only; cannot be set via API)

If a Head-bound trigger exists from a prior setup, delete it first.

## Routine Deployment

```bash
npm run deploy
```

This executes:

1. `npm run test`: Lint, type coverage, Jest, and build.
2. `node scripts/clasp-deployment.mjs deploy`: Push, redeploy in place (clasp ID from `meta.activeDeploymentVersion`), auto-update `meta.activeDeploymentVersion`.

Requires **global** clasp auth only (`npm run setup:global`).

### Post-Deploy Steps

1. Optionally commit the updated `package.json` (`meta.activeDeploymentVersion` changes automatically).
2. Optionally verify in Apps Script → Triggers that the trigger deployment version matches.

**OpenRouter migration:** Ensure `OPENROUTER_API_KEY` is set in script properties before deploying. Remove `OPENAI_API_KEY` after verifying a successful run.

## Testing the Deployment

```bash
npm start  # run summarizeAndSendDailyEmail via clasp run
```

`npm test` is local-only verification: lint with zero warnings, type coverage on `src/`, Jest tests in `test/`, and the TypeScript build.

## Deployment Maintenance

- List deployments: `npm run deployments:list` (wraps `clasp deployments`).
- Clean up old deployments: `npm run deployments:cleanup`.
  - Keeps the deployment at `meta.activeDeploymentVersion` and `@HEAD`.
  - Undeploys all other versioned deployments.

## Rollback Strategy

- Identify the previous stable version (`npm run deployments:list`).
- Set `meta.activeDeploymentVersion` to that version, then redeploy: `npm run deploy` (resolves clasp ID for that version), or use Apps Script UI to edit the deployment.
- The UI trigger bound to that deployment picks up the rolled-back version when redeployed in place.

## Continuous Improvements

- Maintain a changelog (`docs/changelog.md`) for human-readable history of deployment updates and configuration changes.
