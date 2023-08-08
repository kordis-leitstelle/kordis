ARG NODE_VERSION

FROM docker.io/node:${NODE_VERSION}-alpine AS builder

WORKDIR /app

# Install dependencies separately for caching
COPY ./dist/apps/api/package.json ./dist/apps/api/package-lock.json ./
RUN npm --omit=dev -f install

COPY ./dist/apps/api ./

# Use distroless for maximum security: https://github.com/GoogleContainerTools/distroless
FROM gcr.io/distroless/nodejs${NODE_VERSION}-debian11

COPY --from=builder /app /app
WORKDIR /app

ENV PORT=3333
EXPOSE ${PORT}


CMD ["./main.js"]