FROM node:14 as build

RUN apt-get update && apt-get install -y vim

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install
COPY . .

RUN chmod +x bin/p5-manager.js
RUN chmod +x entrypoint.sh

FROM node:14-slim

WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app ./

RUN chmod +x entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]
