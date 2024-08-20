import { logger } from '../../logger.js';
export async function makeRequest(options, openai, apiKey) {
    options.model = 'gpt-4o';
    try {
        return openai.chat.completions.create(options)
    } catch (error) {
        logger.error('Request:', options);
        logger.error('Error:', error);
        throw error;
    }
}
