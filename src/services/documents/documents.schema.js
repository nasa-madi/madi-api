// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'

// Main data model schema
export const documentSchema = Type.Object(
  {
    id: Type.Number(),
    text: Type.String()
  },
  { $id: 'Document', additionalProperties: false }
)
export const documentValidator = getValidator(documentSchema, dataValidator)
export const documentResolver = resolve({})

export const documentExternalResolver = resolve({})

// Schema for creating new entries
export const documentDataSchema = Type.Pick(documentSchema, ['text'], {
  $id: 'DocumentData'
})
export const documentDataValidator = getValidator(documentDataSchema, dataValidator)
export const documentDataResolver = resolve({})

// Schema for updating existing entries
export const documentPatchSchema = Type.Partial(documentSchema, {
  $id: 'DocumentPatch'
})
export const documentPatchValidator = getValidator(documentPatchSchema, dataValidator)
export const documentPatchResolver = resolve({})

// Schema for allowed query properties
export const documentQueryProperties = Type.Pick(documentSchema, ['id', 'text'])
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
