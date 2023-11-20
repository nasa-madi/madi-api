// import { DataSource, EntitySchema } from "typeorm";
import * as knexPkg from 'knex';
const { knex } = knexPkg.default; // workaround for typescript compatability 

import * as dotenv from 'dotenv'
dotenv.config()
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { KnexVectorStore, KnexVectorStoreDocument } from '../utils/knex.js';
import { getIdFromText, normalizeUrl } from '../utils/text.js';
import { parseBoolean } from '../utils/boolean.js';

class TagCustomStore extends KnexVectorStore{
    constructor(embeddings, fields){
        super(embeddings, fields)
        this.hashFunc = fields.hashFunc ?? null
        this.hashField = fields.hashField ?? null
        this.embeddingText = fields.embeddingText ?? null
    }
    
    static async fromDataSource(embeddings, fields){
        const postgresqlVectorStore = new TagCustomStore(embeddings, fields);
        return postgresqlVectorStore;
    }

    async ensureTableInDatabase() {
        await super.ensureTableInDatabase()
        // additionally creates hash checks
        // await this.knex.raw(`CREATE UNIQUE INDEX IF NOT EXISTS hash_unique ON ${this.tableName}( (metadata->>'hash') ) ;`)
        // stores schema information in object format for use later;
        this.columnInfo = await this.knex(this.tableName).columnInfo();
    }

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
                let response
                if(this.upsert && this.conflictColumn){
                    response = await this.knex
                        .insert(chunk)
                        .into(this.tableName)
                        .onConflict(this.knex.raw(`(("metadata"->>'hash'))`))
                        .ignore()
                }  else{
                    response = await this.knex.insert(chunk).into(this.tableName)
                }
                return response
            }
            catch (e) {
                console.error(e);
                throw new Error(`Error inserting: ${chunk[0].pageContent}`);
            }
        }
    }
    
    async find(filter, limit=10, select="*", offset=0){
        return this.knex
            .table(this.tableName)
            .select(select)
            .where(filter)
            .limit(limit)
            .offset(offset)

    }

    async patch(id, data, params={}){
        const { select = '*' } = params;
        data = this.filterColumns(data)
        return this.knex
            .table(this.tableName)
            .where({id})
            .update(data, select)
    }

    async create(items){ // 
        let allowedKeys = Object.keys(this.columnInfo)
        if(!Array.isArray(items)){
            items = [items]
        }
        items = items.map(item=>{
            item = Object.fromEntries(Object.entries(item).filter(([key, value]) => allowedKeys.includes(key)));
            item = this.hashFunc(item, true)
            return item
        })

        let texts = items.map(this.embeddingText)
        let embeddings = await this.embeddings.embedDocuments(texts)

        items = items.map((item,i)=>{
            item.embedding = `[${embeddings[i].join(",")}]`;
            return item
        })

        return this.knex
            .insert(items,'*')
            .into(this.tableName)
            .onConflict(this.hashField)
            .ignore()
    }

    async createOrRetrieveCallback(item, preCreateCallback){

        // normalize and hash the url
        let hash = this.hashFunc(item, false)

        let response = await this.find({[this.hashField]:hash})

        // if source doesn't exist in the DB
        if(response.length === 0){
            response = preCreateCallback ? await preCreateCallback(item) : response
            return this.create(response)
        }
        return response
    }
}


const args = {
      upsert:true,
      tableName: "tags",
      connectionOptions: {
        migrations: {
            tableName: 'migrations'
        },
        // acquireConnectionTimeout: 10000,
        // pool: { min: 0, max:7 },
        debug: parseBoolean(process.env.VERBOSE),
        // type: "postgres",
        connection:{
            host: process.env.POSTGRES_HOST,
            port: parseInt(process.env.POSTGRES_PORT),
            user: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            database: process.env.POSTGRES_DB
        }
      },
      schema: (table)=>{
            table.uuid('id').primary().defaultTo(knex({client: 'pg' }).raw('uuid_generate_v4()'))
            table.string('name')
            table.string('parent')
            table.string('hash').unique()
            table.enu('type',['need','category','subcategory','ility','investigation'])
            table.text('description')
            table.jsonb('metadata')
            table.text('pageContent')
            table.specificType('embedding','vector')
       },
       hashField: 'hash',
       hashFunc: (item, returnItem=false)=>{
         let hash = getIdFromText(item.name+"_"+item.parent+"_"+item.type)
         return returnItem ? {...item, hash}: hash
       },
       embeddingText: (item, returnItem)=>{
        let text = `NAME:${item.name}\n\nPARENT:${item.parent}\n\nTYPE:${item.type}\n\n${item.description}`.slice(0,6000)
        let endPoint = text.lastIndexOf('.')
        return text.slice(0,endPoint>0? endPoint : 6000) //keeps last token as a real word
       }
    }
    
let store = TagCustomStore.fromDataSource(
    new OpenAIEmbeddings(),
    args
);
export const TagStore  = async ()=>{
    let ready = await store;
    await ready.ensureTableInDatabase()
    return ready
}