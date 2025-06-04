# LEFV.IO

## Dev Notes

- Need to change max_user_watches to 524288

## CI/CD Pipeline

This project uses GitHub Actions for CI/CD:

- **Continuous Integration**: All pushes and pull requests to the `main` branch trigger linting and tests.
- **Continuous Deployment**: Successful changes to the `release` branch are automatically deployed to the production server.

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

## Database Configuration

This project supports both local PostgreSQL and Supabase as database providers.

### Setting Up Supabase

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key from the Supabase dashboard
3. Configure environment variables in `.env`:

```
# Supabase Configuration
USE_SUPABASE=true

# Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Environment
NODE_ENV=development
```

4. Apply the database schema by running the SQL script in the Supabase SQL Editor:
   - Go to your Supabase Dashboard > SQL Editor
   - Open the file `migrations/supabase_schema.sql`
   - Run the script to create all tables and policies

### Setting Up Local PostgreSQL

1. Configure environment variables in `.env`:

```
# Database URL for local PostgreSQL
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lefv_db

# Supabase Configuration
USE_SUPABASE=false

# Environment
NODE_ENV=development
```

2. Apply migrations:

```bash
# Generate migration files
npx drizzle-kit generate

# Apply migrations to the database
npx drizzle-kit push
```

## Working with Drizzle DB

Start Drizzle Studio to manage your database:

```bash
npx drizzle-kit studio
```

Access Drizzle Studio at: `https://local.drizzle.studio/`

For more information, visit the [Drizzle ORM Documentation](https://orm.drizzle.team/docs/kit-overview)
