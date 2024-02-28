// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'
import { BadRequest } from '@feathersjs/errors'
// import { fetchEmbedding } from '../utils/fetchEmbedding.js'
import { getIdFromText } from '../utils/getIdFromText.js'
import config from 'config'

// Main data model schema
export const chunksSchema = Type.Object(
  {
    id: Type.Number(),
    hash: Type.String(),  //unique hash of the pageContent
    metadata: Type.Any(),  // JSON objects can be used here
    pageContent: Type.String({
      maxLength: config.get('chunks')?.maxLength || 4000
    }),
    embedding:  Type.Array(Type.Number()), // Representing a vector as an array of numbers
    documentId:  Type.Optional(Type.Number()),
    documentIndex:  Type.Optional(Type.Number()), // order of the chunk in the final document
    toolName: Type.Optional(Type.String()), // The tool the created the specific chunk (if applicable)
    userId:  Type.Optional(Type.Number()), // The user that created the specific chunk (if applicable)
  },
  { $id: 'Chunks', additionalProperties: false }
)



export const chunksDataResolver = resolve({
  // converts the content into a hash
  hash: virtual(async(chunk,context)=>{
    // let [data, params] = context.arguments
    return getIdFromText(chunk.pageContent)
  }),
  userId: virtual(async (chunk,context) => {
    let [data, params] = context.arguments
    // Populate the user associated via `userId`
    return params?.user?.id || null
  }),
})




// separated out so that we have access to the hash for prefiltering
export const chunksVectorResolver = resolve({
    // Converts the content in an embedding
    embedding: virtual(async(chunk,context)=>{
      // this is where you prefetch by the hash and see if you can get it
      // and prevents extra calls to the embedding api
      let result = await context.self.find({query:{hash:chunk.hash}})
      if(result?.total > 0 ){
        throw new BadRequest(`Hash ${chunk.hash} is not unique. Document already exists.`)
      }

      let embedding = await context.self.fetchEmbedding(chunk.pageContent)
      if (!embedding){
        throw new BadRequest('Embedding could not be generated')
      }
      return `[${embedding.join(",")}]`
    })
})




export const chunksValidator = getValidator(chunksSchema, dataValidator)
export const chunksResolver = resolve({

  /**
   * Adds the user and document information back in, but only if requested.  
   */
  user: virtual(async (chunk, context) => {
    if(context?.params?.query?.$select?.includes('user')){
      // Populate the user associated via `userId`
      // TODO restrict this to only the current user or admins
      // if (params.user.admin){
        return context.app.service('users').get(chunk.userId)
      // }
    }else{
      return undefined
    }
  }),
  document: virtual(async (chunk, context) => {
    if(context?.params?.query?.$select?.includes('document')){
      // Populate the user associated via `userId`
      return context.app.service('documents').get(chunk.documentId).catch(e=>{})|| null
    }else{
      return undefined
    }
  })
})
export const chunksExternalResolver = resolve({
  embedding: virtual(async(chunk,context)=>{
    if(!context?.params?.query?.$select?.includes('embedding')){
      return undefined  // this hides the embedding from the end user
    }
    return chunk.embedding
  })
})




// Schema for creating new entries
export const chunksDataSchema = Type.Partial( Type.Pick(chunksSchema,
    [ 'metadata', 'pageContent','documentId','documentIndex','toolName'] // prevents user from manually overriding generated fields
  ), {$id: 'ChunksData'})
export const chunksDataValidator = getValidator(chunksDataSchema, dataValidator)




// Schema for updating existing entries
export const chunksPatchSchema = Type.Partial(Type.Pick(chunksSchema, 
    [ 'metadata', 'pageContent','documentId','documentIndex','toolName'] // prevents user from manually overriding generated fields
  ),{$id: 'ChunksPatch'})
export const chunksPatchValidator = getValidator(chunksPatchSchema, dataValidator)
export const chunksPatchResolver = resolve({
  embedding: virtual(async(chunk,context)=>{
    if(chunk.pageContent){
      let embedding = await context.self.fetchEmbedding(chunk.pageContent)
      return `[${embedding.join(",")}]`
    }else{
      return undefined
    }
  }),
  hash: virtual(async(chunk,context)=>{
    if(chunk.pageContent){
      return getIdFromText(chunk.pageContent)
    }else{
      return undefined
    }
  })
})




// Schema for allowed query properties
export const chunksQueryProperties = Type.Pick(chunksSchema, ['id', 'hash', 'metadata','embedding'])
export const chunksQuerySchema = Type.Intersect(
  [
    querySyntax(chunksQueryProperties),
    Type.Object({
        // TODO fix this so that $search is allowed on input but not required on output
        $search: Type.Optional(Type.String()) //added for vector search
      }, 
      { additionalProperties: true }
    )],
  { additionalProperties: true }
)
export const chunksQueryValidator = getValidator(chunksQuerySchema, queryValidator)
export const chunksQueryResolver = resolve({})
