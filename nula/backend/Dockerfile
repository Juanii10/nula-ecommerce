FROM node:22-slim

# Prisma necesita openssl en la imagen slim
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src

# Cloud Run inyecta PORT (8080); server.js ya lo lee
EXPOSE 8080
CMD ["node", "src/server.js"]
