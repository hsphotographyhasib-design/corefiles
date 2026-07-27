# CoreFiles Dockerfile
# Copyright (c) 2026 Hasanur Jaya Sdn. Bhd.
# Developer: amdsaib96

# Multi-stage build for smaller production image
FROM node:20-alpine AS builder

LABEL org.opencontainers.image.title="CoreFiles"
LABEL org.opencontainers.image.description="Enterprise Document Management System"
LABEL org.opencontainers.image.vendor="Hasanur Jaya Sdn. Bhd."
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.created="2026-07-27T10:30:00Z"
LABEL org.opencontainers.image.source="https://github.com/hsphotographyhasib-design/corefiles"
LABEL org.opencontainers.image.licenses="Proprietary"
LABEL org.opencontainers.image.authors="amdsaib96"
LABEL com.hasanurjaya.app="CoreFiles"
LABEL com.hasanurjaya.company="Hasanur Jaya Sdn. Bhd."
LABEL com.hasanurjaya.developer="amdsaib96"
LABEL com.hasanurjaya.version="1.0.0"

WORKDIR /app

# Install dependencies
COPY package.json bun.lock ./
RUN npm install --frozen-lockfile

# Copy source and build
COPY . .
RUN npm run build:info
RUN npm run build

# --- Production stage ---
FROM node:20-alpine AS runner

LABEL org.opencontainers.image.title="CoreFiles"
LABEL org.opencontainers.image.description="Enterprise Document Management System"
LABEL org.opencontainers.image.vendor="Hasanur Jaya Sdn. Bhd."
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.authors="amdsaib96"
LABEL com.hasanurjaya.developer="amdsaib96"

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy built artifacts
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/src/lib/corefiles/build-info.ts ./src/lib/corefiles/build-info.ts

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
