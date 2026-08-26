# Publishing

The site is a static React app plus a small API, both served by one Cloudflare
Worker. There is no server, no database, and no origin to keep alive.

- Worker: `lefv-io`
- Serves: `lefv.io`, `www.lefv.io`, `lefv.info`, `www.lefv.info`
- Config: [`wrangler.jsonc`](wrangler.jsonc) — including the routes
- Entry point: [`worker/index.ts`](worker/index.ts)

## Publishing a post

1. Add a markdown file to `content/blog/`
2. Commit and push to `main`

That is the whole process. [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml)
runs the tests and, if they pass, deploys. Roughly 40 seconds end to end.

Frontmatter keys: `title`, `date`, `excerpt`, `tags`, `draft`. A post with
`draft: true` is excluded from the list, the feed, and its own URL.

The filename becomes the slug: `My First Post.md` serves at `/blog/my-first-post`.

## Images in a post

Put the file in `client/public/images/` and reference it with an absolute path:

```markdown
![Alt text](/images/my-picture.png)
```

Vite copies that directory into the build and the Worker serves it from the
assets binding, where static assets are free and uncapped. Nothing else to
configure, and no external image host involved.

## How posts reach the Worker

Workers have no filesystem, so posts cannot be read at request time. `npm run
bake-posts` parses `content/blog/*.md` and writes `worker/posts.generated.json`,
which is compiled into the bundle. The build runs it automatically; the file is
gitignored because it is generated.

## Commands

```bash
npm run dev      # local Worker on the production runtime
npm test         # 102 tests
npm run deploy   # manual deploy, bypassing CI
```

## Secrets

CI needs two GitHub secrets: `CLOUDFLARE_API_TOKEN` (scoped to Workers plus the
`lefv.io` and `lefv.info` zones) and `CLOUDFLARE_ACCOUNT_ID`.

## Rollback

```bash
npx wrangler rollback          # previous Worker version
npx wrangler deployments list  # history
```
