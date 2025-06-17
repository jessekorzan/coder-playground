# 1) Build stage
FROM node:20-alpine AS build
WORKDIR /app

# 1a) Install all deps
COPY package*.json ./
RUN npm ci

# 1b) Copy your entire monorepo and run the build
COPY . .
# This runs: `vite build` (client) + `esbuild server/index.ts … --outdir=dist`
RUN npm run build

# 2) Production image
FROM node:20-alpine AS runner
WORKDIR /app

# 2a) Install only prod deps
COPY package*.json ./
RUN npm ci --only=production

# 2b) Copy the built output
COPY --from=build /app/dist ./dist

# 2c) Expose your port and launch the server
ENV PORT=5000
EXPOSE 5000
CMD ["node", "dist/index.js"]