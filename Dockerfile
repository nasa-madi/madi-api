FROM node:20-alpine

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm ci --production

COPY . ./

# This is an ugly way to run migrations on EVERY container start. For most containers
# it will be skipped, but does slow the start time.  
# Seeding will only be done in the local, develop, test environments, but not prod.
CMD if [ "$NODE_ENV" != "production" ]; then \
        npm run migrate && \
        npm run knex:seed; \
    else \
        npm run migrate; \
    fi && \
    npm start