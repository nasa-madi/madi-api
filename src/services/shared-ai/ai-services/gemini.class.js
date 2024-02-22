import { SharedInterface } from "./common.schema";



// This is a skeleton for a custom service class. Remove or add the methods you need here
export class GeminiService extends SharedInterface {
    constructor(options) {
        this.options = options
    }

    async createEmbedding() {

    }

    async createChat(data, params) {
        const generativeModel = vertex_ai.preview.getGenerativeModel({
            model: 'gemini-pro',
            // The following parameters are optional
            // They can also be passed to individual content generation requests
            safety_settings: [{category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE}],
            generation_config: {max_output_tokens: 256},
        });

        let request = convert(data)

        const streamingResp = await generativeModel.generateContentStream(request);
          for await (const item of streamingResp.stream) {
            console.log('stream chunk: ', JSON.stringify(item));
        }
    }

}


const safetyRating = Type.Object({
    category: Type.String(),
    probability: Type.String(),
  });
  
  const content = Type.Object({
    parts: Type.Array(Type.Any()),  // this should be further specified based on the properties each part object can have
    role: Type.Optional(Type.String())
  });
  
  const citationSource = Type.Object({
    startIndex: Type.Optional(Type.Number()),
    endIndex: Type.Optional(Type.Number()),
    uri: Type.Optional(Type.String()),
    license: Type.Optional(Type.String())
  });
  
  const citationMetadata = Type.Object({
    citationSources: Type.Array(citationSource)
  });
  
  const functionCall = Type.Object({ 
    name: Type.String(),
    args: Type.Object(Type.Any())
  });
  
  const GenerateContentCandidate = Type.Object({
    content: content,
    index: Type.Optional(Type.Number()),
    finishReason: Type.Optional(Type.String()),
    finishMessage: Type.Optional(Type.String()),
    safetyRatings: Type.Optional(Type.Array(safetyRating)),
    citationMetadata: Type.Optional(citationMetadata),
    functionCall: Type.Optional(functionCall)
  });