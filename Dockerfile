# Builds the ui and the manager and creates an image with both. Fastify serves the ui.

# UI builder
FROM node:16-alpine as ui-builder

WORKDIR /app

COPY ./ui/package.json /app/package.json

RUN npm install

COPY ./ui /app

RUN npm run build

# Manager builder
FROM node:16-alpine as manager-builder

WORKDIR /app

COPY ./manager/package.json /app/package.json

RUN npm install

COPY ./manager /app

RUN npm run build

# Final image
FROM node:16-alpine as final

WORKDIR /app

COPY --from=manager-builder /app .
COPY --from=ui-builder /app/dist ./ui

CMD ["node", "dist/cmd/index.js"]
