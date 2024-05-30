// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'

// Main data model schema
export const parserSchema = Type.Object(
  {
    id: Type.Number(),
    text: Type.String()
  },
  { $id: 'Parser', additionalProperties: false }
)
export const parserValidator = getValidator(parserSchema, dataValidator)
export const parserResolver = resolve({})

export const parserExternalResolver = resolve({})

// Schema for creating new entries
export const parserDataSchema = Type.Pick(parserSchema, ['text'], {
  $id: 'ParserData'
})
export const parserDataValidator = getValidator(parserDataSchema, dataValidator)
export const parserDataResolver = resolve({})

// Schema for updating existing entries
export const parserPatchSchema = Type.Partial(parserSchema, {
  $id: 'ParserPatch'
})
export const parserPatchValidator = getValidator(parserPatchSchema, dataValidator)
export const parserPatchResolver = resolve({})

// Schema for allowed query properties
export const parserQueryProperties = Type.Pick(parserSchema, ['id', 'text'])
export const parserQuerySchema = Type.Intersect(
  [
    querySyntax(parserQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export const parserQueryValidator = getValidator(parserQuerySchema, queryValidator)
export const parserQueryResolver = resolve({})
