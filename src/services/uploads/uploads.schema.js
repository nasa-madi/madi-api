// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'

// Main data model schema
export const uploadSchema = Type.Object(
  {
    id: Type.Number(), // Unique identifier for the metadata entry
    userId: Type.Optional(Type.String()), // User ID
    pluginId: Type.Optional(Type.String()), // Plugin ID
    fileId: Type.String(), // File ID
    filename: Type.String(), // Name of the file
    metadata: Type.Object({}, {additionalProperties:true}),
    embedding:  Type.Array(Type.Number()),
  },
  { $id: 'Uploads', additionalProperties: false }
)

export const uploadValidator = getValidator(uploadSchema, dataValidator)
export const uploadResolver = resolve({})

export const uploadExternalResolver = resolve({})

// Schema for creating new entries
export const uploadDataSchema = Type.Pick(uploadSchema, ['text'], {
  $id: 'UploadsData'
})
export const uploadDataValidator = getValidator(uploadDataSchema, dataValidator)
export const uploadDataResolver = resolve({})

// Schema for updating existing entries
export const uploadPatchSchema = Type.Partial(uploadSchema, {
  $id: 'UploadsPatch'
})
export const uploadPatchValidator = getValidator(uploadPatchSchema, dataValidator)
export const uploadPatchResolver = resolve({})

// Schema for allowed query properties
export const uploadQueryProperties = Type.Pick(uploadSchema, ['id', 'text'])
export const uploadQuerySchema = Type.Intersect(
  [
    querySyntax(uploadQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export const uploadQueryValidator = getValidator(uploadQuerySchema, queryValidator)
export const uploadQueryResolver = resolve({})
