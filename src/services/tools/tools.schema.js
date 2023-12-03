// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'

// Main data model schema
export const toolSchema = Type.Object(
  {
    tool_calls: Type.Array(
      Type.Object({
        id: Type.String(),
        type: Type.Union([Type.Literal('function')]),
        function: Type.Object({
          name: Type.String(),
          arguments: Type.Union([
            Type.String(),
            Type.Object({})
          ])
        })
      },{additionalProperties: false})
    )
  },
  { $id: 'Tool', additionalProperties: false},
)
export const toolValidator = getValidator(toolSchema, dataValidator)
export const toolResolver = resolve({})

export const toolExternalResolver = resolve({})

// Schema for creating new entries
export const toolDataSchema = Type.Pick(toolSchema, ['tool_calls'], {
  $id: 'ToolData'
})
export const toolDataValidator = getValidator(toolDataSchema, dataValidator)
export const toolDataResolver = resolve({})

// Schema for updating existing entries
export const toolPatchSchema = Type.Partial(toolSchema, {
  $id: 'ToolPatch'
})
export const toolPatchValidator = getValidator(toolPatchSchema, dataValidator)
export const toolPatchResolver = resolve({})

// Schema for allowed query properties
export const toolQueryProperties = Type.Pick(toolSchema, [])

export const toolQuerySchema = Type.Intersect(
  [
    querySyntax(toolQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)

export const toolQueryValidator = getValidator(toolQuerySchema, queryValidator)
export const toolQueryResolver = resolve({})

export const toolSchemaExamples = {    
  tools_post_default: {
    "id": "call_1",
    "type": "function",
    "function": {
        "name": "get_current_weather",
        "arguments": "{\"location\": \"San Francisco, CA\",\"unit\": \"celsius\"}"
    }
  },
  tools_post_array: [
      {
          "id": "call_1",
          "type": "function",
          "function": {
              "name": "get_current_weather",
              "arguments": "{\"location\": \"San Francisco, CA\",\"unit\": \"celsius\"}"
          }
      },
      {
          "id": "call_2",
          "type": "function",
          "function": {
              "name": "get_current_weather",
              "arguments": {
                  "location": "San Francisco, CA",
                  "unit": "celsius"
                  }
          }
      }
  ],
  tools_id_patch_default: null,
  tools_id_put_default: null,
  tools_id_delete_default: null
}
