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

COPY package*.json ./
RUN npm ci

# copy in the built output…
COPY --from=build /app/client/dist ./public
+# …and also copy the original client folder so /app/client/index.html exists
+COPY client ./client

ENV PORT=5000
EXPOSE 5000
CMD ["node", "dist/index.js"]


