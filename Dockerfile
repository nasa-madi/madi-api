FROM node:20-alpine

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm ci --production

COPY . ./

CMD if [ "$MIGRATION" = "true" ]; then npm run migrate && npm start; elif [ "$SEED" = "true" ]; then npm run seed:admin && npm start; else npm start; fi