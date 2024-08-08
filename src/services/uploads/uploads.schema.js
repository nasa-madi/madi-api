// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'

// Main data model schema
export const uploadSchema = Type.Object(
  {

    filePath: Type.String(), // inclusive of name, prefix

    url: Type.String(), // URL of the file
    signedUrl: Type.String(), // Signed URL of the file
    
    metadata: Type.Object({

      // Original metadata
      systemMetadata: Type.Object({
        hash: Type.Optional(Type.String()), // Hash of the file exclusive of filename
        originalName: Type.String(), // Original name of the file
        userId: Type.Optional(Type.String()), // User ID
        pluginId: Type.Optional(Type.String()), // Plugin ID
      }),
      
      // Additional metadata
      sourceMetadata: Type.Optional(Type.Object({
      },{additionalProperties:true})),

    }, {additionalProperties:false}),
  
  },
  { $id: 'Uploads', additionalProperties: false }
)
