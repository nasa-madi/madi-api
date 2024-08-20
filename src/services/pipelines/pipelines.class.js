import { UploadParseChunkPipeline } from "./upload-parse-chunk.pipeline.js"


const Pipelines = [
  {
    id: '0',
    name: 'Test Pipeline',
    description: 'This is a test pipeline',
    schema: {}
  },
  {
    id: 'upload-parse-chunk',
    name: 'Upload Parse Chunk',
    description: 'Takes a file upload, parses it, stores the result as a document reference and breaks the document into vectorized chunks for search.\n Requires a form-data field named "file" with the uploaded asset.',
    // schema: `{
    //   formData:{
    //     file: {
    //       type: 'file',
    //       required: true
    //     }
    //     <additional fields>:{
    //       ... stored as metadata along side file and document reference
    //     }
    //   }
    // }`,
    // returnSchema: 'Document',
    function: UploadParseChunkPipeline
  }
]




export class PipelinesService {
  constructor(options) {
    this.options = options
    this.app = options.app
  }

  async find(params) {

    const id = params?.route?.id

    if(id){
      return Pipelines.find(p => p.id === id)
    }

    return {
      total: Pipelines.length,
      length: Pipelines.length,
      skip: 0,
      data: Pipelines
    }
  }

  async create(data, params) {

    // TODO: Restrict query params
    /**
     * format: ENUM [html, markdown, json, chunks]
     * $limit: disabled
     * $skip: disabled
     * $sort: disabled
     * $select: allowed, but only for document fields
     * applyOcr=yes
     * metaCharCount=how many chars from beginning to use to generate metadata and abstract
     * contentCharCount=how many chars from beginning to save as content snippet
     */

    /**
     * FORM FIELDS:
     * file: required
     * abstract: optional
     * title: optional
     * plugin: optional
     * ... any additional fields
     * ... you can also just update the doc after the fact
     */
    let id = params.route.id;
    let func = Pipelines.find(p => p.id === id).function
    return func.bind(this)(data, {...params, pipelineId: id})
  }

}

export const getOptions = (app) => {
  return { app }
}
