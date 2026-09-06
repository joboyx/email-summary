# JBY-058 identity rewrite — blocked

Do not merge this branch.

## Current main tip

`e006cb2564ebdffb520aa7f68e6dc279bbfa9e08`

Visibility remains private.

## Scan (2026-09-06)

- 56 commits on `main`
- 28 commits have work-domain author and committer emails
- Trees were not rewritten
- No new rewrite tip exists

## Blocker

This Cloud Agent host can read the repository through the GitHub API as `joboyx-bot`.
Git clone and `git push --force-with-lease` fail because the git credential is the Cursor installation account, not `joboyx-bot`.
No `github-joboyx-bot.pat` file is present on the host.

## Resume

1. Clone `joboyx/email-summary` with a `joboyx-bot` token.
2. Run `git filter-repo --force --mailmap` with the JBY-058 mailmap.
3. Confirm zero work-domain author and committer emails, and unchanged trees.
4. Push with:

```text
git push --force-with-lease=refs/heads/main:e006cb2564ebdffb520aa7f68e6dc279bbfa9e08 origin HEAD:main
```
