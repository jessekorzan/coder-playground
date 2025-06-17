FROM node:20-alpine AS client-build
WORKDIR /app
COPY client/ ./client/
RUN cd client && npm install && npm run build

FROM node:20-alpine AS server
WORKDIR /app
COPY server/ ./server/
COPY --from=client-build /app/client/dist ./server/public
WORKDIR /app/server
RUN npm install
ENV PORT=5000
CMD ["npm", "start"]