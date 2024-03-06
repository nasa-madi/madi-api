import { KnexService } from '@feathersjs/knex'
import pMap from 'p-map'
import {
  SupportedTextSplitterLanguages,
  RecursiveCharacterTextSplitter,
} from "langchain/text_splitter";
import config from '@feathersjs/configuration'

const OVERLAP = config()().chunks.overlap || 200
const SIZE = config()().chunks.size || 2000


export class DocumentService extends KnexService {

  constructor(options) {
    super(options)
    this.options = options
    
  }

  async splitDoc(document){
    const splitter = RecursiveCharacterTextSplitter.fromLanguage("markdown", {
      chunkSize: SIZE,
      chunkOverlap: OVERLAP
    });
    return splitter.createDocuments([document.content]);
    
  }


  async create(data, params){

    let newDoc = await this._create(data, params)
    
    try{
      let chunks = await this.splitDoc(newDoc)

      // uses pMap to limit concurrent chunks to 10.
      // TODO convert to a pubsub or queue
      const mapper = (c, index) => 
          this.options.chunks.create({
            pageContent: c.pageContent,
            metadata: c.metadata,
            documentId: newDoc.id,
            documentIndex: index,
            toolName: data.toolName,
      }, {...params, provider:'internal'});
        
      await pMap(chunks, mapper, {concurrency: 10});
    }catch(e){
      await this.remove(newDoc.id)
      throw e
    }
    return newDoc
  }


  async remove(id, params) {
    // Delete all chunks where 'documentId' is equal to 'id'
    await this.options.chunks.getModel().from('chunks').where('documentId', id).del();

    // Remove the document
    let newDoc = await this._remove(id, params);

    return newDoc;
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

    // TODO This should be pulled out as a separate RAG service on the /search endpoint. But this is a placeholder for now.
    if (search) {
        let embedding = await this.options.chunks.fetchEmbedding(search);

        // takes the cosine distance of the nearest doucment chunk as representative of the document's value
        const subquery = this.options.chunks
          .getModel()
          .from('chunks')
          .select(
            this.getModel().raw('json_build_object(\'pageContent\', "chunks"."pageContent", \'metadata\', "chunks"."metadata") as chunk'),
            "documentId",
            this.getModel().cosineDistanceAs('embedding', embedding, '_distance')
          )
          .distinctOn('chunks.documentId')
          .orderBy(['chunks.documentId', '_distance']);

        //TODO Build an AVERAGE chunk distance or a MEDIAN chunk distance or a TOP 10% chunk distance (Avg of window)

        builder.select('documents.*','sub._distance', 'sub.chunk').leftJoin(subquery.as('sub'), 'documents.id', 'sub.documentId')
        builder.orderBy('_distance', distanceDirection);
    }

    const countBuilder = builder
        .clone()
        .clearSelect()
        .clearOrder()
        .count(`${name}.${id} as total`);
    
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

    //TODO Swallows an error here.  Needs to bubble up appropriately.
    const data = filters.$limit === 0 ? [] : await builder.catch(e=>{console.log(e)});
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
    id: 'id',
    chunks: app.service('chunks')
  }
}
