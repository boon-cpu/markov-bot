FROM node:current-alpine

WORKDIR /app

COPY . .

RUN yarn

CMD ["yarn", "start"]