FROM node:18 AS base
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev
COPY dist ./dist
RUN chown -R node:node /app
USER node
EXPOSE 3001
CMD ["node", "dist/index.js"]
