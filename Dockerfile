FROM node:20

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . ./

# ENV PORT 8080

CMD ["npm", "start"]



# gcloud run deploy api-hq-madi-dev-4ebd7d92 --quiet --image us-east4-docker.pkg.dev/hq-madi-dev-4ebd7d92/docker-images/api-hq-madi-dev-4ebd7d92:05d0bcc7b86178bf09379cd0e2048a37db26d4d2 --update-labels managed-by=github-actions,commit-sha=05d0bcc7b86178bf09379cd0e2048a37db26d4d2 --platform managed --format json --region us-east4 --project hq-madi-dev-4ebd7d92