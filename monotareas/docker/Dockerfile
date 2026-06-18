# ======================== BASE
FROM node:24.16.0-alpine3.24 AS base

WORKDIR /app

ENV YARN_ENABLE_TELEMETRY=0

COPY ./app/package*.json ./app/yarn.lock* ./app/.yarnrc.yml ./

RUN corepack enable && corepack use yarn

RUN yarn install

COPY ./app/src ./src

EXPOSE 3000

# ======================= DEV
FROM base AS dev

CMD ["yarn", "dev"]

# ======================= PROD
FROM base AS prod

CMD ["yarn", "start"]

