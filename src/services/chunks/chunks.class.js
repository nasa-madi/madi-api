import { EmbeddingKnexService } from '../utils/EmbeddingKnexAdapter.js'
import config from '@feathersjs/configuration'



// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class ChunkService extends EmbeddingKnexService{
  constructor(options) {
    super(options)
    this.options = options
    this.openai = options.app.openai
  }

  get maxLength(){
    return config()().chunks.maxLength
  }


  async fetchEmbedding(chunk, options={}){
    let input = JSON.stringify(chunk)

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
