FROM node:22-alpine

WORKDIR /app

COPY package.json yarn.lock ./
COPY frontend/package.json ./frontend/
COPY shared-types/package.json ./shared-types/
COPY configs/package.json ./configs/

COPY frontend ./frontend
COPY shared-types ./shared-types
COPY configs ./configs

RUN yarn install --frozen-lockfile

RUN yarn build:client

RUN mkdir -p /app/frontend/.next && chown -R node:node /app/frontend

EXPOSE 3000

USER node

CMD ["yarn", "--cwd", "frontend", "start"] 