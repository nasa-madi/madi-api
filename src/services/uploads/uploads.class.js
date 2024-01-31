import { EmbeddingKnexService } from '../utils/EmbeddingKnexAdapter.js'

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class UploadService extends EmbeddingKnexService{

  constructor(options){
    super(options)
    this.app = options.app
    this.embeddingModel = options.embeddingModel
  }

  

  async get(id, params){
    let item = await this._get(id, params)
    let path = 'hello.txt'
    return await this.app.services['blobs'].get(
      path  
    ,{...params, provider:'internal'})
    return item
  }

  async create(data,params){
    let file = await this.app.services['blobs'].create({
      ...data,
      file: params.file,
    },{...params, provider:'internal'})
    console.log(file)
    let date = new Date()
    data['fileId'] = file.id
    data['pluginId'] = data.pluginId
    data['filename'] = params?.file?.originalname
    data['metadata'] = data.metadata || {}
    data['filepath'] = file.name.substring(0, file.name.lastIndexOf("/") + 1);
    data['created_at'] = date
    data['updated_at'] = date
    let embeddingText = JSON.stringify(data)
    let embedding = await this.app.openai.embeddings.create({
      model: this.embeddingModel,
      input: embeddingText,
      encoding_format: "float",
      user: params?.user?.googId || undefined
    });
    data['embedding'] = JSON.stringify(embedding?.data?.[0]?.embedding)
    console.log(data.embedding.length)

    let result = await this._create(data,params)
    return result
  }
}

export const getOptions = (app) => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('postgresqlClient'),
    name: 'uploads',
    embeddingModel: app.get('uploads')?.embeddingModel || "text-embedding-3-small",
    app,
    filters: {
      $search: true
    },
  }
}
