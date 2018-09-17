FROM node:8.10

WORKDIR /scrap

COPY package*.json ./

RUN npm install
COPY . .

EXPOSE 3005
