PROJECT_ID="hq-madi-dev-4ebd7d92"
MODEL_ID="chat-bison"
MODEL_ID=gemini-pro
API=streamGenerateContent

curl -X POST -H "Authorization: Bearer $(gcloud auth print-access-token)" -H "Content-Type: application/json" https://us-central1-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/us-central1/publishers/google/models/${MODEL_ID}:${API} -d '{
  "contents": [{
    "role": "user",
    "parts": [{
      "text": "Which theaters in Mountain View show Barbie movie?"
    }]
  }, {
    "role": "model",
    "parts": [{
      "functionCall": {
        "name": "find_theaters",
        "args": {
          "location": "Mountain View, CA",
          "movie": "Barbie"
        }
      }
    }]
  }, {
    "role": "function",
    "parts": [{
      "functionResponse": {
        "name": "find_theaters",
        "response": {
          "name": "find_theaters",
          "content": {
            "movie": "Barbie",
            "theaters": [{
              "name": "AMC Mountain View 16",
              "address": "2000 W El Camino Real, Mountain View, CA 94040"
            }, {
              "name": "Regal Edwards 14",
              "address": "245 Castro St, Mountain View, CA 94040"
            }]
          }
        }
      }
    }]
  },
  {
    "role": "model",
    "parts": [{
      "text": " OK. Barbie is showing in two theaters in Mountain View, CA: AMC Mountain View 16 and Regal Edwards 14."
    }]
  },{
    "role": "user",
    "parts": [{
      "text": "Can we recommend some comedy movies on show in Mountain View?"
    }]
  }],
  "tools": [{
    "functionDeclarations": [{
      "name": "find_movies",
      "description": "find movie titles currently playing in theaters based on any description, genre, title words, etc.",
      "parameters": {
        "type": "OBJECT",
        "properties": {
          "location": {
            "type": "STRING",
            "description": "The city and state, e.g. San Francisco, CA or a zip code e.g. 95616"
          },
          "description": {
            "type": "STRING",
            "description": "Any kind of description including category or genre, title words, attributes, etc."
          }
        },
        "required": ["description"]
      }
    }, {
      "name": "find_theaters",
      "description": "find theaters based on location and optionally movie title which are is currently playing in theaters",
      "parameters": {
        "type": "OBJECT",
        "properties": {
          "location": {
            "type": "STRING",
            "description": "The city and state, e.g. San Francisco, CA or a zip code e.g. 95616"
          },
          "movie": {
            "type": "STRING",
            "description": "Any movie title"
          }
        },
        "required": ["location"]
      }
    }, {
      "name": "get_showtimes",
      "description": "Find the start times for movies playing in a specific theater",
      "parameters": {
        "type": "OBJECT",
        "properties": {
          "location": {
            "type": "STRING",
            "description": "The city and state, e.g. San Francisco, CA or a zip code e.g. 95616"
          },
          "movie": {
            "type": "STRING",
            "description": "Any movie title"
          },
          "theater": {
            "type": "STRING",
            "description": "Name of the theater"
          },
          "date": {
            "type": "STRING",
            "description": "Date for requested showtime"
          }
        },
        "required": ["location", "movie", "theater", "date"]
      }
    }]
  }]
}'
    