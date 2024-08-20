import { KnexService } from '@feathersjs/knex'
import pMap from 'p-map'
import { SbdSplitter } from 'sbd-splitter';

import config from '@feathersjs/configuration'

const SIZE = config()().chunks.size || 2000

export class DocumentService extends KnexService {

  constructor(options) {
    super(options)
    this.options = options

  }

  async splitDoc(document){
    const splitter = new SbdSplitter({
      chunkSize: SIZE,
      softMaxChunkSize: 3000,
      delimiters: [
          '\n# ',
          '\n## ',
          '\n### ',
          '\n#### ',
          '\n##### ',
          '\n###### ',
          '```\n\n',
          '\n\n***\n\n',
          '\n\n---\n\n',
          '\n\n___\n\n',
          '\n\n',
          '\n',
          '&#&#&#',
          ' ',
          ''
      ]
    });
    let result = await splitter.splitText(document)    
    return result.map((r, i) => {
      return {
        pageContent: r,
        metadata: {
          loc: {lines: {from: i, to: i}},
          chunkIndex: i,
          chunkSize: r.length,
        }
      }
    })
  }


  async create(data, params){

    let newDoc = await this._create(data, params)
    
    // allows raw content to be passed in when uploadPath is being used instead of content
    let content = params.rawContent || data.content
    
    try{
      let chunks = await this.splitDoc(content)

      // uses pMap to limit concurrent chunks to 10.
      // TODO convert to a pubsub or queue
      const mapper = (c, index) => {
          console.log('chunk',c)
          return this.options.chunks.create({
            pageContent: c.pageContent,
            metadata: c.metadata,
            documentId: newDoc.id,
            documentIndex: index,
            plugin: newDoc.plugin || undefined,
      }, {...params, provider:'internal'});
    }
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

    const _filter = params?.query?.metadata || {}
    delete params.query.metadata


    if(params?.query?.$search){
      search = params?.query?.$search;
      delete params.query.$search
      if(params?.query?.$direction){
          distanceDirection = params.query.$direction === 'desc' ? 'desc' : 'asc';
      }
    }


    const builder = params.knex ? params.knex.clone() : this.createQuery(params);

    // TODO Needs a better filter.  Numeric values like 2, become string '2' which prevents the _filter from work on numeric values. This is resolved with the custom decoder with koa-qs in src/app.js
    if(_filter){
      builder.whereJsonSupersetOf('metadata',_filter)
    }
    // console.log(builder.toSQL())

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

        builder.select('documents.*','sub._distance', 'sub.chunk')
        builder.leftJoin(subquery.as('sub'), 'documents.id', 'sub.documentId')
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
