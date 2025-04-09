FROM node:22-alpine

WORKDIR /app


COPY package.json yarn.lock ./
COPY backend/package.json ./backend/
COPY shared-types/package.json ./shared-types/
COPY configs/package.json ./configs/

COPY backend ./backend
COPY shared-types ./shared-types
COPY configs ./configs

RUN yarn install --frozen-lockfile

RUN yarn build:server

RUN chown -R node:node /app/backend

EXPOSE 4000

USER node

CMD ["yarn", "--cwd", "backend", "start:prod"] 