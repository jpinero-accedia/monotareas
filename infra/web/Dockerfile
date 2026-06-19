# Build context: la raíz del monorepo

# ======================== BUILD
FROM node:24.16.0-alpine3.24 AS build

WORKDIR /repo

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable && corepack use pnpm@9.15.0

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* tsconfig.base.json ./
COPY packages/web/package.json ./packages/web/package.json

RUN \
    pnpm install --filter @monotareas/web... --frozen-lockfile \
    || \
    pnpm install --filter @monotareas/web...

COPY packages/web ./packages/web

RUN pnpm --filter @monotareas/web build

# ======================== SERVE
FROM nginx:1.27-alpine AS serve

COPY --from=build /repo/packages/web/dist /usr/share/nginx/html

EXPOSE 80
