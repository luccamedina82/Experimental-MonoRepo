# CONTEXT.md - PadelGO Architecture Documentation

## Overview

PadelGO is a padel court management platform built as a TypeScript monorepo. The project uses a clear separation between backend API, frontend web app, and shared packages.

---

## Monorepo Structure

```
Experimental-MonoRepo/
├── .env                          # Shared env vars (loaded by dotenv-cli)
├── .gitignore
├── package.json                  # Root scripts (turbo dev/build/lint)
├── pnpm-workspace.yaml           # Workspace config
├── turbo.json                    # Turborepo task pipeline
├── CLAUDE.md                     # AI agent context
├── CONTEXT.md                    # This file
│
├── apps/
│   ├── api/                      # NestJS backend
│   │   ├── src/
│   │   │   ├── main.ts           # Fastify bootstrap, CORS, cookies
│   │   │   ├── app.module.ts     # Root module (Config, Prisma, Auth, User)
│   │   │   ├── auth/
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── auth.controller.ts    # POST /auth/login, POST /auth/refresh
│   │   │   │   ├── auth.service.ts       # Login, token generation, refresh
│   │   │   │   ├── strategies/
│   │   │   │   │   ├── jwt.strategy.ts   # Access token validation (jwt)
│   │   │   │   │   └── rt.strategy.ts    # Refresh token validation (jwt-refresh)
│   │   │   │   ├── constants/
│   │   │   │   │   └── cookie.constants.ts  # Cookie names, TTLs, options
│   │   │   │   └── helper/
│   │   │   │       └── cookie.helper.ts     # setAuthCookies, clearAuthCookies
│   │   │   ├── user/
│   │   │   │   ├── user.module.ts
│   │   │   │   ├── user.controller.ts    # GET /user/me, GET /user/:id
│   │   │   │   └── user.service.ts       # findUser, getMe
│   │   │   └── pipes/
│   │   │       └── zod-validation.pipe.ts  # Zod schema validation pipe
│   │   ├── test/
│   │   ├── nest-cli.json
│   │   ├── webpack.config.js     # Custom config to bundle @repo/* packages
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── web/                      # Next.js frontend
│       ├── src/
│       │   ├── middleware.ts      # (empty — needs implementation)
│       │   ├── app/
│       │   │   ├── layout.tsx     # Root layout (Geist fonts, Tailwind)
│       │   │   ├── page.tsx       # Home page (minimal)
│       │   │   ├── globals.css    # @import "tailwindcss"
│       │   │   ├── actions/
│       │   │   │   └── auth.ts    # (empty — needs server actions)
│       │   │   ├── (autenticated)/
│       │   │   │   ├── layout.tsx       # Redirects to /dashboard if authenticated
│       │   │   │   └── login/
│       │   │   │       └── page.tsx     # Login form (useActionState ready)
│       │   │   └── (protected)/
│       │   │       ├── layout.tsx       # Server-side auth check + refresh
│       │   │       └── dashboard/
│       │   │           └── page.tsx     # Dashboard (minimal)
│       │   ├── lib/
│       │   │   ├── axios.ts       # Axios instance with refresh interceptor
│       │   │   └── cookies.ts     # (empty — needs cookie forwarding util)
│       │   ├── stores/
│       │   │   └── auth-store.ts  # (empty — needs Zustand store)
│       │   ├── hooks/
│       │   │   └── use-auth.ts    # (empty — needs auth hook)
│       │   └── components/
│       │       └── auth-hydrator.tsx  # (empty — needs hydrator)
│       ├── next.config.ts         # reactCompiler: true
│       ├── tsconfig.json
│       ├── postcss.config.mjs
│       ├── eslint.config.mjs
│       └── package.json
│
└── packages/
    ├── database/                  # @repo/database
    │   ├── src/
    │   │   ├── index.ts           # Exports PrismaService, PrismaModule, generated client
    │   │   ├── prisma.module.ts   # Global NestJS module
    │   │   └── prisma.service.ts  # PrismaClient with PrismaPg adapter
    │   ├── prisma/
    │   │   ├── schema.prisma      # User + Session models
    │   │   ├── seed.ts            # Seeds 2 test users
    │   │   └── migrations/        # SQL migration files
    │   ├── generated/prisma/      # Generated Prisma client (gitignored)
    │   ├── prisma.config.ts
    │   ├── tsconfig.json
    │   └── package.json
    │
    ├── shared/                    # @repo/shared
    │   ├── src/
    │   │   ├── index.ts           # Re-exports all schemas
    │   │   └── auth/
    │   │       └── login.schema.ts  # loginSchema (Zod) + LoginDto type
    │   ├── tsconfig.json
    │   └── package.json
    │
    └── typescript-config/         # @repo/typescript-config
        ├── base.json              # Base TS config (strict, ES2022, bundler)
        ├── nest.json              # NestJS config (decorators, ES2023)
        ├── next.json              # Next.js config (jsx preserve, ESNext)
        └── package.json
```

