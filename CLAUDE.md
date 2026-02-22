# CLAUDE.md - Project Context for AI Agents

## Project: PadelGO

Monorepo for a padel court management platform. Spanish-speaking project (UI, comments, error messages in Spanish).

## Tech Stack

- **Monorepo**: pnpm workspaces + Turborepo
- **Backend** (`apps/api`): NestJS 11 + Fastify 5 + Passport JWT + Prisma ORM
- **Frontend** (`apps/web`): Next.js 16 (App Router) + React 19 + Tailwind CSS v4
- **Database**: PostgreSQL via Prisma with `@prisma/adapter-pg`
- **Validation**: Zod v4 (shared schemas between frontend/backend)
- **Language**: TypeScript 5 throughout

## Architecture

```
apps/
  api/     → NestJS backend (port 3000)
  web/     → Next.js frontend (port 3001)
packages/
  database/         → Prisma schema, service, module (@repo/database)
  shared/           → Shared Zod schemas and types (@repo/shared)
  typescript-config/ → Shared tsconfig bases (@repo/typescript-config)
```

## Auth System (Backend)

- **Cookies**: httpOnly, sameSite=lax, secure in production
  - `token` = access token JWT (15 min TTL)
  - `refresh_token` = refresh token JWT (7 days TTL)
- **Endpoints**:
  - `POST /auth/login` — validates credentials, sets both cookies, creates session
  - `POST /auth/refresh` — validates refresh token against hashed version in DB, rotates tokens
  - `GET /user/me` — returns `{ id, email }` (protected by JWT guard)
  - `GET /user/:id` — returns user with sessions (protected by JWT guard)
- **Token Rotation**: On refresh, old refresh token is invalidated, new one hashed with bcrypt and stored in Session table
- **Session Tracking**: Each login creates a Session record with device info (parsed via ua-parser-js)
- **JWT Payload**: `{ id: userId, sessionId: sessionId }`
- **Strategies**:
  - `jwt` — extracts from Bearer header OR `token` cookie
  - `jwt-refresh` — extracts from `refresh_token` cookie only, validates against DB

## Database Schema (Prisma)

```
User: id(cuid), email(unique), password(bcrypt), sessions[]
Session: id(cuid), user_id(FK→User), hashed_rt, device_info?, createdAt
```

Seeded users: `admin@padelgo.com` / `usuario@padelgo.com` (password: `password123`)

## Frontend State (Current)

- **Axios instance** (`src/lib/axios.ts`): `withCredentials: true`, interceptor that auto-refreshes on 401
- **Route groups**: `(autenticated)` for login, `(protected)` for dashboard
- **Protected layout**: Server-side fetch of `/user/me` with token refresh fallback
- **Dependencies installed but not yet wired**: `zustand`, `@repo/shared`
- **Empty placeholder files**: `middleware.ts`, `stores/auth-store.ts`, `hooks/use-auth.ts`, `components/auth-hydrator.tsx`, `app/actions/auth.ts`, `lib/cookies.ts`

## Environment Variables

```
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/padel_db
JWT_SECRET=<secret>
JWT_REFRESH_SECRET=<secret>
NEXT_PUBLIC_API_URL=http://localhost:3000     # Client-side (browser → NestJS)
API_URL_INTERNAL=http://127.0.0.1:3000       # Server-side (Next.js → NestJS)
CORS_ORIGIN=http://localhost:3001            # Frontend origin for CORS
```

## Key Conventions

- Path alias: `@/*` maps to `./src/*` in the frontend
- Workspace packages imported as `@repo/database`, `@repo/shared`, `@repo/typescript-config`
- Backend uses `src/` prefix in imports (e.g., `import from 'src/pipes/...'`)
- Zod schemas shared via `@repo/shared` — same schema validates on frontend and backend
- Cookie names defined in `apps/api/src/auth/constants/cookie.constants.ts`: `token`, `refresh_token`
- NestJS uses Fastify (NOT Express) — response/request types are `FastifyReply`/`FastifyRequest`
- Next.js runs on port 3001, NestJS on port 3000
- React Compiler enabled (`reactCompiler: true` in next.config.ts)
- Tailwind CSS v4 (uses `@import "tailwindcss"` syntax, PostCSS plugin)

## Commands

```bash
# Root
pnpm dev          # Start all apps (turbo)
pnpm build        # Build all
pnpm check-types  # TypeScript check all

# Backend
cd apps/api
pnpm dev           # NestJS watch mode
pnpm build         # Build
pnpm check-types   # Type check

# Frontend
cd apps/web
pnpm dev           # Next.js dev (port 3001)
pnpm build         # Build
pnpm check-types   # Type check

# Database
cd packages/database
pnpm db:generate   # Generate Prisma client
pnpm db:push       # Push schema to DB
pnpm db:migrate    # Run migrations
pnpm db:seed       # Seed test users
pnpm db:studio     # Open Prisma Studio
```

## Important Notes for AI Agents

- The `.env` file is at the REPO ROOT, loaded via `dotenv-cli` in scripts
- Backend webpack config bundles `@repo/*` packages (custom externals in `webpack.config.js`)
- `proxy.ts` is referenced in `tsconfig.json` include but the file may not exist — needs cleanup
- The `(autenticated)` route group has a typo (missing 'h') — this is intentional to avoid breaking existing routes
- Server Components in Next.js CANNOT call `cookies().set()` — only Server Actions and Route Handlers can
- Middleware runs in Edge Runtime — can do async fetch but be mindful of available APIs
