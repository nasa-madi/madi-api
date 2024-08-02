
import AIAdapter from './adapter.base.js'

export class OpenAIAdapter extends AIAdapter{

    constructor(app) {
        super(app)
    }
    async makeRequest(options) {
        options.model = 'gpt-4-1106-preview';

        let openai = this.app.openai; //shared instance
        
        try {
            return openai.chat.completions.create(options)
        } catch (error) {
            console.log('Request:', options, 'Error:', error);
            throw error;
        }
    }
}