---

## Backend (NestJS + Fastify)

### Ports & Networking

- Listens on `0.0.0.0:3000` (Docker-compatible)
- CORS enabled for `CORS_ORIGIN` (default: `http://localhost:3001`)
- Credentials: true (cookies cross-origin)

### Authentication Flow

```
1. Client POST /auth/login { email, password }
   │
2. ZodValidationPipe validates with loginSchema
   │
3. AuthService.login():
   ├─ Find user by email
   ├─ bcrypt.compare password
   ├─ Generate access JWT (15m) + refresh JWT (7d)
   ├─ Hash refresh token with bcrypt
   ├─ Create Session record (id, user_id, hashed_rt, device_info)
   └─ Return tokens
   │
4. Controller sets httpOnly cookies via setAuthCookies()
   ├─ token = accessToken (maxAge: 15min)
   └─ refresh_token = refreshToken (maxAge: 7days)
   │
5. Response: { message: 'Login exitoso' }
```

### Token Refresh Flow

```
1. Client POST /auth/refresh (refresh_token cookie attached automatically)
   │
2. RefreshTokenStrategy (jwt-refresh guard):
   ├─ Extract refresh_token from cookie
   ├─ Verify JWT signature with JWT_REFRESH_SECRET
   ├─ Find Session by sessionId from JWT payload
   ├─ bcrypt.compare cookie token vs session.hashed_rt
   └─ Return user { id, email } if valid
   │
3. AuthService.refreshTokens():
   ├─ Generate new tokens
   ├─ Hash new refresh token
   ├─ Update Session.hashed_rt in DB
   └─ Return new tokens
   │
4. Controller sets new cookies (rotation complete)
```

### Cookie Configuration

| Cookie        | Name            | MaxAge     | HttpOnly | Secure          | SameSite |
| ------------- | --------------- | ---------- | -------- | --------------- | -------- |
| Access Token  | `token`         | 15 minutes | yes      | production only | lax      |
| Refresh Token | `refresh_token` | 7 days     | yes      | production only | lax      |

### API Endpoints

| Method | Path            | Auth        | Description                  |
| ------ | --------------- | ----------- | ---------------------------- |
| POST   | `/auth/login`   | none        | Login, returns cookies       |
| POST   | `/auth/refresh` | jwt-refresh | Rotate tokens                |
| GET    | `/user/me`      | jwt         | Current user `{ id, email }` |
| GET    | `/user/:id`     | jwt         | User with sessions           |

---

## Frontend (Next.js 16 + React 19)

### Key Configuration

- Port: 3001
- React Compiler: enabled
- Tailwind CSS v4 (PostCSS plugin)
- Path alias: `@/*` → `./src/*`

### Current Implementation

**Implemented:**

