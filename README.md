# lefv.io

Blog and portfolio. Static React app plus a small read-only API, served entirely
by one Cloudflare Worker.

## Publishing a post

```bash
vim content/blog/my-post.md
git push origin main
```

CI runs the tests and deploys on green, in about 40 seconds. The filename
becomes the slug. Frontmatter: `title`, `date`, `excerpt`, `tags`, `draft`.

## Local development

```bash
npm ci --legacy-peer-deps
npm run dev     # local Worker on the production runtime
npm test
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for the publish pipeline and
[CLAUDE.md](CLAUDE.md) for architecture.
