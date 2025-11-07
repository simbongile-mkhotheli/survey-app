# Backend Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production image, copy all the files and run the application
FROM base AS runner
WORKDIR /app

# Don't run as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 survey-app

# Copy built application
COPY --from=builder --chown=survey-app:nodejs /app/dist ./dist
COPY --from=builder --chown=survey-app:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=survey-app:nodejs /app/package.json ./package.json
COPY --from=builder --chown=survey-app:nodejs /app/prisma ./prisma

# Create logs directory
RUN mkdir -p /app/logs && chown survey-app:nodejs /app/logs

USER survey-app

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["npm", "start"]