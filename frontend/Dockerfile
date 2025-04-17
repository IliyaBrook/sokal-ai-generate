FROM node:22-alpine

WORKDIR /app
ENV NEXT_PUBLIC_API_URL=http://backend:4000/api
RUN yarn config set network-timeout 300000 && \
    yarn config set registry https://registry.npmjs.org/ && \
    yarn config set network-concurrency 4

COPY package.json yarn.lock ./
COPY frontend/package.json ./frontend/
COPY shared-types/package.json ./shared-types/
COPY configs/package.json ./configs/

COPY frontend ./frontend
COPY shared-types ./shared-types
COPY configs ./configs

RUN yarn install --frozen-lockfile --network-timeout 600000 || \
    yarn install --frozen-lockfile --network-timeout 600000 || \
    yarn install --frozen-lockfile --network-timeout 600000

RUN cd shared-types && npx tsc --skipLibCheck
RUN echo "NEXT_PUBLIC_API_URL=http://backend:4000/api" > ./frontend/.env.production

RUN yarn build:client

RUN mkdir -p /app/frontend/.next && chown -R node:node /app/frontend

EXPOSE 3000

USER node

CMD ["yarn", "--cwd", "frontend", "start"] 