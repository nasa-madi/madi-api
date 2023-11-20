// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'

// Main data model schema
export const sourcesSchema = Type.Object(
  {
    id: Type.Number(),
    text: Type.String()
  },
  { $id: 'Sources', additionalProperties: false }
)
export const sourcesValidator = getValidator(sourcesSchema, dataValidator)
export const sourcesResolver = resolve({})

export const sourcesExternalResolver = resolve({})

// Schema for creating new entries
export const sourcesDataSchema = Type.Pick(sourcesSchema, ['text'], {
  $id: 'SourcesData'
})
export const sourcesDataValidator = getValidator(sourcesDataSchema, dataValidator)
export const sourcesDataResolver = resolve({})

// Schema for updating existing entries
export const sourcesPatchSchema = Type.Partial(sourcesSchema, {
  $id: 'SourcesPatch'
})
export const sourcesPatchValidator = getValidator(sourcesPatchSchema, dataValidator)
export const sourcesPatchResolver = resolve({})

// Schema for allowed query properties
export const sourcesQueryProperties = Type.Pick(sourcesSchema, ['id', 'text'])
export const sourcesQuerySchema = Type.Intersect(
  [
    querySyntax(sourcesQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export const sourcesQueryValidator = getValidator(sourcesQuerySchema, queryValidator)
export const sourcesQueryResolver = resolve({})
