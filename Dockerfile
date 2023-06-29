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

COPY --from=manager-builder /app/dist /app/dist
COPY --from=manager-builder /app/package.json /app/package.json
COPY --from=manager-builder /app/node_modules /app/node_modules
COPY --from=manager-builder /app/config /app/config

CMD ["node", "dist/cmd/index.js"]
