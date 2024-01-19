FROM node:20-alpine

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm ci --production

COPY . ./

CMD sh -c ' \
  if [ "$MIGRATION" = "true" ]; then \
    npm run migrate; \
  elif [ "$SEED" = "true" ]; then \
    npm run seed:admin; \
  fi; \
  npm start \
'