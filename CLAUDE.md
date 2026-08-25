# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

lefv.io is a static blog and portfolio served entirely by one Cloudflare Worker.
Posts are markdown files in `content/blog/`. There is no server, no database,
and no origin — publishing is a git push.

## Essential Commands

```bash
npm run dev         # local Worker on the production runtime (wrangler dev)
npm test            # vitest, 79 tests
npm run lint        # tsc --noEmit
npm run bake-posts  # regenerate worker/posts.generated.json from markdown
npm run build       # bake posts + vite build
npm run deploy      # manual deploy, bypassing CI
```

Typecheck the Worker separately — it uses a different lib:

```bash
npx tsc --noEmit -p worker/tsconfig.json
```

## Publishing

Add a markdown file to `content/blog/`, push to `main`. CI runs the tests and
deploys on green. `main` is the only branch that publishes.

## Architecture

```
client/src/     React SPA (Vite, shadcn/ui, Tailwind, wouter, TanStack Query)
worker/         Cloudflare Worker (Hono) — serves the API and static assets
lib/            code shared between the Worker and build scripts
scripts/        build-time only
content/blog/   the posts
```

### The one constraint that shapes everything

**Workers have no filesystem.** Posts cannot be read at request time, so
`scripts/bake-posts.ts` parses `content/blog/*.md` at build time into
`worker/posts.generated.json`, which is compiled into the bundle. That file is
generated and gitignored — CI bakes it before typechecking, because the Worker
imports it.

`lib/posts.ts` does the parsing and uses `fs`, so it is Node-only and
deliberately excluded from `worker/tsconfig.json`. Do not import it from
`worker/`.

### Routing

`wrangler.jsonc` holds the routes (`lefv.io/*`, `www.lefv.io/*`, `lefv.info/*`).
They intercept at the Cloudflare edge in front of the zone's existing DNS
records, which still point at a `lefv-tunnel` homelab. Nothing in DNS was
deleted, so removing a route restores the previous behaviour.

`www.lefv.info` needs no route — a Cloudflare redirect rule sends it to the
apex, and redirect rules run before Workers.

### API

Read-only, public, unauthenticated: `/api/health`, `/api/posts`,
`/api/posts/:slug`, `/api/tags`, `/feed.xml`. Unknown `/api/*` paths return JSON
404 so they do not fall through to the SPA catch-all. CORS is `origin: "*"` with
credentials off — adding auth means revisiting that.

## Conventions

- Path aliases: `@/` → `client/src/`
- Tests colocate under `__tests__/`
- Do not add a database. The previous one mirrored markdown into Postgres and
  nothing read it.
