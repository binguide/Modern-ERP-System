# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=20

# ============================================
# Base stage
# ============================================
FROM node:${NODE_VERSION}-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.7.0 --activate

# ============================================
# Dependencies stage
# ============================================
FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/shared-schemas/package.json ./packages/shared-schemas/
COPY packages/shared-utils/package.json ./packages/shared-utils/
RUN pnpm install --frozen-lockfile

# ============================================
# Development stage
# ============================================
FROM base AS development
ENV NODE_ENV=development
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY . .

WORKDIR /app/apps/api
EXPOSE 3000
CMD ["pnpm", "start:dev"]

# ============================================
# Build stage
# ============================================
FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter @modern-erp/shared-types build
RUN pnpm --filter @modern-erp/shared-schemas build
RUN pnpm --filter @modern-erp/shared-utils build
RUN pnpm --filter @modern-erp/api build

# ============================================
# Production stage
# ============================================
FROM node:${NODE_VERSION}-alpine AS production
RUN apk add --no-cache dumb-init
ENV NODE_ENV=production
WORKDIR /app

COPY package.json pnpm-workspace.yaml ./
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
COPY --from=build /app/apps/api/dist ./apps/api/dist

USER node
EXPOSE 3000
CMD ["dumb-init", "node", "apps/api/dist/main.js"]
