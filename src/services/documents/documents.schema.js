// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'

// Main data model schema
export const documentsSchema = Type.Object(
  {
    id: Type.Number(),
    text: Type.String()
  },
  { $id: 'Documents', additionalProperties: false }
)
export const documentsValidator = getValidator(documentsSchema, dataValidator)
export const documentsResolver = resolve({})

export const documentsExternalResolver = resolve({})

// Schema for creating new entries
export const documentsDataSchema = Type.Pick(documentsSchema, ['text'], {
  $id: 'DocumentsData'
})
export const documentsDataValidator = getValidator(documentsDataSchema, dataValidator)
export const documentsDataResolver = resolve({})

// Schema for updating existing entries
export const documentsPatchSchema = Type.Partial(documentsSchema, {
  $id: 'DocumentsPatch'
})
export const documentsPatchValidator = getValidator(documentsPatchSchema, dataValidator)
export const documentsPatchResolver = resolve({})

// Schema for allowed query properties
export const documentsQueryProperties = Type.Pick(documentsSchema, ['id', 'text'])
export const documentsQuerySchema = Type.Intersect(
  [
    querySyntax(documentsQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export const documentsQueryValidator = getValidator(documentsQuerySchema, queryValidator)
export const documentsQueryResolver = resolve({})
