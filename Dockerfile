FROM node:20-alpine

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm ci --production

COPY . ./

# CMD sh -c ' \
#   echo "SEED $SEED"; \
#   echo "MIGRATION $MIGRATION"; \
#   if [ "$SEED" = "true" ]; then \
#     echo "Running seed:admin"; \
#     npm run seed:admin; \
#   fi; \
#   echo "Starting the application"; \
#   npm start \
# '

CMD sh -c ' \
  echo "SEED $SEED"; \
  echo "MIGRATION $MIGRATION"; \
  if [ "${MIGRATION:-false}" = "true" ]; then \
    npm run migrate; \
  elif [ "${SEED:-false}" = "true" ]; then \
    npm run seed:admin; \
  fi; \
  npm start \
'