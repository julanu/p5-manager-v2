FROM node:22-alpine3.18 as build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install
COPY . .

FROM node:22-alpine3.18

WORKDIR /app

COPY --from=build /app ./

RUN chmod +x bin/p5-manager.js
RUN chmod +x entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]
