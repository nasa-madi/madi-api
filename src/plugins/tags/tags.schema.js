// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'

// Main data model schema
export const tagsSchema = Type.Object(
  {
    id: Type.Number(),
    text: Type.String()
  },
  { $id: 'Tags', additionalProperties: false }
)
export const tagsValidator = getValidator(tagsSchema, dataValidator)
export const tagsResolver = resolve({})

export const tagsExternalResolver = resolve({})

// Schema for creating new entries
export const tagsDataSchema = Type.Pick(tagsSchema, ['text'], {
  $id: 'TagsData'
})
export const tagsDataValidator = getValidator(tagsDataSchema, dataValidator)
export const tagsDataResolver = resolve({})

// Schema for updating existing entries
export const tagsPatchSchema = Type.Partial(tagsSchema, {
  $id: 'TagsPatch'
})
export const tagsPatchValidator = getValidator(tagsPatchSchema, dataValidator)
export const tagsPatchResolver = resolve({})

// Schema for allowed query properties
export const tagsQueryProperties = Type.Pick(tagsSchema, ['id', 'text'])
export const tagsQuerySchema = Type.Intersect(
  [
    querySyntax(tagsQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export const tagsQueryValidator = getValidator(tagsQuerySchema, queryValidator)
export const tagsQueryResolver = resolve({})
