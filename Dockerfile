# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS base
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN apk add --no-cache libc6-compat && corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres?schema=public"
RUN pnpm install --frozen-lockfile

FROM base AS builder
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres?schema=public"
ENV NEXTAUTH_SECRET="build-time-secret"
ENV BETTER_AUTH_SECRET="build-time-secret"
ENV NEXTAUTH_URL="http://localhost:3000"
ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY="1x00000000000000000000AA"
ENV TURNSTILE_SECRET_KEY="1x0000000000000000000000000000000AA"
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup -S nextjs && adduser -S nextjs -G nextjs

COPY --from=builder --chown=nextjs:nextjs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nextjs /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder --chown=nextjs:nextjs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nextjs /app/.next ./.next
COPY --from=builder --chown=nextjs:nextjs /app/public ./public
COPY --from=builder --chown=nextjs:nextjs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nextjs /app/prisma.config.ts ./prisma.config.ts

EXPOSE 3000
USER nextjs

CMD ["sh", "-c", "pnpm prisma migrate deploy && pnpm start"]
