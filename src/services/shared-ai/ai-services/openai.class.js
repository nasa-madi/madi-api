import { SharedInterface, sharedSchema } from "../shared-ai.class";



// This is a skeleton for a custom service class. Remove or add the methods you need here
export class OpenAiService extends SharedAiServiceInterface {
    constructor(options) {
        this.options = options
    }

    async embedding() {
        // add your implementation here
        throw new Error('embedding method is not implemented');
    }

    async create(data, params) {
        // add your implementation here
        throw new Error('create method is not implemented');
    }

    convert(input){
        const output = {
            contents: input.messages.map(message => ({
            role: message.role,
            parts: [{
                text: message.content
            }]
            })),
            tools: input.tools || []
        };
        
        if (input.tool_choice && input.tool_choice.type === 'function') {
            output.tools.push({
            functionDeclarations: [{
                name: input.tool_choice.function.name,
                description: '',
                parameters: { type: 'object', properties: {}, required: [] }
            }]
            });
        }
        
        return output;
    }

}

export const getOptions = (app) => {
return { app }
}
