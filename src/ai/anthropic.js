import { SimpleChatModel } from "@langchain/core/language_models/chat_models";
import { CallbackManagerForLLMRun } from "@langchain/core/callbacks/manager";
import { AIMessageChunk } from "@langchain/core/messages";
import { ChatGenerationChunk } from "@langchain/core/outputs";
import { AnthropicVertex } from '@anthropic-ai/vertex-sdk';

const PROJECT_ID = 'hq-madi-dev-4ebd7d92';
const KEY_FILENAME = '../terraform/credentials.json';
process.env.GOOGLE_APPLICATION_CREDENTIALS = KEY_FILENAME;
process.env.CLOUD_ML_REGION = 'us-east5';
process.env.ANTHROPIC_VERTEX_PROJECT_ID = 'hq-madi-dev-4ebd7d92';

const client = new AnthropicVertex();

export class CustomAnthropicVertex extends SimpleChatModel {
  constructor(fields) {
    super(fields);
    this.n = fields.n;
  }

  _llmType() {
    return "custom";
  }

  async _call(messages, options, runManager) {
    if (!messages.length) {
      throw new Error("No messages provided.");
    }
    if (typeof messages[0].content !== "string") {
      throw new Error("Multimodal messages are not supported.");
    }
    
    const result = await client.messages.create({
      messages,
      model: 'claude-3-5-sonnet@20240620',
      max_tokens: this.n,
      ...options
    });

    return result.responses[0];
  }

  async *_streamResponseChunks(messages, options, runManager) {
    if (!messages.length) {
      throw new Error("No messages provided.");
    }
    if (typeof messages[0].content !== "string") {
      throw new Error("Multimodal messages are not supported.");
    }

    const result = await client.messages.create({
      messages,
      model: 'claude-3-5-sonnet@20240620',
      max_tokens: this.n,
      ...options,
      stream: true

    });

    for (const letter of result.responses[0]) {
      yield new ChatGenerationChunk({
        message: new AIMessageChunk({
          content: letter,
        }),
        text: letter,
      });
      await runManager?.handleLLMNewToken(letter);
    }
  }
}

// async function runCustomChatModel() {
//   const customModel = new CustomChatModel({ n: 300 });
//   const messages = [{ "role": "user", "content": "What's the weather like in San Francisco?" }];
//   const options = {}; // You can add any additional options here
//   const runManager = new CallbackManagerForLLMRun();
  
//   const response = await customModel.call(messages, options, runManager);
//   console.log(response);

//   const stream = customModel.streamResponseChunks(messages, options, runManager);
//   for await (const chunk of stream) {
//     console.log(chunk);
//   }
// }

