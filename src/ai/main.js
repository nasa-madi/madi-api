import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { VertexAI } from '@google-cloud/vertexai';
import { ChatVertexAI } from "@langchain/google-vertexai";
import { ChatAnthropic } from "@langchain/anthropic";
import { HumanMessage, AIMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";
import { CustomAnthropicVertex } from "./anthropic.js"


import { GoogleAuth } from "google-auth-library";

const LOCATION = 'us-east1';
const PROJECT_ID = 'hq-madi-dev-4ebd7d92';
const KEY_FILENAME = '../terraform/credentials.json';
const MODEL_NAME = 'claude-3-5-sonnet@20240620';
process.env.GOOGLE_APPLICATION_CREDENTIALS = KEY_FILENAME


class AIService {
    async makeRequest(options) {
        return '';
    }

    async fetchEmbedding(text) {
        return [];
    }

    coerceMessageLikeToMessage({ role: type, content, ...rest }) {
        if (type === "human" || type === "user") {
            return new HumanMessage({ content });
        } else if (type === "ai" || type === "assistant") {
            if (rest.tool_calls) {
                content = "";
                rest.tool_calls = rest.tool_calls.map((tool_call) => ({
                    name: tool_call.function.name,
                    args: tool_call.function.arguments,
                    id: tool_call.id
                }));
            }
            return new AIMessage({ content, ...rest });
        } else if (type === "system") {
            return new SystemMessage({ content });
        } else if (type === "tool") {
            return new ToolMessage({ content, ...rest });
        } else {
            throw new Error(`Unable to coerce message from array: only human, AI, or system message coercion is currently supported.`);
        }
    }

    async processRequest(options, llm) {
        try {
            const modelWithTools = llm.bind({ tools: options.tools });
            const messages = options.messages.map(this.coerceMessageLikeToMessage);
            return options.stream ? modelWithTools.stream(messages) : modelWithTools.invoke(messages);
        } catch (error) {
            console.log('Request:', options, 'Error:', error);
            throw error;
        }
    }
}

class GPTService extends AIService {
    async makeRequest(options) {
        options.model = 'gpt-4-1106-preview';
        const llm = new ChatOpenAI({ ...options});
        return this.processRequest(options, llm);
    }

    async fetchEmbedding(text) {
        const embedding = await openai.embeddings.create({
            model: model || "text-embedding-ada-002",
            input: text,
            encoding_format: "float",
        });
        return embedding?.data?.[0]?.embedding;
    }
}





// Define the scopes your application needs.

const scopes = ['https://www.googleapis.com/auth/cloud-platform'];

// Create a GoogleAuth instance.
const auth = new GoogleAuth({
  keyFile: KEY_FILENAME,
  scopes
});


async function getAuthToken() {
    
  try {
    // Acquire an auth client, and bind it to all future calls.
    const client = await auth.getClient();

    // Obtain the current access token.
    const token = await client.getAccessToken();
    
    // Log or return the token for use in your application.
    console.log('Access Token:', token.token);
    return token.token;
  } catch (error) {
    console.error('Error obtaining access token:', error);
    throw error;
  }
}

// Example usage:


class ClaudeService extends AIService {
    async makeRequest(options) {
       
       
       
        // const config = {
        //     // ...options,
        //     // model: 'claude-3-5-sonnet@20240620',
        //     model: 'gemini-1.0-002',
        //     project: PROJECT_ID,
        //     location: 'us-east5',
        //     keyFilename: KEY_FILENAME,
        //     apiKey: 'fake-key',
        //     anthropicApiUrl: `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/anthropic/models/${MODEL_NAME}:streamRawPredict`
        // };
        // const authToken = await getAuthToken()
        // const llm = new ChatAnthropic(
        //     { ...config,
        //         clientOptions: {
        //             // baseURL:`https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/anthropic/models/${MODEL_NAME}:streamRawPredict`,
        //             authToken
        //         }
        //     }
        //   )

        const llm = new CustomAnthropicVertex({ ...options});


        // options.model = 'claude-3-5-sonnet@20240620';
        // const llm = new ChatVertexAI({ ...options});




        return this.processRequest(options, llm);
    }

    async fetchEmbedding(text) {
        // Implementation for ClaudeService's fetchEmbedding if needed
    }
}




// class NewChatConnection extends ChatConnection {
//     constructor(fields, caller, client, stream) {
//         super(fields, caller, client, stream);
//     }
//     get computeUseSystemInstruction() {
//         // This works on models from April 2024 and later
//         //   Vertex AI: gemini-1.5-pro and gemini-1.0-002 and later
//         //   AI Studio: gemini-1.5-pro-latest
//         if (this.modelFamily === "palm") {
//             return false;
//         }
//         else if (this.modelName === "gemini-1.0-pro-001") {
//             return false;
//         }
//         else if (this.modelName.startsWith("gemini-pro-vision")) {
//             return false;
//         }
//         else if (this.modelName.startsWith("gemini-1.0-pro-vision")) {
//             return false;
//         }
//         else if (this.modelName === "gemini-pro" && this.platform === "gai") {
//             // on AI Studio gemini-pro is still pointing at gemini-1.0-pro-001
//             return false;
//         }
//         return true;
//     }
// }

let options = {
    //   "stream": true,
      "messages": [
        {
          "role": "user",
          "content": "Hello!"
        }
      ],
    }
// const newGPTService = new GPTService();
// let result = newGPTService.makeRequest(options);

// const newClaudeService = new ClaudeService();
// let result = newClaudeService.makeRequest(options);

// for await (const chunk of await result) {
// console.log(`${chunk.content}\n`)}





// let options2 = {
//     "stream": false,
//     "messages": [
//       {
//         "role": "user",
//         "content": "What's the weather like in San Francisco?"
//         // "content": "What is 3 * 12"
//       }
//     ],
//     "tools": [
//         {
//             "type": "function",
//             "function": {
//                 "name": "get_current_weather",
//                 "description": "Get the current weather in a given location",
//                 "parameters": {
//                     "type": "object",
//                     "properties": {
//                         "location": {
//                             "type": "string",
//                             "description": "The city and state, e.g. San Francisco, CA"
//                         },
//                         "unit": {
//                             "type": "string",
//                             "enum": [
//                                 "celsius",
//                                 "fahrenheit"
//                             ]
//                         }
//                     },
//                     "required": [
//                         "location"
//                     ]
//                 }
//             }
//         }
//     ],
//     "tool_choice": "auto",
// }


// const newGPTService = new GPTService();
// let result = newGPTService.makeRequest(options2);

// // console.log(await result);
// for await (const chunk of await result) {
//     // console.log(`${chunk.content}\n`)
//     console.log(chunk.tool_call_chunks);
// }
    
    
let tools = [
    {
        "type": "function",
        "function": {
            "name": "get_current_weather",
            "description": "Get the current weather in a given location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city and state, e.g. San Francisco, CA"
                    },
                    "unit": {
                        "type": "string",
                        "enum": [
                            "celsius",
                            "fahrenheit"
                        ]
                    }
                },
                "required": [
                    "location"
                ]
            }
        }
    }
]

