// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'
import { fetchEmbedding } from '../utils/fetchEmbedding.js'
import { getIdFromText } from '../utils/getIdFromText.js'
import { BadRequest } from '@feathersjs/errors'

export const documentSchema = Type.Object(
  {
    id: Type.Number(),
    hash: Type.String(),
    metadata: Type.Any(),  // JSON objects can be used here
    pageContent: Type.String(),
    embedding: Type.Array(Type.Number()), // Representing a vector as an array of numbers
  },
  { $id: 'Document', additionalProperties: false }
)


export const documentValidator = getValidator(documentSchema, dataValidator)
export const documentResolver = resolve({})
export const documentExternalResolver = resolve({})

// Schema for creating new entries
export const documentDataSchema = Type.Partial(documentSchema, {
  $id: 'DocumentData'
})
export const documentDataValidator = getValidator(documentDataSchema, dataValidator)

export const documentDataResolver = resolve({
  // converts the content into a hash
  hash: virtual(async(user,context)=>{
    let [data, params] = context.arguments
    return getIdFromText(data.pageContent)
  })
})


// separated out so that we have access to the hash for prefiltering
export const documentVectorResolver = resolve({
    // Converts the content in an embedding
    embedding: virtual(async(user,context)=>{
      let [data, params] = context.arguments

      // this is where you prefetch by the hash and see if you can get it
      // and prevents extra calls to the embedding api
      let result = await context.self.find({query:{hash:data.hash}})
      if(result?.total > 0 ){
        throw new BadRequest(`Hash ${data.hash} is not unique. Document already exists.`)
      }

      let embedding = await fetchEmbedding(data.pageContent)
      return `[${embedding.join(",")}]`
    }),
})

// Schema for updating existing entries
export const documentPatchSchema = Type.Partial(documentSchema, {
  $id: 'DocumentPatch'
})
export const documentPatchValidator = getValidator(documentPatchSchema, dataValidator)
export const documentPatchResolver = resolve({})

// Schema for allowed query properties
export const documentQueryProperties = Type.Pick(documentSchema, ['id', 'hash', 'metadata'])
export const documentQuerySchema = Type.Intersect(
  [
    querySyntax(documentQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export const documentQueryValidator = getValidator(documentQuerySchema, queryValidator)
export const documentQueryResolver = resolve({})
