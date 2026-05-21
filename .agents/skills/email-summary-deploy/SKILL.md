---
name: email-summary-deploy
description: >-
  Deploy the email-summary Google Apps Script to production: validate src/config.ts production
  flags, run clasp deploy, update meta.activeDeploymentId, clean old deployments, and remind the
  operator to recreate the time trigger. Use when deploying email-summary, running npm run deploy
  for this project, or updating the active Apps Script deployment.
triggers:
  - 'email-summary-deploy'
  - 'deploy email-summary'
  - 'deploy email summary'
---

# email-summary-deploy

Run from the **email-summary** repository root (`npm` scripts assume this cwd).

## Pre-deployment

1. Read `src/config.ts` and confirm production defaults:
   - `EMAIL_SEND_ENABLED = true`
   - `EMAIL_ARCHIVE_ENABLED = true`
   - `EMAIL_LABEL_ENABLED = true`
   - `EMAIL_SEARCH_PREVIOUS_DAYS = 1`
   - `EMAIL_SEARCH_RESULT_LIMIT = undefined`
2. If any value is wrong, fix it in `src/config.ts` before deploying. Do not deploy with debug flags.

## Deployment workflow

Execute in order:

1. **Deploy**

   ```bash
   npm run deploy
   ```

   Capture output: Google Apps Script project URL and new deployment ID (numeric, from `clasp deploy`).

2. **Trigger reminder (manual)**
   Tell the operator to open the Apps Script URL from deploy output and recreate the time-based trigger for `summarizeAndSendDailyEmail`. This step is not automated.

3. **Update deployment tracking**
   Set `package.json` → `meta.activeDeploymentId` to the new deployment ID from step 1.

4. **Clean up old deployments**

   ```bash
   npm run deployments:list
   npm run deployments:cleanup
   ```

   Show output from both commands.

5. **Commit (only if asked)**
   If the user wants the deployment ID tracked in git:
   ```bash
   git add package.json
   git commit -m "chore(deploy): update active deployment ID to <DEPLOYMENT_ID>"
   ```
   Push only when the user explicitly asks.

## Success criteria

- Production config validated in `src/config.ts`
- `npm run deploy` succeeded
- `meta.activeDeploymentId` updated
- Old deployments cleaned up
- Operator reminded to recreate the time trigger manually

## Error handling

- Config validation fails → fix `src/config.ts`, rebuild if needed, then retry deploy
- Deploy fails → check clasp auth (`npm run auth:status`), `.clasp.json` `rootDir` (`dist/`), and `docs/clasp-auth.md`
- Cleanup fails → confirm `meta.activeDeploymentId` matches the live deployment before retrying
- Git commit fails → report status; do not force-push

## References

- Manual checklist: `README.md` → Deployment Process
- Clasp auth: `docs/clasp-auth.md`
- Post-deploy trigger notes: `docs/deployment.md`, `AGENTS.md`
