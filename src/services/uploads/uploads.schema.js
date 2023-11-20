// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'

// Main data model schema
export const uploadsSchema = Type.Object(
  {
    id: Type.Number(),
    text: Type.String()
  },
  { $id: 'Uploads', additionalProperties: false }
)
export const uploadsValidator = getValidator(uploadsSchema, dataValidator)
export const uploadsResolver = resolve({})

export const uploadsExternalResolver = resolve({})

// Schema for creating new entries
export const uploadsDataSchema = Type.Pick(uploadsSchema, ['text'], {
  $id: 'UploadsData'
})
export const uploadsDataValidator = getValidator(uploadsDataSchema, dataValidator)
export const uploadsDataResolver = resolve({})

// Schema for updating existing entries
export const uploadsPatchSchema = Type.Partial(uploadsSchema, {
  $id: 'UploadsPatch'
})
export const uploadsPatchValidator = getValidator(uploadsPatchSchema, dataValidator)
export const uploadsPatchResolver = resolve({})

// Schema for allowed query properties
export const uploadsQueryProperties = Type.Pick(uploadsSchema, ['id', 'text'])
export const uploadsQuerySchema = Type.Intersect(
  [
    querySyntax(uploadsQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export const uploadsQueryValidator = getValidator(uploadsQuerySchema, queryValidator)
export const uploadsQueryResolver = resolve({})
