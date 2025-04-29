# LEFV.IO

## Dev Notes

- Need to change max_user_watches to 524288

## CI/CD Pipeline

This project uses GitHub Actions for CI/CD:

- **Continuous Integration**: All pushes and pull requests to the `main` branch trigger linting and tests.
- **Continuous Deployment**: Successful changes to the `main` branch are automatically deployed to the production server.

### GitHub Actions Workflow

The CI/CD process includes:

1. **Test**: Linting and testing with a Postgres database
2. **Build**: Creating optimized production build
3. **Deploy**: Deploying to DigitalOcean server

Run tests locally with:
```bash
npm run lint
npm test
```

## Setting Up Drizzle DB

```
% npx drizzle-kit generate

No config path provided, using default 'drizzle.config.ts'
Reading config file '/Users/lefv/repos/lefv.io/drizzle.config.ts'
4 tables
galleries 5 columns 0 indexes 0 fks
post_tags 2 columns 0 indexes 2 fks
posts 5 columns 0 indexes 0 fks
tags 2 columns 0 indexes 0 fks

[✓] Your SQL migration file ➜ migrations/0000_fresh_tenebrous.sql 🚀

(4) ~/repos/lefv.io on main [!]
% npx drizzle-kit push

No config path provided, using default 'drizzle.config.ts'
Reading config file '/Users/lefv/repos/lefv.io/drizzle.config.ts'
Using 'pg' driver for database querying
[✓] Pulling schema from database...
[✓] Changes applied

```

## Working with Drizzle DB

Start Drizzle Studio --> `npx drizzle-kit studio`

`https://local.drizzle.studio/`

`https://orm.drizzle.team/docs/kit-overview`
