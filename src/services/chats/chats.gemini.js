export async function makeRequest(options, openai, apiKey) {
    options.model = 'gemini-pro';
    try {
        return openai.chat.completions.create(options)
    } catch (error) {
        console.log('Request:', options, 'Error:', error);
        throw error;
    }
}
