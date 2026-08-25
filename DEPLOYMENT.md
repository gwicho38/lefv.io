# Deployment

The site runs on Cloudflare Workers. Static assets and the API are served by a
single Worker; there is no server to maintain and no database.

- Worker: `lefv-io`
- URL: https://lefv-io.lefv.workers.dev
- Config: [`wrangler.jsonc`](wrangler.jsonc)
- Entry point: [`worker/index.ts`](worker/index.ts)

## Publishing a blog post

Add a markdown file to `content/blog/`, commit, and push to `release`. CI builds
and deploys. Frontmatter supports `title`, `date`, `excerpt`, `tags`, `draft`.

Posts are read from disk at build time and compiled into the Worker bundle
(`worker/posts.generated.json`), because Workers have no filesystem at runtime.

## Deploying

Automatic on push to `release` via [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml).
Tests and both typechecks must pass first.

Manual:

```bash
npm run deploy:worker
```

## Required GitHub secrets

| Secret | Purpose |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Deploy permission ("Edit Cloudflare Workers" template) |
| `CLOUDFLARE_ACCOUNT_ID` | Target account |

## Local development

```bash
npm run dev         # Express server on :5001
npm run dev:worker  # Worker runtime, matches production
```
