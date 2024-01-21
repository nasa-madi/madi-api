curl -N -i -H "Accept: text/event-stream" \
     --http2 \
     -H "Authorization: Bearer $(gcloud auth print-identity-token)" \
    --header 'x-goog-authenticated-user-email: accounts.google.com:javilla8@gcp.nasa.gov' \
    --header 'x-goog-authenticated-user-id: accounts.google.com:114070789823134951929' \
    --header 'Content-Type: application/json' \
    --data '{
        "stream":true,
        "messages": [
            {
                "role": "user",
                "content": "Hello"
            }
        ],
         "tools":[{"type":"function","function":{"name":"get_current_weather","description":"Get the current weather in a given location","parameters":{"type":"object","properties":{"location":{"type":"string","description":"The city and state, e.g. San Francisco, CA"},"unit":{"type":"string","enum":["celsius","fahrenheit"]}},"required":["location"]}}}],
        "tool_choice":"auto"
    }' \
    https://api-hq-madi-dev-4ebd7d92-qchuuc3j7q-uk.a.run.app/chats
    # http://localhost:3030/chats



