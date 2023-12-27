FROM node:20

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . ./

ENV PORT 3030

CMD ["npm", "start"]