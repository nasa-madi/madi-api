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

    /**
     * fetchEmbedding - Fetches the embedding from the AI service of your choice
     * @param {string} input The string you want to convert into an embedding
     * @param {object} options Any additional options needed to be passed to the function to correctly fetch the embedding
     * @returns {Float32Array} The embedding as an array of floats
     */
    async fetchEmbedding (input, options){
        throw new Error('The fetchEmbedding function must be overwritten for this to function.')
    }
    

    async _find(params){
      const { filters, paginate } = this.filterQuery(params);
      const { name, id='id' } = this.getOptions(params);
      let search = null
      let distanceDirection = 'asc'
  
      if(params?.query?.$search){
        search = params?.query?.$search;
        delete params.query.$search
        if(params?.query?.$direction){
            distanceDirection = params.query.$direction === 'desc' ? 'desc' : 'asc';
        }
      }
      const builder = params.knex ? params.knex.clone() : this.createQuery(params);
      if(search){
        let embedding = await this.fetchEmbedding(search)
        builder.select(this.getModel().cosineDistanceAs('embedding', embedding,'_distance'))
        builder.orderBy('_distance',distanceDirection)
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
  
