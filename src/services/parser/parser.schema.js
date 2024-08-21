// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'

export const parserBlockSchema = Type.Recursive(This => Type.Object({
  tag: Type.String(), // The tag of the block (e.g., 'para', 'list_item', 'table', 'header')
  level: Type.Optional(Type.Number()), // Level of the block in the layout tree
  page_idx: Type.Number(), // Page index of the block
  block_idx: Type.Number(), // ID of the block as returned from the server
  top: Type.Optional(Type.Number()), // Top position of the block on the page
  left: Type.Optional(Type.Number()), // Left position of the block on the page
  sentences: Type.Optional(Type.Array(Type.String())), // List of sentences in the block
  children: Type.Optional(Type.Array(This)), // Immediate child blocks
  parent: Type.Optional(Type.Any()), // Parent block
  block_json: Type.Optional(Type.Any()), // JSON returned by the parser API

  // Not in docs
  bbox: Type.Optional(Type.Array(Type.Number())), // Bounding box of the block
  name: Type.Optional(Type.String()), // Name of the block
  

  block_class: Type.Optional(Type.String()), // Additional classification, if any
  level_chain: Type.Optional(Type.Array(Type.String())), // Chain of levels for nested structures
  list_type: Type.Optional(Type.String()), // Type of list, if applicable
  parent_chain: Type.Optional(Type.Array(This)), // Parent chain of the block
  parent_text: Type.Optional(Type.String()), // Text of the parent chain
  table_rows: Type.Optional(Type.Array(Type.Object({
    block_class: Type.Optional(Type.String()), // Block class for the row
    cells: Type.Optional(Type.Array(Type.Object({
      cell_value: Type.Union([Type.String(), This]), // Cell value or nested block

      // missing node??
    }))),
    col_spans: Type.Optional(Type.Array(Type.Number())), // Column spans for the row
    is_header: Type.Optional(Type.Boolean()), // Header flag
    is_header_group: Type.Optional(Type.Boolean()), // Header group flag
    is_table_end: Type.Optional(Type.Boolean()), // Table end flag
    is_table_start: Type.Optional(Type.Boolean()), // Table start flag
  }, { additionalProperties: false }))),
}, { additionalProperties: false }));

export const parserDataSchema = Type.Optional(Type.Object({
  return_dict:Type.Object({
    result: Type.Object({
      blocks: Type.Array(parserBlockSchema)
    })
  }),
  // status: Type.Optional(Type.Any())
}, { additionalProperties: false }));

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
