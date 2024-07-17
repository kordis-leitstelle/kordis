ARG NODE_VERSION

FROM docker.io/node:${NODE_VERSION}-bookworm-slim AS builder

WORKDIR /app

ENV NODE_ENV=production

# Install dependencies separately for caching
COPY ./dist/apps/api/package.json ./dist/apps/api/package-lock.json ./

RUN npm ci --omit=dev

COPY ./dist/apps/api ./

# Use distroless for maximum security: https://github.com/GoogleContainerTools/distroless
FROM gcr.io/distroless/nodejs${NODE_VERSION}-debian12:nonroot

COPY --chown=root:root --chmod=655 --from=builder /app /app
WORKDIR /app

ENV PORT=3333
ENV NODE_ENV=production

EXPOSE ${PORT}

CMD ["./main.js"]
