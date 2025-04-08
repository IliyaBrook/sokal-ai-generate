FROM node:22-alpine

WORKDIR /app

# Копируем только файлы, необходимые для установки зависимостей
COPY package.json yarn.lock ./
COPY backend/package.json ./backend/
COPY shared-types/package.json ./shared-types/
COPY configs/package.json ./configs/

COPY backend ./backend
COPY shared-types ./shared-types
COPY configs ./configs

RUN yarn install --frozen-lockfile

# Сборка приложения
RUN yarn build:server

RUN chown -R node:node /app/backend

EXPOSE 4000

USER node

# Запуск в production режиме
CMD ["yarn", "--cwd", "backend", "start:prod"] 