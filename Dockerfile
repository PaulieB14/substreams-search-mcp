FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY build/ build/

ENTRYPOINT ["node", "build/index.js"]
