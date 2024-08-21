// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'

// Main data model schema
export const pipelinesSchema = Type.Object(
  {
    id: Type.String(),
    name: Type.Number(), 
    description: Type.String(),
    schema: Type.Optional(Type.Object({},{additionalProperties: true})),
  },
  { $id: 'Pipelines', additionalProperties: false }
)
export const pipelinesValidator = getValidator(pipelinesSchema, dataValidator)
export const pipelinesResolver = resolve({})

export const pipelinesExternalResolver = resolve({})

// Schema for creating new entries
export const pipelinesDataSchema = Type.Pick(pipelinesSchema, ['text'], {
  $id: 'PipelinesData'
})
export const pipelinesDataValidator = getValidator(pipelinesDataSchema, dataValidator)
export const pipelinesDataResolver = resolve({})

// Schema for updating existing entries
export const pipelinesPatchSchema = Type.Partial(pipelinesSchema, {
  $id: 'PipelinesPatch'
})
export const pipelinesPatchValidator = getValidator(pipelinesPatchSchema, dataValidator)
export const pipelinesPatchResolver = resolve({})

// Schema for allowed query properties
export const pipelinesQueryProperties = Type.Pick(pipelinesSchema, ['id', 'text'])
export const pipelinesQuerySchema = Type.Intersect(
  [
    querySyntax(pipelinesQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export const pipelinesQueryValidator = getValidator(pipelinesQuerySchema, queryValidator)
export const pipelinesQueryResolver = resolve({})
