// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'
import { getIdFromText } from '../utils/getIdFromText.js'
import { filterUnlessSelected } from '../utils/filterUnlessSelected.js'



export const documentSchema = Type.Object(
  {
    id: Type.Number(), // Unique identifier for the document
    hash: Type.String(), // Hash value of the document
    metadata: Type.Optional(Type.Object({
      authors: Type.Optional(Type.Array(Type.String())), // Authors of the paper
      title: Type.Optional(Type.String()), // The title of the source
      publicationDate: Type.Optional(Type.String()), // The date the source was published
      publisher: Type.Optional(Type.String()), // The publisher of the source
      journal: Type.Optional(Type.String()), // The journal in which the paper was published
      volume: Type.Optional(Type.String()), // The volume of the journal
      issue: Type.Optional(Type.String()), // The issue of the journal
      pages: Type.Optional(Type.String()), // The page numbers of the paper in the journal
      url: Type.Optional(Type.String()), // The URL of the source if available online
      doi: Type.Optional(Type.String()), // The DOI (Digital Object Identifier) of the source if available
      isbn: Type.Optional(Type.String()), // The ISBN (International Standard Book Number) for books
      issn: Type.Optional(Type.String()), // The ISSN (International Standard Serial Number) for journals
      keywords: Type.Optional(Type.Array(Type.String())), // Keywords related to the paper
      references: Type.Optional(Type.Array(Type.String())), // References cited in the paper
      isPeerReviewed: Type.Optional(Type.Boolean()), // Whether the paper has been peer-reviewed
      affiliation: Type.Optional(Type.String()), // Affiliation of the authors

      // Web Specific
      sourceDomain: Type.Optional(Type.String()), // domain of the source or publisher.  Included for easier filtering.
      headerImage: Type.Optional(Type.String()), // URL of the main image for the article if available
      images: Type.Optional(Type.Array(Type.String())), // Links to images referenced in the source material, if any.
 
      // MADI specific fields
      type: Type.Optional(Type.String()), // Type of the source e.g., Article, Video, Journal, etc.
      urlHash: Type.Optional(Type.String()), // The unique hash of the URL
      accessDate: Type.Optional(Type.String()), // Date the online source was accessed
      isArchived: Type.Optional(Type.Boolean()), // Whether the source has been archived
      archivedUrl: Type.Optional(Type.String()), // The URL of the archived version of the source

    },{ additionalProperties: true })),
    content: Type.Optional(Type.Union([Type.String(), Type.Null()])), // The content of the document in text format.
    parsedPath: Type.Optional(Type.Union([Type.String(), Type.Null()])), // The path to the parsed document
    uploadPath: Type.Optional(Type.Union([Type.String(), Type.Null()])), // filePath of the upload
    abstract: Type.Optional(Type.String()), // Shortened summary of the document. 
    plugin: Type.Optional(Type.String()), // The tool the created the specific chunk (if applicable)
    userId: Type.Optional(Type.Number()), // The user that created the specific chunk (if applicable)
  },
  { $id: 'Document', additionalProperties: false }
)


export const documentValidator = getValidator(documentSchema, dataValidator)
export const documentResolver = resolve({})
export const documentExternalResolver = resolve({
  embedding: filterUnlessSelected('embedding'),
  content: filterUnlessSelected('content'),
})



// Schema for creating new entries
export const documentDataSchema = Type.Partial(documentSchema, { $id: 'DocumentData' })
export const documentDataValidator = getValidator(documentDataSchema, dataValidator)
export const documentDataResolver = resolve({
  // converts the content into a hash
  hash: virtual(async(entity,context)=>{
    let [data, params] = context.arguments
    if(data.uploadPath){
      return getIdFromText(data.uploadPath)
    }else{
      return getIdFromText(data.content)
    }
  }),
  userId: virtual(async (chunk,context) => {
    let [data, params] = context.arguments
    // Populate the user associated via `userId`
    return params?.user?.id || null
  }),
})



// Schema for updating existing entries
export const documentPatchSchema = Type.Omit(Type.Partial(documentSchema, {$id: 'DocumentPatch'}),'content') // can't patch the content field
export const documentPatchValidator = getValidator(documentPatchSchema, dataValidator)
export const documentPatchResolver = resolve({})


// Schema for allowed query properties
export const documentQueryProperties = Type.Pick(documentSchema, ['id', 'hash', 'metadata','userId','abstract','plugin','uploadPath','content'])
export const documentQuerySchema = Type.Intersect(
  [
    querySyntax(documentQueryProperties),
    // Add additional query properties here
    Type.Object({
      // TODO fix this so that $search is allowed on input but not required on output
      $search: Type.Optional(Type.String()) //added for vector search
    }, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export const documentQueryValidator = getValidator(documentQuerySchema, queryValidator)
export const documentQueryResolver = resolve({})
