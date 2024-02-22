const fetch = require('node-fetch');
require('dotenv').config();

const PROJECT_ID = process.env.PROJECT_ID || "hq-madi-dev-4ebd7d92";
const MODEL_ID = process.env.MODEL_ID || "chat-bison";
const API = process.env.API || "streamGenerateContent";

async function getAccessToken() {
  const response = await fetch(`https://www.googleapis.com/oauth2/v4/token?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&refresh_token=${process.env.REFRESH_TOKEN}&grant_type=refresh_token`, {
    method: 'POST',
  });
  const json = await response.json();
  return json.access_token;
}

async function fetchMovieInfo() {
  const accessToken = await getAccessToken();

  const response = await fetch(`https://us-central1-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/us-central1/publishers/google/models/${MODEL_ID}:${API}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "contents": [/*...your contents here...*/],
      "tools": [/*...your tools here...*/]
    })
  });

  return response.json();
}

fetchMovieInfo().then(console.log).catch(console.error);