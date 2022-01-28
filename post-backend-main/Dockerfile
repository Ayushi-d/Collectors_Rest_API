FROM node:15-alpine AS build

WORKDIR /app
ADD . /app/
RUN yarn install
RUN yarn build

RUN cp -r package.json dist/
RUN cp yarn.lock dist/

FROM node:15-alpine AS web

WORKDIR /app
COPY --from=build /app/dist /app
RUN yarn install --only=prod

EXPOSE 3000

CMD [ "node", "app.js" ]
