FROM node:10

WORKDIR /usr/src/app

COPY . ./

RUN npm install

RUN npm install -g pm2

RUN npm test

EXPOSE 8080

CMD [ "pm2-runtime", "dist/main.js" ]