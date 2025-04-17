FROM node:22-alpine

WORKDIR /app

RUN yarn config set network-timeout 300000 && \
    yarn config set registry https://registry.npmjs.org/ && \
    yarn config set network-concurrency 4

#COPY package.json yarn.lock ./
COPY backend/package.json ./backend/
COPY shared-types/package.json ./shared-types/
COPY configs/package.json ./configs/

COPY backend ./backend
COPY shared-types ./shared-types
COPY configs ./configs

RUN yarn install --frozen-lockfile --network-timeout 600000 || \
    yarn install --frozen-lockfile --network-timeout 600000 || \
    yarn install --frozen-lockfile --network-timeout 600000

RUN cd shared-types && npx tsc --skipLibCheck

RUN yarn build:server

RUN chown -R node:node /app/backend

EXPOSE 4000

USER node

CMD ["yarn", "--cwd", "backend", "start:prod"] 