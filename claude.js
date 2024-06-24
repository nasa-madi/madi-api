import { VertexAI } from '@google-cloud/vertexai';
import { AnthropicVertex } from '@anthropic-ai/vertex-sdk';

const PROJECT_ID = 'hq-madi-dev-4ebd7d92';
const KEY_FILENAME = '../terraform/credentials.json';
process.env.GOOGLE_APPLICATION_CREDENTIALS = KEY_FILENAME


// /**
//  * TODO(developer): Update these variables before running the sample.
//  */
// async function generateWithGemini(projectId = PROJECT_ID, keyFilename = KEY_FILENAME) {
//   const vertexAI = new VertexAI({
//     project: projectId,
//     location: 'us-central1',
//     keyFilename: keyFilename
//   });

//   const generativeModel = vertexAI.getGenerativeModel({
//     model: 'gemini-1.5-flash-001',
//   });

//   const prompt =
//     "What's a good name for a flower shop that specializes in selling bouquets of dried flowers?";

//   const resp = await generativeModel.generateContent(prompt);
//   const contentResponse = await resp.response;
//   console.log(JSON.stringify(contentResponse, null, 2));
// }



process.env.CLOUD_ML_REGION = 'us-east5';
process.env.ANTHROPIC_VERTEX_PROJECT_ID = 'hq-madi-dev-4ebd7d92';

// Reads from the `CLOUD_ML_REGION` & `ANTHROPIC_VERTEX_PROJECT_ID` environment variables.
// Additionally goes through the standard `google-auth-library` flow.
const client = new AnthropicVertex();



async function generateWithClaude() {
    const result = await client.messages.create({

        messages:[{"role": "user", "content": "What's the weather like in San Francisco?"}],
        model: 'claude-3-5-sonnet@20240620',
        max_tokens: 300,
        tools:[{
            "name": "get_weather",
            "description": "Get the current weather in a given location",
            "input_schema": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city and state, e.g. San Francisco, CA",
                    }
                },
                "required": ["location"],
            },
        }]
      });
      console.log(JSON.stringify(result, null, 2));
  }
  
generateWithClaude();