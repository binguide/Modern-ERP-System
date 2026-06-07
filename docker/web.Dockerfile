# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=20

FROM node:${NODE_VERSION}-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.7.0 --activate

# ============================================
# Production build stage
# ============================================
FROM base AS build
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/shared-schemas/package.json ./packages/shared-schemas/
COPY packages/shared-utils/package.json ./packages/shared-utils/
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm --filter @modern-erp/shared-types build
RUN pnpm --filter @modern-erp/shared-schemas build
RUN pnpm --filter @modern-erp/shared-utils build
RUN pnpm --filter @modern-erp/web build

# ============================================
# Production runtime stage
# ============================================
FROM nginx:1.25-alpine AS production
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
COPY docker/nginx-web.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
