FROM node:18 AS base
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev
COPY dist ./dist
EXPOSE 3001
CMD ["node", "dist/index.js"]
