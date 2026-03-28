# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (cached layer)
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ── Stage 2: Serve ────────────────────────────────────────────────────────────
FROM nginx:alpine AS runner

# Patch OS-level vulnerabilities
RUN apk upgrade --no-cache && apk add --no-cache libexpat

# Copy built assets (owned by nginx user for non-root operation)
COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html

# SPA routing: redirect all 404s to index.html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Prepare directories and PID file for non-root nginx
RUN chown -R nginx:nginx /var/cache/nginx /var/log/nginx \
 && sed -i 's|/run/nginx.pid|/tmp/nginx.pid|' /etc/nginx/nginx.conf \
 && sed -i 's|^user  nginx;|#user  nginx;|' /etc/nginx/nginx.conf

EXPOSE 8080

USER nginx

CMD ["nginx", "-g", "daemon off;"]
