# ==========================================
# thumb.to — Production Multi-stage Dockerfile
# Optimized for self-hosting with Coolify
# ==========================================

FROM node:22-alpine AS builder

WORKDIR /app

# Copy package manifests
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install all dependencies (workspaces)
RUN npm ci

# Copy full source
COPY . .

# Build Client (Vite -> client/dist)
RUN npm run build -w client

# Build Server (TypeScript -> server/dist)
RUN npm run build -w server

# ==========================================
# Production Runner
# ==========================================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy root package and server package
COPY package*.json ./
COPY server/package*.json ./server/

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built server and built client
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/client/dist ./client/dist

EXPOSE 3000

CMD ["node", "server/dist/index.js"]
