---
name: email-summary-deploy
description: >-
  Deploy the email-summary Google Apps Script to production: validate src/config.ts production
  flags, run npm run deploy (tests + redeploy in place + auto-update activeDeploymentVersion),
  and clean old deployments. Use when deploying email-summary or updating the active Apps Script
  deployment.
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
3. Confirm global clasp auth: `npm run auth:status`.

## Deployment workflow

Execute in order:

1. **Deploy**

   ```bash
   npm run deploy
   ```

   Runs `npm run test`, then push + redeploy in place. `meta.activeDeploymentVersion` is updated automatically in `package.json`.

2. **Clean up old deployments**

   ```bash
   npm run deployments:list
   npm run deployments:cleanup
   ```

   Show output from both commands. Cleanup keeps the deployment at `activeDeploymentVersion` and `@HEAD`.

3. **Commit**
   After deploy and cleanup, commit the updated `activeDeploymentVersion`:
   ```bash
   git add package.json
   git commit -m "chore(deploy): update activeDeploymentVersion to <VERSION>"
   ```
   Push only when the user explicitly asks.

## Trigger (one-time, not part of deploy)

The daily trigger is created once in Apps Script UI, bound to `meta.activeDeploymentVersion`. Do not recreate after each deploy. If missing or bound to Head, instruct the operator to set it up per `docs/deployment.md`.

## Success criteria

- Production config validated in `src/config.ts`
- `npm run deploy` succeeded (tests passed, redeploy in place, `activeDeploymentVersion` auto-updated)
- Old deployments cleaned up (when cleanup step run)
- `package.json` committed with updated `activeDeploymentVersion`

## Error handling

- Config validation fails → fix `src/config.ts`, then retry deploy
- Tests fail → fix locally; deploy does not run
- Deploy fails → check clasp auth (`npm run auth:status`), `.clasp.json` `rootDir` (`dist/`), and `docs/clasp-auth.md`
- Cleanup fails → confirm `meta.activeDeploymentVersion` matches a live deployment before retrying
- Git commit fails → report status; do not force-push

## References

- Manual checklist: `README.md` → Deployment Process
- Clasp auth: `docs/clasp-auth.md`
- Trigger config: `docs/configuration.md`, `docs/deployment.md`
