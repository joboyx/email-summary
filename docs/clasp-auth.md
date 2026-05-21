# Clasp authentication

Clasp uses **two separate OAuth credential files**. Both are required for full local development.

## Credential files

| File              | Created by                                                     | Used for                                                             |
| ----------------- | -------------------------------------------------------------- | -------------------------------------------------------------------- |
| `~/.clasprc.json` | `npm run setup:global` (`clasp login`)                         | `clasp push`, `pull`, `deploy`, `logs`, `deployments`, …             |
| `./.clasprc.json` | `npm run setup:local` (`clasp login --creds credentials.json`) | `clasp run` / `npm start` (Execution API with your GCP OAuth client) |

`npm run setup` runs **global first, then local**. Do not skip global login: `npm run setup:local` alone is not enough for push or deploy.

`credentials.json` is your Google Cloud **Desktop** OAuth client for project `emailsummary-438014` (see `.clasp.json` → `projectId`). It is not committed.

## Setup commands

```bash
nvm install && nvm use
npm install
npm run setup          # global + local (interactive browser sign-in for each)
npm run auth:status    # should print your Google account email
```

Run steps individually when refreshing tokens:

```bash
npm run setup:global   # refresh ~/.clasprc.json
npm run setup:local    # refresh ./.clasprc.json
```

## Verify authentication

**Global (push / pull / deploy):**

```bash
npm run auth:status
npx clasp pull
```

**Local (`npm start`):** after `setup:local`, run `npm start` or check that `./.clasprc.json` exists and was updated recently.

## `setup:local` exit code 1

`setup:local` may print `Authorization successful` and still exit with code **1** when clasp tries to enable the Apps Script API on the GCP project (`enableAppsScriptAPI`). Local credentials are usually saved anyway.

If that happens:

1. Confirm `./.clasprc.json` exists and is recent.
2. Confirm global auth: `npm run auth:status` and `npx clasp pull`.
3. Re-run `npm run setup:local` only if `npm start` fails with auth errors.

## Common errors

### `invalid_grant` on `clasp pull` / `clasp push`

Usually **stale global** credentials. Global commands do not use `./.clasprc.json`.

```bash
npm run setup:global
npm run auth:status
npx clasp pull
```

### `invalid_grant` after only `npm run setup` / `setup:local`

You may have refreshed local creds but not global. Run `npm run setup:global`.

### Logged in locally but push fails

Expected: run `npm run setup:global`. See [clasp config files](https://github.com/google/clasp/blob/master/docs/config-files.md) — auth defaults to global unless `--auth` is set.

## WSL / headless

If the browser redirect to `localhost` fails, use manual code entry:

```bash
npx clasp login --no-localhost
npx clasp login --creds credentials.json --no-localhost
```

## References

- [clasp run prerequisites](https://github.com/google/clasp/blob/master/docs/run.md)
- [clasp config files](https://github.com/google/clasp/blob/master/docs/config-files.md)
