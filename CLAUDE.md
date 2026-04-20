## Project Overview

**Portal de Gobierno Abierto** — a Next.js CMS platform that exposes municipal open data to citizens, journalists, and decision-makers. It acts as the visual/narrative layer over a CKAN/Andino data ecosystem.

## Architecture

### Stack
- **Next.js 16 App Router** (TypeScript), React 19, Tailwind CSS v4
- **Database:** PostgreSQL 15 via Docker → Prisma ORM
- **Auth:** NextAuth.js v4 (Credentials provider, JWT sessions)
- **Package manager:** pnpm

### Request Flow
```
Browser → middleware.ts (JWT check) → app/api/*/route.ts → lib/services/*.ts → Prisma → PostgreSQL
```

Server Actions in `actions/` provide an alternative path for client components to mutate data without going through the REST API.

### Key Directories

| Path | Purpose |
|------|---------|
| `app/api/` | REST endpoints (news, texts/webcontent, auth, swagger) |
| `app/admin/` | Protected admin dashboard (requires JWT) |
| `app/(auth)/login/` | Login page |
| `lib/services/` | Data-access layer — all Prisma queries live here |
| `lib/` | Business logic: auth helpers, error mapping, form parsing, image upload, OpenAPI spec |
| `actions/` | Next.js Server Actions for client-side mutations |
| `prisma/` | Schema, migrations, seed script |
| `public/uploads/news/` | Uploaded news images (served at `/uploads/news/[filename]`) |

### Data Models
- **User** — roles: `USER | EDITOR | ADMIN`; credentials auth with bcrypt
- **News** — title, slug, content, image, category, published, authorId
- **WebContent** — dynamic homepage CMS content via slug (also exposed as `/api/texts`)
- **ContactForm** — anonymous citizen submissions with status lifecycle

### Auth & Authorization
- `auth.ts` — NextAuth config; role stored in JWT and exposed on `session.user.role`
- `middleware.ts` — protects `/admin/*`; redirects unauthenticated users to `/login`
- `lib/content-auth.ts` — `getSessionManager()` / `requireSessionManager()` helpers enforce EDITOR or ADMIN role on write endpoints

### API Conventions
- `lib/api-error.ts` — maps Prisma error codes (P2002, P2025) to HTTP responses via `toApiError()`
- Write endpoints accept both `multipart/form-data` (for image uploads) and JSON
- `/api/texts` and `/api/webcontent` are aliases pointing to the same service layer
- Swagger UI at `/docs`, OpenAPI spec at `/api/openapi`

## Naming Conventions
- Variables/functions: `lowerCamelCase`
- Files/directories: `snake_case`