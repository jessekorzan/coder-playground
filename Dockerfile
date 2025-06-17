# 1) Base image
FROM node:20-alpine AS base
WORKDIR /app

# Copy only root manifests and install deps
COPY package*.json ./
RUN npm ci

# 2) Build the React client
FROM base AS build-client
WORKDIR /app
# build script should know to build client via your root scripts
RUN npm run build:client

# 3) Build (or transpile) the server, if needed
#    If you have a root script to build server (e.g. tsc), run it here.
FROM base AS build-server
WORKDIR /app
RUN npm run build:server

# 4) Final image
FROM node:20-alpine AS runner
WORKDIR /app

# Copy production deps only
COPY package*.json ./
RUN npm ci --only=production

# Copy in built client + server
COPY --from=build-client /app/client/dist ./public
COPY --from=build-server /app/server/dist ./server

# Expose & run
ENV PORT=5000
EXPOSE 5000
CMD ["node", "server/index.js"]