FROM node:latest

WORKDIR /api

COPY . .

RUN rm -rf node_modules
RUN npm i
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]