- Axios instance with automatic 401 → refresh → retry interceptor (`src/lib/axios.ts`)
- Protected layout with server-side auth check and refresh logic (`(protected)/layout.tsx`)
- Auth layout that redirects authenticated users away from login (`(autenticated)/layout.tsx`)
- Login page with `useActionState` form (`(autenticated)/login/page.tsx`)

**Empty/Needs Implementation:**

- `src/middleware.ts` — Route protection at edge
- `src/app/actions/auth.ts` — Server Actions for login/logout
- `src/stores/auth-store.ts` — Zustand auth store
- `src/hooks/use-auth.ts` — useAuth hook
- `src/components/auth-hydrator.tsx` — Server→Client state bridge
- `src/lib/cookies.ts` — Cookie forwarding utility

### Planned Auth Architecture

```
Middleware (Edge)
  └─ Check cookie existence, refresh if needed, redirect

Server Actions (Node.js)
  └─ loginAction: call NestJS, forward Set-Cookie headers
  └─ logoutAction: clear cookies, redirect

Protected Layout (Server Component)
  └─ Fetch /user/me, pass user to AuthHydrator

AuthHydrator (Client Component)
  └─ Initialize Zustand store with server-fetched user

useAuth Hook (Client)
  └─ Read from Zustand store, expose user + logout

Axios Instance (Client)
  └─ For non-auth API calls, with refresh interceptor
```

---

## Database

### PostgreSQL + Prisma

**Connection**: Via `@prisma/adapter-pg` (driver adapter pattern)
**URL**: `DATABASE_URL` env var

### Models

```prisma
model User {
  id       String    @id @default(cuid())
  email    String    @unique
  password String                          // bcrypt hash
  sessions Session[]
  @@map("users")
}

model Session {
  id          String   @id @default(cuid())
  user_id     String
  hashed_rt   String                       // bcrypt hash of refresh token
  device_info String?                      // e.g., "PC - Chrome en Windows"
  createdAt   DateTime @default(now())
  user        User     @relation(...)
  @@index([user_id])
}
```

### Seed Data

| Email               | Password    |
| ------------------- | ----------- |
| admin@padelgo.com   | password123 |
| usuario@padelgo.com | password123 |

---

## Shared Package (@repo/shared)

Contains Zod schemas used by both frontend and backend:

```typescript
// login.schema.ts
export const loginSchema = z.object({
  email: z.email('El formato del email no es valido'),
  password: z
    .string({ message: 'La contrasena es requerida' })
    .min(6, 'La contrasena debe tener al menos 6 caracteres'),
})
export type LoginDto = z.infer<typeof loginSchema>
```

---

## Environment Variables

| Variable              | Used By      | Description                                        |
| --------------------- | ------------ | -------------------------------------------------- |
| `PORT`                | api          | Backend port (3000)                                |
| `DATABASE_URL`        | database     | PostgreSQL connection string                       |
| `JWT_SECRET`          | api          | Access token signing + cookie signing              |
| `JWT_REFRESH_SECRET`  | api          | Refresh token signing                              |
| `NEXT_PUBLIC_API_URL` | web (client) | Browser → API URL (`http://localhost:3000`)        |
| `API_URL_INTERNAL`    | web (server) | Next.js server → API URL (`http://127.0.0.1:3000`) |
| `CORS_ORIGIN`         | api          | Allowed origin (`http://localhost:3001`)           |
| `DB_USER`             | docker       | PostgreSQL user                                    |
| `DB_PASSWORD`         | docker       | PostgreSQL password                                |
| `DB_NAME`             | docker       | PostgreSQL database name                           |

---

## Development Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Start PostgreSQL (Docker or local)

# 3. Generate Prisma client
cd packages/database && pnpm db:generate

# 4. Push schema / run migrations
pnpm db:push    # or pnpm db:migrate

# 5. Seed database
pnpm db:seed

# 6. Start all apps
cd ../.. && pnpm dev
```

Backend: http://localhost:3000
Frontend: http://localhost:3001
