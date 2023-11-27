FROM node:20-alpine as builder
WORKDIR /usr/app
COPY package*.json ./
RUN npm i
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /usr/app
COPY package*.json ./
RUN npm i --production
COPY --from=builder /usr/app/dist .

EXPOSE 8082
CMD ["node", "app.js"]