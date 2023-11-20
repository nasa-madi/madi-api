// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'

// Main data model schema
export const madiSchema = Type.Object(
  {
    id: Type.Number(),
    text: Type.String()
  },
  { $id: 'Madi', additionalProperties: false }
)
export const madiValidator = getValidator(madiSchema, dataValidator)
export const madiResolver = resolve({})

export const madiExternalResolver = resolve({})

// Schema for creating new entries
export const madiDataSchema = Type.Pick(madiSchema, ['text'], {
  $id: 'MadiData'
})
export const madiDataValidator = getValidator(madiDataSchema, dataValidator)
export const madiDataResolver = resolve({})

// Schema for updating existing entries
export const madiPatchSchema = Type.Partial(madiSchema, {
  $id: 'MadiPatch'
})
export const madiPatchValidator = getValidator(madiPatchSchema, dataValidator)
export const madiPatchResolver = resolve({})

// Schema for allowed query properties
export const madiQueryProperties = Type.Pick(madiSchema, ['id', 'text'])
export const madiQuerySchema = Type.Intersect(
  [
    querySyntax(madiQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export const madiQueryValidator = getValidator(madiQuerySchema, queryValidator)
export const madiQueryResolver = resolve({})
