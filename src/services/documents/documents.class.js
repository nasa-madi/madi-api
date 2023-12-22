import { KnexService } from '@feathersjs/knex'

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class DocumentService extends KnexService {

  // TODO sync this up so that search is accessible via a custom path
  async similaritySearchWithOffset(embedding, k, filter, offset=0){
      const embeddingString = `[${embedding.join(",")}]`;
      const _filter = filter ?? "{}";
      let documents = await this.knex
          .table(this.tableName)
          .select(this.knex.raw('*, embedding <=> ? as "_distance"',embeddingString))
          .whereJsonSupersetOf('metadata',_filter)
          .orderBy('_distance', 'asc')
          .limit(k)
          .offset(offset)

      const results = [];
      for (const doc of documents) {
          if (doc._distance != null && doc.pageContent != null) {
              const document = new KnexVectorStoreDocument(doc);
              document.id = doc.id;
              results.push([document, doc._distance]);
          }
      }
      return results;
  }

  // TODO add a way for the metadata jsonb column to searched directly from the query params
  
}

export const getOptions = (app) => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('postgresqlClient'),
    name: 'documents'
  }
}
