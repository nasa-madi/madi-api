// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'

// Main data model schema
export const chatSchema = Type.Object(
  {
    messages: Type.Array(
      Type.Object({
        role:Type.String(),
        content:Type.Union([Type.Null(), Type.String()])
      })),
    model: Type.Optional(Type.String()),
    frequency_penalty: Type.Optional(Type.Number()),
    logit_bias: Type.Optional(Type.Object({})),
    max_tokens: Type.Optional(Type.Integer()),
    n: Type.Optional(Type.Integer()),
    presence_penalty: Type.Optional(Type.Number()),
    response_format: Type.Optional(Type.Object({ type: Type.String() })),
    seed: Type.Optional(Type.Integer()),
    stop: Type.Optional(Type.Union([Type.String(), Type.Array(Type.String())])),
    stream: Type.Optional(Type.Boolean()),
    temperature: Type.Optional(Type.Number({ minimum: 0, maximum: 2 })),
    top_p: Type.Optional(Type.Number()),
    tools: Type.Optional(Type.Array(Type.Object({}))),
    tool_choice: Type.Optional(Type.Union([
      Type.Union([
        Type.Literal('auto'),
        Type.Literal('none'),
      ]),
      Type.Object({
        type: Type.Literal('function'),
        function: Type.Object({
          name: Type.String(),
        }, { required: ['name'] }),
      }),
    ]))
  },
  { $id: 'Chat', additionalProperties: false }
)
export const chatValidator = getValidator(chatSchema, dataValidator)
export const chatResolver = resolve({})
export const chatSchemaExamples = {
    chats_post_default: {
        messages: [
          {
              "role": "user",
              "content": "What's the weather like in San Francisco, Tokyo, and Paris?"
          }
        ]
    }
}

export const chatExternalResolver = resolve({})

// Schema for creating new entries
export const chatDataSchema = Type.Pick(chatSchema, [
  'messages',
  'model',
  'frequency_penalty',
  'logit_bias',
  'max_tokens', 
  'n', 
  'presence_penalty', 
  'response_format', 
  'seed', 
  'stop', 
  'stream', 
  'temperature', 
  'top_p',
  'tools',
  'tool_choice'
], {
  $id: 'ChatData'
})
export const chatDataValidator = getValidator(chatDataSchema, dataValidator)
export const chatDataResolver = resolve({})

// Schema for allowed query properties
export const chatQueryProperties = Type.Pick(chatSchema, [
  'messages',
  'model',
  'frequency_penalty',
  'logit_bias',
  'max_tokens', 
  'n', 
  'presence_penalty', 
  'response_format', 
  'seed', 
  'stop', 
  'stream', 
  'temperature', 
  'top_p',
  'tools',
  'tool_choice'
])
export const chatQuerySchema = Type.Intersect(
  [
    querySyntax(chatQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export const chatQueryValidator = getValidator(chatQuerySchema, queryValidator)
export const chatQueryResolver = resolve({})
