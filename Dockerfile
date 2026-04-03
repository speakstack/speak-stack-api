# Build stage
FROM oven/bun:1-alpine AS builder

WORKDIR /app

COPY package.json bun.lock* ./

RUN bun install --frozen-lockfile

COPY . .

RUN bun run build

# Production stage
FROM oven/bun:1-alpine AS production

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup && \
    chown appuser:appgroup /app

# Switch to non-root user early
USER appuser

# Copy package files and install with correct ownership from the start
COPY --chown=appuser:appgroup package.json bun.lock* ./

RUN bun install --frozen-lockfile --production

# Copy built application
COPY --chown=appuser:appgroup --from=builder /app/dist ./dist

EXPOSE 8080

CMD ["bun", "run", "dist/main.js"]