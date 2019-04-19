FROM node:10

WORKDIR /usr/src/app

RUN git clone https://github.com/xyzblocks/feature-toggle-nodejs.git .

RUN npm install

RUN npm install -g pm2

RUN npm test

EXPOSE 8080

CMD [ "pm2-runtime", "dist/main.js" ]