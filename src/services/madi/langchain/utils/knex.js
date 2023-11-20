// import { DataSource, EntitySchema } from "typeorm";
import knex from 'knex';

import * as dotenv from 'dotenv'
dotenv.config()
import { VectorStore } from "langchain/vectorstores/base";
import { Document } from "langchain/document";


export const defaultSchema = (table)=>{
    table.specificType('embedding','vector')
    table.jsonb('metadata')
    table.text('pageContent')
    table.uuid('id')
}


export class KnexVectorStoreDocument extends Document {
    id;
    embedding;
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "embedding", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
 
    }
}
const defaultDocumentTableName = "documents";

export class KnexVectorStore extends VectorStore {
    constructor(embeddings, fields) {
        super(embeddings, fields);
        Object.defineProperty(this, "tableName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "upsert", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void false
        });
        Object.defineProperty(this, "conflictColumn", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void "id"
        });
        Object.defineProperty(this, "documentEntity", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "filter", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "appDataSource", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_verbose", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "schema", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "columnInfo", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.tableName = fields.tableName || defaultDocumentTableName;
        this.filter = fields.filter;
        this.conflictColumn = fields.conflictColumn ?? this.conflictColumn
        this.upsert = fields.upsert ?? this.upsert
        this.schema = fields.schema ?? defaultSchema
        this.columnInfo = {}
        // @ts-ignore
        this.knex = knex({
            client: 'pg',
            ...fields.connectionOptions
        })
    }
    filterColumns(item){
        let allowedKeys = Object.keys(this.columnInfo)
        return Object.fromEntries(Object.entries(item).filter(([key, value]) => allowedKeys.includes(key)));
    }
    static async fromDataSource(embeddings, fields) {
        const postgresqlVectorStore = new this(embeddings, fields);
        return postgresqlVectorStore;
    }
    async addDocuments(documents) {
        const texts = documents.map(({ pageContent }) => pageContent);
        // This will create the table if it does not exist. We can call it every time as it doesn't
        // do anything if the table already exists, and it is not expensive in terms of performance
        await this.ensureTableInDatabase();
        return this.addVectors(await this.embeddings.embedDocuments(texts), documents);
    }
    async addVectors(vectors, documents) {
        const rows = vectors.map((embedding, idx) => {
            const embeddingString = `[${embedding.join(",")}]`;
            const documentRow = {
                pageContent: documents[idx].pageContent,
                embedding: embeddingString,
                metadata: documents[idx].metadata,
            };
            return documentRow;
        });
        const chunkSize = 500;
        for (let i = 0; i < rows.length; i += chunkSize) {
            const chunk = rows.slice(i, i + chunkSize);
            try {
               return this.knex.into(this.tableName).insert(chunk)
            }
            catch (e) {
                console.error(e);
                throw new Error(`Error inserting: ${chunk[0].pageContent}`);
            }
        }
    }

    /**
     * 
     * @param {number[]} query 
     * @param {number} k 
     * @param {object} [filter]
     * @returns {Promise<[Document, number][]>}
     */
    async similaritySearchVectorWithScore(query, k, filter) {
        const embeddingString = `[${query.join(",")}]`;
        const _filter = filter ?? "{}";
        let documents = await this.knex
            .table(this.tableName)
            .select(this.knex.raw('*, embedding <=> ? as "_distance"',embeddingString))
            .whereJsonSupersetOf('metadata',_filter)
            .orderBy('_distance', 'asc')
            .limit(k)
            // .offset(offset)

        const results = [];
        for (const doc of documents) {
            if (doc._distance != null && doc.pageContent != null) {
                const document = new KnexVectorStoreDocument(doc);
                document.id = doc.id;
                results.push([document, doc._distance]);
            }
        }
        // @ts-ignore
        return results;
    }
    async ensureExtensionsEnabled(){
        await this.knex.raw("CREATE EXTENSION IF NOT EXISTS vector;");
        await this.knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    }
    async ensureTableInDatabase() {
        this.ensureExtensionsEnabled()
        await this.knex.schema.hasTable(this.tableName).then(async (exists)=>{
            if(!exists){
                return this.knex.schema.createTable(this.tableName,this.schema)
            }
        })
        this.columnInfo = await this.knex(this.tableName).columnInfo();

    }
    static async fromTexts(texts, metadatas, embeddings, dbConfig) {
        const docs = [];
        for (let i = 0; i < texts.length; i += 1) {
            const metadata = Array.isArray(metadatas) ? metadatas[i] : metadatas;
            const newDoc = new Document({
                pageContent: texts[i],
                metadata,
            });
            docs.push(newDoc);
        }
        return KnexVectorStore.fromDocuments(docs, embeddings, dbConfig);
    }
    static async fromDocuments(docs, embeddings, dbConfig) {
        const instance = await KnexVectorStore.fromDataSource(embeddings, dbConfig);
        await instance.addDocuments(docs);
        return instance;
    }
    static async fromExistingIndex(embeddings, dbConfig) {
        const instance = await KnexVectorStore.fromDataSource(embeddings, dbConfig);
        return instance;
    }
}




// export const run = async () => {
//     
  
//     await knexVectorStore.ensureTableInDatabase();
  
//     let added = await knexVectorStore.addDocuments([
//       { pageContent: "what's this", metadata: { a: 2 } },
//       { pageContent: "Cat drinks milk", metadata: { a: 1 } },
//     ]);
// //   
//     // const results = await knexVectorStore.similaritySearch("cat", 2,{a:1});
  
//     // console.log(results);
// };

// run()