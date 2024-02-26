import { KnexService } from '@feathersjs/knex'


// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class EmbeddingKnexService extends KnexService {

    constructor(options){
        super({
            filters: {
                $search: true
            },
            ...options
        })
    }

    async fetchEmbedding (text, model){
        const embedding = await this.app.openai.embeddings.create({
            model: model || "text-embedding-ada-002",
            input: text,
            encoding_format: "float",
        });
        return embedding?.data?.[0]?.embedding
    }

    async _find(params){
      const { filters, paginate } = this.filterQuery(params);
      const { name, id } = this.getOptions(params);
      let search = null
  
      if(params?.query?.$search){
        search = params?.query?.$search;
        delete params.query.$search
      }
      const builder = params.knex ? params.knex.clone() : this.createQuery(params);
      if(search){
        let embedding = await this.fetchEmbedding(search, this.embeddingModel)
        builder.select(this.getModel().cosineDistanceAs('embedding', embedding,'_distance'))
        builder.orderBy('_distance','asc')
      }
  
      const countBuilder = builder.clone().clearSelect().clearOrder().count(`${name}.${id} as total`);
      
      // Handle $limit
      if (filters.$limit) {
          builder.limit(filters.$limit);
      }
      // Handle $skip
      if (filters.$skip) {
          builder.offset(filters.$skip);
      }
      // provide default sorting if its not set
      if (!filters.$sort && !search && builder.client.driverName === 'mssql') {
          builder.orderBy(`${name}.${id}`, 'asc');
      }
  
      const data = filters.$limit === 0 ? [] : await builder.catch(e=>{});
      if (paginate && paginate.default) {
          const total = await countBuilder.then((count) => parseInt(count[0] ? count[0].total : 0));
          return {
              total,
              limit: filters.$limit,
              skip: filters.$skip || 0,
              data
          };
      }
      return data;
    }
  
}
  
