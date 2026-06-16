# ======================== BASE
FROM node:24.16.0-alpine3.24 AS base

WORKDIR /app

ENV YARN_ENABLE_TELEMETRY=0

RUN corepack enable

COPY package*.json yarn.lock* .yarnrc.yml ./

RUN yarn install

COPY src ./src

EXPOSE 3000

# ======================= DEV
FROM base AS dev

CMD ["yarn", "dev"]

# ======================= PROD
FROM base AS prod

CMD ["yarn", "start"]

