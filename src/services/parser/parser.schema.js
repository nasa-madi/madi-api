// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'

export const parserBlockSchema = Type.Recursive(This=>Type.Object({
  tag: Type.String(),
  block_class: Type.Optional(Type.String()),
  sentences: Type.Optional(Type.Array(Type.String())),
  children: Type.Optional(Type.Array(This)),
  table_rows: Type.Optional(Type.Array(Type.Object({
    block_class: Type.Optional(Type.String()),
    cells: Type.Optional(Type.Array(Type.Object({
      cell_value: Type.Union([
        Type.String(),
        This
      ])
    })))
  })))
}, { additionalProperties: false }));

export const parserDataSchema = Type.Object({
  return_dict: Type.Object({
    result: Type.Object({
      blocks: Type.Array(parserBlockSchema)
    })
  })
}, { additionalProperties: false });


// Schema for submitted json
export const parserDataValidator = getValidator(parserDataSchema, dataValidator)


// Schema for allowed query properties
export const parserQuerySchema = Type.Object({
    applyOcr: Type.Optional(Type.Union([Type.Literal('yes'), Type.Literal('no')], { default: 'no' })),
    format: Type.Optional(Type.Union([
        Type.Literal('html'),
        Type.Literal('markdown'),
        Type.Literal('chunks'),
        Type.Literal('json')
    ], { default: 'json' }))
}, { additionalProperties: false })
export const parserQueryValidator = getValidator(parserQuerySchema, queryValidator)
export const parserQueryResolver = resolve({})
