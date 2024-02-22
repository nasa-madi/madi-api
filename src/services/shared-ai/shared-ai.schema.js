// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'

// Main data model schema
export const sharedAiSchema = Type.Object(
  {
    id: Type.Number(),
    text: Type.String()
  },
  { $id: 'SharedAi', additionalProperties: false }
)
export const sharedAiValidator = getValidator(sharedAiSchema, dataValidator)
export const sharedAiResolver = resolve({})

export const sharedAiExternalResolver = resolve({})

// Schema for creating new entries
export const sharedAiDataSchema = Type.Pick(sharedAiSchema, ['text'], {
  $id: 'SharedAiData'
})
export const sharedAiDataValidator = getValidator(sharedAiDataSchema, dataValidator)
export const sharedAiDataResolver = resolve({})

// Schema for updating existing entries
export const sharedAiPatchSchema = Type.Partial(sharedAiSchema, {
  $id: 'SharedAiPatch'
})
export const sharedAiPatchValidator = getValidator(sharedAiPatchSchema, dataValidator)
export const sharedAiPatchResolver = resolve({})

// Schema for allowed query properties
export const sharedAiQueryProperties = Type.Pick(sharedAiSchema, ['id', 'text'])
export const sharedAiQuerySchema = Type.Intersect(
  [
    querySyntax(sharedAiQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export const sharedAiQueryValidator = getValidator(sharedAiQuerySchema, queryValidator)
export const sharedAiQueryResolver = resolve({})
