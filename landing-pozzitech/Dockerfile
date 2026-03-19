FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build:css

FROM node:20-alpine AS production

ENV NODE_ENV=production
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

COPY --from=builder /app/src ./src
COPY --from=builder /app/server.js .
COPY --from=builder /app/tailwind.config.js .

ENV PORT=2999
EXPOSE 2999

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -q -O /dev/null http://localhost:2999 || exit 1

CMD ["node", "server.js"]
