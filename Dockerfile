# 1) Build stage: install & build both client and server
FROM node:20-alpine AS build
WORKDIR /app

# Install everything
COPY package*.json ./
RUN npm ci

# Copy the full repo & run your root "build" script:
#    "build": "vite build && esbuild server/index.ts ... --outdir=dist"
COPY . .
RUN npm run build

# 2) Runtime stage: production deps + compiled output
FROM node:20-alpine AS runner
WORKDIR /app

# Install only prod deps (remove --only=production if you still need devDeps like Vite)
COPY package*.json ./
RUN npm ci

# Copy server bundle and client build
COPY --from=build /app/dist ./dist
COPY --from=build /app/client/dist ./public

ENV PORT=5000
EXPOSE 5000

# Launch your compiled server entrypoint
CMD ["node", "dist/index.js"]


