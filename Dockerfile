# Multi-stage Dockerfile for Next.js Turborepo Dashboard

# Stage 1: Base image with Bun
FROM oven/bun:1.2.4-alpine AS base
WORKDIR /app

# Stage 2: Install dependencies
FROM base AS deps
COPY package.json bun.lock ./
COPY apps/dashboard/package.json ./apps/dashboard/
COPY packages ./packages
RUN bun install --frozen-lockfile

# Stage 3: Build the application
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the dashboard app
RUN bun run build:dashboard

# Stage 4: Production image
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/apps/dashboard/.next/standalone ./
COPY --from=builder /app/apps/dashboard/.next/static ./apps/dashboard/.next/static
COPY --from=builder /app/apps/dashboard/public ./apps/dashboard/public

# Set ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["bun", "run", "apps/dashboard/server.js"]
