ARG NODE_VERSION

# TODO: base node version off of nvmrc
FROM docker.io/node:${NODE_VERSION}-alpine AS builder

WORKDIR /app
# TODO: optimize by copying package.json only for install
COPY dist/apps/api /app

RUN npm --omit=dev -f install

# Use distroless for maximum security: https://github.com/GoogleContainerTools/distroless
FROM gcr.io/distroless/nodejs${NODE_VERSION}-debian11

COPY --from=builder /app /app
WORKDIR /app

ENV PORT=3333
EXPOSE ${PORT}


CMD ["./main.js"]