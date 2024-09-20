FROM node:22-slim AS build

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml /app/
COPY patches /app/patches
COPY apps/qqbot/package.json /app/apps/qqbot/
COPY packages/botcore/package.json /app/packages/botcore/
COPY packages/botfirm/package.json /app/packages/botfirm/
COPY packages/clients/package.json /app/packages/clients/
COPY packages/data/package.json /app/packages/data/
COPY packages/types/package.json /app/packages/types/
COPY packages/utils/package.json /app/packages/utils/

RUN --mount=type=cache,id=pnpm,target=/pnpm/store,sharing=locked \
    --mount=type=secret,id=npmrc,target=/root/.npmrc \
    pnpm install --frozen-lockfile

COPY packages /app/packages
COPY apps/qqbot /app/apps/qqbot

RUN cd /app/apps/qqbot && pnpm run build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store,sharing=locked \
    --mount=type=secret,id=npmrc,target=/root/.npmrc \
    pnpm deploy --filter=@clansty/maibot-onebot --prod deploy

FROM node:22-slim

WORKDIR /app
COPY --from=build /app/deploy /app

CMD node --enable-source-maps .
