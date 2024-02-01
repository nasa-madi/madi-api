// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'

// Main data model schema
export const blobSchema = Type.Object(
  {
    id: Type.Number(),
    text: Type.String()
  },
  { $id: 'Blobs', additionalProperties: false }
)
export const blobValidator = getValidator(blobSchema, dataValidator)
export const blobResolver = resolve({})

export const blobExternalResolver = resolve({})

// Schema for creating new entries
export const blobDataSchema = Type.Pick(blobSchema, ['text'], {
  $id: 'BlobsData'
})
export const blobDataValidator = getValidator(blobDataSchema, dataValidator)
export const blobDataResolver = resolve({})

// Schema for updating existing entries
export const blobPatchSchema = Type.Partial(blobSchema, {
  $id: 'BlobsPatch'
})
export const blobPatchValidator = getValidator(blobPatchSchema, dataValidator)
export const blobPatchResolver = resolve({})

// Schema for allowed query properties
export const blobQueryProperties = Type.Pick(blobSchema, ['id', 'text'])
export const blobQuerySchema = Type.Intersect(
  [
    querySyntax(blobQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: true })
  ],
  { additionalProperties: false }
)
export const blobQueryValidator = getValidator(blobQuerySchema, queryValidator)
export const blobQueryResolver = resolve({})
