FROM node:18-bullseye

VOLUME /var/lib/docker

COPY ./package.json /app/package.json

WORKDIR /app

RUN npm install

COPY ./tsconfig.json /app/tsconfig.json
COPY ./tsoa.json /app/tsoa.json
COPY ./tsconfig.eslint.json /app/tsconfig.eslint.json
COPY ./src /app/src
COPY ./test /app/test
COPY ./data/simple_demo.tsv /app/data/simple_demo.tsv
COPY ./.eslintrc.js /app/.eslintrc.js

RUN npm run build

EXPOSE 9999

ENTRYPOINT ["npm", "run", "start"]
