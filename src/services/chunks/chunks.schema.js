// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'
import { BadRequest } from '@feathersjs/errors'
import { getIdFromText } from '../utils/getIdFromText.js'
import config from '@feathersjs/configuration'


const MAX_LENGTH = config()().chunks.maxLength



// Main data model schema
export const chunkSchema = Type.Object(
  {
    id: Type.Number(),
    hash: Type.String(),  //unique hash of the pageContent
    metadata: Type.Any(),  // JSON objects can be used here
    pageContent: Type.String({
      maxLength: MAX_LENGTH || 4000
    }),
    embedding:  Type.Array(Type.Number()), // Representing a vector as an array of numbers
    documentId:  Type.Optional(Type.Number()),
    documentIndex:  Type.Optional(Type.Number()), // order of the chunk in the final document
    toolName: Type.Optional(Type.String()), // The tool the created the specific chunk (if applicable)
    userId:  Type.Optional(Type.Number()), // The user that created the specific chunk (if applicable)
  },
  { $id: 'Chunk', additionalProperties: false }
)



export const chunkDataResolver = resolve({
  // converts the content into a hash
  hash: virtual(async(chunk,context)=>{
    let [data, params] = context.arguments
    return getIdFromText(data.pageContent + data.documentId + data.toolName )
  }),
  userId: virtual(async (chunk,context) => {
    let [data, params] = context.arguments
    // Populate the user associated via `userId`
    return params?.user?.id || null
  }),
})




// separated out so that we have access to the hash for prefiltering
export const chunkVectorResolver = resolve({
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




export const chunkValidator = getValidator(chunkSchema, dataValidator)
export const chunkResolver = resolve({

  /**
  * Adds the user and document information back in, but only if requested.  
  */
  // user: virtual(async (chunk, context) => {
  //   if(context?.params?.query?.$select?.includes('user')){
  //     // Populate the user associated via `userId`
  //     // TODO restrict this to only the current user or admins
  //     // if (params.user.admin){
  //       return context.app.service('users').get(chunk.userId)
  //     // }
  //   }else{
  //     return undefined
  //   }
  // }),
  // document: virtual(async (chunk, context) => {
  //   if(context?.params?.query?.$select?.includes('document')){
  //     // Populate the user associated via `userId`
  //     return context.app.service('documents').get(chunk.documentId).catch(e=>{})|| null
  //   }else{
  //     return undefined
  //   }
  // })
})

export const chunkExternalResolver = resolve({
  embedding: virtual(async(chunk,context)=>{
    if(!context?.params?.query?.$select?.includes('embedding')){
      return undefined  // this hides the embedding from the end user
    }
    return chunk.embedding
  })
})




// Schema for creating new entries
export const chunkDataSchema = Type.Partial( Type.Pick(chunkSchema,
    [ 'metadata', 'pageContent','documentId','documentIndex','toolName'] // prevents user from manually overriding generated fields
  ), {$id: 'ChunksData'})
export const chunkDataValidator = getValidator(chunkDataSchema, dataValidator)




// Schema for updating existing entries
export const chunkPatchSchema = Type.Partial(Type.Pick(chunkSchema, 
    [ 'metadata', 'pageContent','documentId','documentIndex','toolName'] // prevents user from manually overriding generated fields
  ),{$id: 'ChunksPatch'})
export const chunkPatchValidator = getValidator(chunkPatchSchema, dataValidator)
export const chunkPatchResolver = resolve({
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
export const chunkQueryProperties = Type.Pick(chunkSchema, ['id', 'hash', 'metadata', 'pageContent','documentId','documentIndex','toolName','embedding'])
export const chunkQuerySchema = Type.Intersect(
  [
    querySyntax(chunkQueryProperties),
    Type.Object({
        // TODO fix this so that $search is allowed on input but not required on output
        $search: Type.Optional(Type.String()) //added for vector search
      }, 
      { additionalProperties: true }
    )],
  { additionalProperties: true }
)
export const chunkQueryValidator = getValidator(chunkQuerySchema, queryValidator)
export const chunkQueryResolver = resolve({})
