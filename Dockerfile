# Stage 1: Dependencies
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm install

# Stage 2: Builder
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Next.js collects anonymous telemetry. Let's disable it.
ENV NEXT_TELEMETRY_DISABLED 1
# NEXT_PUBLIC_* vars are inlined into the client bundle at build time,
# so this must be set here (not just at runtime) or client code falls
# back to its localhost default in production.
ENV NEXT_PUBLIC_API_URL https://api.ololeo-store.com/api
RUN npm run build

# Stage 3: Production Runner
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV NEXT_PUBLIC_API_URL https://api.ololeo-store.com/api

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone build and static assets
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

# Standalone mode requires running the server.js file directly
CMD ["node", "server.js"]