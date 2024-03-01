export async function makeRequest(options, openai, apiKey) {
    options.model = 'gpt-4-1106-preview';
    try {
        return openai.chat.completions.create(options)
    } catch (error) {
        console.log('Request:', options, 'Error:', error);
        throw error;
    }
}