FROM node:20-alpine

WORKDIR /app

# Curl is required for health checks
RUN apk update && apk add --no-cache curl 

COPY package.json ./
COPY package-lock.json ./

# Install dependencies (include dev dependencies for development)
RUN npm ci

COPY . .

# Ensure the proper user permissions (adjust the user as necessary)
RUN chown -R node:node /app

# Switch to a non-root user
USER node

# Expose the port
EXPOSE 3030

# Start the application
CMD ["npm", "start"]


# CMD sh -c ' \
#   echo "SEED $SEED"; \
#   echo "MIGRATION $MIGRATION"; \
#   if [ "${MIGRATION:-false}" = "true" ]; then \
#     npm run migrate; \
#   fi; \
#   if [ "${SEED:-false}" = "true" ]; then \
#     npm run seed:admin; \
#   fi; \
#   npm start \
# '
