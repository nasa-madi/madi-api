import openai from "./cacheProxy.js";

export const fetchEmbedding = async (text, model)=>{
    const embedding = await openai.embeddings.create({
        model: model || "text-embedding-ada-002",
        input: text,
        encoding_format: "float",
    });
    return embedding?.data?.[0]?.embedding
}


