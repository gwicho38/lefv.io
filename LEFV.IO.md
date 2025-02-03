# LEFV.IO

## Dev Notes

- Need to change max_user_watches to 524288

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
