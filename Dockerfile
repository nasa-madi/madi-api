FROM node:20-alpine

WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package.json ./
COPY package-lock.json ./

# Install dependencies (include dev dependencies for development)
RUN npm ci

# Copy the rest of the application code
COPY --chown=node:node . .

# Curl is required for health checks
RUN apk add --no-cache curl

# Switch to a non-root user
USER node

# Expose the port
EXPOSE 3030

# Start the application
CMD ["npm", "start"]