# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

lefv.io is a full-stack TypeScript application built with React and Express, featuring a portfolio website with blog functionality that auto-syncs markdown files to a database.

## Essential Commands

### Development
```bash
npm run dev          # Start dev server on port 5001 (backend) and 5173 (frontend)
npm run dev:no-db    # Development without database operations
```

### Building & Production
```bash
npm run build           # Build both client and server
npm run build:with-db   # Build and sync database
npm start              # Run production server
```

### Database Management
```bash
npm run push-db      # Push schema changes to database
npm run examine-db   # Inspect database state
npm run update-db    # Sync markdown files to database
```

### Testing & Quality
```bash
npm test            # Run all tests
npm run test:watch  # Run tests in watch mode
npm run lint        # ESLint with auto-fix
```

## Architecture

### Project Structure
```
src/
├── client/          # React frontend (Vite)
│   ├── components/  # UI components using shadcn/ui
│   ├── hooks/       # Custom React hooks
│   ├── lib/         # Utilities and configurations
│   └── pages/       # Route components
├── server/          # Express backend
│   ├── routes/      # API endpoints
│   ├── services/    # Business logic
│   └── utils/       # Server utilities
└── db/              # Database layer
    ├── schema.ts    # Drizzle schema definitions
    └── client.ts    # Database connection
```

### Key Technologies
- **Frontend**: React 18, TypeScript, Vite, TanStack Query, Wouter, shadcn/ui, Tailwind CSS
- **Backend**: Express, TypeScript, ESBuild
- **Database**: PostgreSQL/Supabase with Drizzle ORM
- **Testing**: Vitest, Testing Library, MSW for API mocking

### Path Aliases
- `@/` → `src/client/`
- `@db` → `src/db`

### Database Strategy
The app supports dual database configurations:
1. **Local PostgreSQL**: Default for development
2. **Supabase**: For production/cloud deployment

Database credentials are loaded from environment variables with validation.

### Blog System
- Markdown files in `src/content/posts/` are automatically processed
- Frontmatter metadata is extracted and synced to database
- File watcher (chokidar) monitors changes in development
- Build process includes database sync step

## Development Patterns

### Component Development
- Use shadcn/ui components from `src/client/components/ui/`
- Follow existing patterns for new components
- Components use TypeScript with proper type definitions

### API Development
- Routes defined in `src/server/routes/`
- Use existing error handling middleware
- Rate limiting configured per endpoint
- CORS enabled for development

### Database Operations
- Schema defined in `src/db/schema.ts`
- Use Drizzle ORM for type-safe queries
- Migrations handled via `npm run push-db`

### Testing Approach
- Unit tests for utilities and services
- Component tests using Testing Library
- API tests with MSW for mocking
- Test files colocated with source files (`*.test.ts`, `*.test.tsx`)

## Environment Setup

Required environment variables:
```
DATABASE_URL        # PostgreSQL connection string
SUPABASE_URL       # Optional: Supabase project URL
SUPABASE_ANON_KEY  # Optional: Supabase anonymous key
PORT               # Server port (default: 5001)
```

## Common Tasks

### Adding a New Blog Post
1. Create markdown file in `src/content/posts/`
2. Include frontmatter with title, date, description, tags
3. Run `npm run update-db` or it will auto-sync in dev mode

### Modifying Database Schema
1. Update `src/db/schema.ts`
2. Run `npm run push-db` to apply changes
3. Test with `npm run examine-db`

### Adding New API Endpoints
1. Create route file in `src/server/routes/`
2. Register in `src/server/app.ts`
3. Add corresponding client hook in `src/client/hooks/`

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is set correctly
- For Supabase, ensure both URL and ANON_KEY are provided
- Check network connectivity to database

### Build Failures
- Clear build cache: `rm -rf dist/`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Verify all environment variables are set

### Type Errors
- Run `npx tsc --noEmit` to check TypeScript compilation
- Ensure path aliases are properly configured in tsconfig files