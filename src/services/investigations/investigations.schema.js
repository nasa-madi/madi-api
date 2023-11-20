// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'

// Main data model schema
export const investigationsSchema = Type.Object(
  {
    id: Type.Number(),
    text: Type.String()
  },
  { $id: 'Investigations', additionalProperties: false }
)
export const investigationsValidator = getValidator(investigationsSchema, dataValidator)
export const investigationsResolver = resolve({})

export const investigationsExternalResolver = resolve({})

// Schema for creating new entries
export const investigationsDataSchema = Type.Pick(investigationsSchema, ['text'], {
  $id: 'InvestigationsData'
})
export const investigationsDataValidator = getValidator(investigationsDataSchema, dataValidator)
export const investigationsDataResolver = resolve({})

// Schema for updating existing entries
export const investigationsPatchSchema = Type.Partial(investigationsSchema, {
  $id: 'InvestigationsPatch'
})
export const investigationsPatchValidator = getValidator(investigationsPatchSchema, dataValidator)
export const investigationsPatchResolver = resolve({})

// Schema for allowed query properties
export const investigationsQueryProperties = Type.Pick(investigationsSchema, ['id', 'text'])
export const investigationsQuerySchema = Type.Intersect(
  [
    querySyntax(investigationsQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export const investigationsQueryValidator = getValidator(investigationsQuerySchema, queryValidator)
export const investigationsQueryResolver = resolve({})