let options3 = {
    "messages": [
        {
            "role": "user",
            "content": "What's the weather like in San Francisco, Tokyo, and Paris?"
        },
        {
            "role": "assistant",
            "content": null,
            "tool_calls": [
                {
                    "id": "call_k3YLTd4jC5gTFwXneuTakbSv",
                    "type": "function",
                    "function": {
                        "name": "get_current_weather",
                        "arguments": "{\"location\": \"San Francisco, CA\"}"
                    }
                },
                {
                    "id": "call_RRE9R9AuhtLvqoHEVmywhMiJ",
                    "type": "function",
                    "function": {
                        "name": "get_current_weather",
                        "arguments": "{\"location\": \"Tokyo\"}"
                    }
                },
                {
                    "id": "call_CQWPfgIyY78pv7VKwA01Sgs1",
                    "type": "function",
                    "function": {
                        "name": "get_current_weather",
                        "arguments": "{\"location\": \"Paris\"}"
                    }
                }
            ]
        },
        {
            "tool_call_id": "call_k3YLTd4jC5gTFwXneuTakbSv",
            "role": "tool",
            "name": "get_current_weather",
            "content": "{\"location\":\"San Francisco\",\"temperature\":\"72\",\"unit\":\"fahrenheit\"}"
        },
        {
            "tool_call_id": "call_RRE9R9AuhtLvqoHEVmywhMiJ",
            "role": "tool",
            "name": "get_current_weather",
            "content": "{\"location\":\"Tokyo\",\"temperature\":\"32\",\"unit\":\"celsius\"}"
        },
        {
            "tool_call_id": "call_CQWPfgIyY78pv7VKwA01Sgs1",
            "role": "tool",
            "name": "get_current_weather",
            "content": "{\"location\":\"Paris\",\"temperature\":\"35\",\"unit\":\"celsius\"}"
        }

    ],
    "tool_choice":"auto",
    "tools": tools
}
    

// const newGPTService = new GPTService();
// let result = newGPTService.makeRequest(options3);

const newClaudeService = new ClaudeService();
let result = newClaudeService.makeRequest(options);

// console.log(await result);
for await (const chunk of await result) {
    // console.log(`${chunk.content}\n`)
    console.log(chunk.tool_call_chunks);
}