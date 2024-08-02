import AIAdapter from './adapter.base.js'
import ollama from 'ollama';

export class OpenAIAdapter extends AIAdapter{

    constructor(app) {
        super(app)
    }
    async makeRequest(options) {
        
        try {
            return ollama.chat({
                ...options,
                model: 'llama3.1',
                messages: [{ role: 'user', content: 'Why is the sky blue?' }],
            })    
        } catch (error) {
            console.log('Request:', options, 'Error:', error);
            throw error;
        }
    }
}