# Build context: la raíz del monorepo (necesita el workspace completo para resolver pnpm)

# ======================== BASE
FROM node:24.16.0-alpine3.24 AS base

WORKDIR /repo

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable && corepack use pnpm@9.15.0

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* tsconfig.base.json ./
COPY packages/backend/package.json ./packages/backend/package.json

RUN pnpm install --filter @monotareas/backend... --frozen-lockfile || pnpm install --filter @monotareas/backend...

COPY packages/backend ./packages/backend

WORKDIR /repo/packages/backend

EXPOSE 3000

# ======================= DEV
FROM base AS dev

CMD ["pnpm", "dev"]

# ======================= PROD
FROM base AS prod

RUN pnpm build

CMD ["pnpm", "start"]
