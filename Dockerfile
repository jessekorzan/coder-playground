# 1. Build the React client
FROM node:20-alpine AS client-build
WORKDIR /app/client

# Copy only the package manifests and install deps
COPY client/package*.json ./
RUN npm install

# Copy source & run build
COPY client/ ./
RUN npm run build

# 2. Build the Express/WebSocket server
FROM node:20-alpine AS server
WORKDIR /app/server

# Copy server source and install deps
COPY server/package*.json ./
RUN npm install

COPY server/ ./

# Copy the client build into server’s public folder
COPY --from=client-build /app/client/dist ./public

ENV PORT=5000
EXPOSE 5000
CMD ["npm", "start"]