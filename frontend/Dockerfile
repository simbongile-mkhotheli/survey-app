# Frontend Dockerfile
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

# Set build environment variables
ENV NODE_ENV=production
ENV VITE_NODE_ENV=production
ENV VITE_API_BASE_URL=http://localhost:5000/api

# Build the application
RUN npm run build

# Production image with Nginx
FROM nginx:alpine AS runner

# Copy built application to Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S survey-app -u 1001

# Set correct permissions
RUN chown -R survey-app:nodejs /usr/share/nginx/html
RUN chown -R survey-app:nodejs /var/cache/nginx
RUN chown -R survey-app:nodejs /var/log/nginx
RUN chown -R survey-app:nodejs /etc/nginx/conf.d
RUN touch /var/run/nginx.pid
RUN chown -R survey-app:nodejs /var/run/nginx.pid

USER survey-app

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]