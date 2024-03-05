import { KnexService } from '@feathersjs/knex'
import pMap from 'p-map'



export class DocumentService extends KnexService {

  constructor(options) {
    super(options)
    this.options = options
  }

  async splitDoc(document){
    return document.content
  }


  async create(data, params){

    let newDoc = await this._create(data, params)
    
    let chunks = await this.splitDoc(newDoc)

    // uses pMap to limit concurrent chunks to 10.
    // TODO convert to a pubsub or queue
    const mapper = (c, index) => 
        this.options.chunks.create({
          pageContent: c,
          metadata: {},
          documentId: newDoc.id,
          documentIndex: index,
          toolName: data.toolName,
          userId: newDoc.userId
    });
      
    await pMap(chunks, mapper, {concurrency: 10});

  }

  async delete(id, params){

    // delete chunks

    // delete upload

    // run doc delete    

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
      let embedding = await this.options.chunks.fetchEmbedding(search)

      // Perform a LEFT JOIN on the 'chunks' table
      builder.leftJoin('chunks', `${name}.id`, 'chunks.documentId')
      
      let a = this.getModel()
      let b = this

      // Modify the select and order queries to use the 'chunks' table
      builder.select(this.getModel().cosineDistanceAs('chunks.embedding', embedding,'_distance'))
      builder.select(this.getModel().raw('distinct on (chunks.??) chunks.??', ['documentId', 'documentId']))
      builder.orderBy('chunks.documentId')
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


  // // TODO sync this up so that search is accessible via a custom path
  // async similaritySearchWithOffset(embedding, k, filter, offset=0){
  //     const embeddingString = `[${embedding.join(",")}]`;
  //     const _filter = filter ?? "{}";
  //     let documents = await this.knex
  //         .table(this.tableName)
  //         .select(this.knex.raw('*, embedding <=> ? as "_distance"',embeddingString))
  //         .whereJsonSupersetOf('metadata',_filter)
  //         .orderBy('_distance', 'asc')
  //         .limit(k)
  //         .offset(offset)

  //     const results = [];
  //     for (const doc of documents) {
  //         if (doc._distance != null && doc.pageContent != null) {
  //             const document = new KnexVectorStoreDocument(doc);
  //             document.id = doc.id;
  //             results.push([document, doc._distance]);
  //         }
  //     }
  //     return results;
  // }

  // TODO add a way for the metadata jsonb column to searched directly from the query params
  
}

export const getOptions = (app) => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('postgresqlClient'),
    name: 'documents',
    chunks: app.service('chunks')
  }
}
