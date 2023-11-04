FROM node:20-alpine
WORKDIR .
COPY package*.json ./
RUN npm i
COPY . .
EXPOSE 8082
CMD ["node", "app.js"]