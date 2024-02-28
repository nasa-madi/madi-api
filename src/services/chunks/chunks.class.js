import { EmbeddingKnexService } from '../utils/EmbeddingKnexAdapter.js'



// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class ChunksService extends EmbeddingKnexService{
  constructor(options) {
    super(options)
    this.options = options
    this.openai = options.app.openai
  }



  async fetchEmbedding(input, options={}){
    const embedding = await this.openai.embeddings.create({
        model: options.model || "text-embedding-ada-002",
        input,
        encoding_format: "float",
    });
    return embedding?.data?.[0]?.embedding
  }

}

export const getOptions = (app) => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('postgresqlClient'),
    name: 'chunks',
    id: 'id',
    app
  }
}
