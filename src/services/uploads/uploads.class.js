import { KnexService } from '@feathersjs/knex'

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class UploadService extends KnexService{

  constructor(options){
    super(options)
    this.app = options.app
    this.embeddingModel = options.embeddingModel
  }

  // async find(params){
  //   return []
  // }
  async create(data,params){
    let file = await this.app.services['blobs'].create({
      file: params.file,
      ...data
    },{...params, provider:'internal'})
    console.log(file)
    data['fileId'] = file.id
    data['pluginId'] = data.pluginId
    data['filename'] = file.name
    data['metadata'] = data.metadata || {}
    let embeddingText = JSON.stringify(data)
    let embedding = await this.app.openai.embeddings.create({
      model: this.embeddingModel,
      input: embeddingText,
      encoding_format: "float",
      user: params?.user?.googId || undefined
    });
    data['embedding'] = embedding

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
    app
  }
}
