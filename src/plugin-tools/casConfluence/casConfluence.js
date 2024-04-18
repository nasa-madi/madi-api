/* eslint-disable @typescript-eslint/no-explicit-any */
import Turndown from 'turndown'
var turndownService = new Turndown()
/**
 * Class representing the SemanticScholar plugin.
 */

const TOOLNAME = 'search_cas_confluence'

export class Plugin {

  /**
   * Create a CAS Scenario plugin.
   * @param {PluginOptions} [options] - The plugin options.
   */
  constructor(options) {
    this.documents = options?.documents;
    this.chunks = options?.chunks;
    this.uploads = options?.uploads;
  }


  /**
   * Run the CAS Scenario operation.
   * @param {RunOptions} options - The options for the search operation.
   * @returns {Promise<string>} - The search results in string format.
   */
  async run(runOptions, params) {
    // Destructure the search parameters or set defaults
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const related = (await this.chunks?.find({
      ...params,
      query: {
        $search: runOptions?.data?.query,
        toolName: TOOLNAME,
        $select: ['metadata','pageContent','documentId','toolName'],
        $limit: 20
      }
    })).data

    const filled = await Promise.all(
      related.map(async (c) => {
        let doc = await this.documents.get(c.documentId, {
          ...params,
          query: {
            $select: ['metadata', 'abstract', 'toolName'],
            toolName: TOOLNAME,
          },
        });
        if (doc) {
          c.document = doc;
        }
        return c;
      })
    );

    const cleaned = filled.map(c => {
      // c.pageContent = c.pageContent.replace(/\\\\\\/gm, '')
      c.pageContent = turndownService.turndown(c.pageContent);
      // c.pageContent = c.pageContent
      c.pageContent = c.pageContent.replace(/\\{1,12}/g, '\\')
      console.log(c.pageContent)
      return c;
    });


    const INSTRUCTION = `INSTRUCTIONS: Below are several snippets from Confluence documents pertaining to your request. They are in order of closeness depending on the cosine similarity of the embeddings of the query and the snippet.  They also include links and ID numbers for pages in the confluence space.  When responding make sure to include the relevant links to the documents and name the document from which the snippet was pulled.`
    const snippets = '##Snippet\n' + cleaned?.map(d => JSON.stringify(d)).join('\n\n##Snippet\n');
    return {"content":INSTRUCTION + snippets}
  }

  async refresh(_data, params) {
    let data = _data.data;
    let converted = data.map((d) => {
      d.toolName = TOOLNAME;
      return d
    })

    const createPromises = converted.map((doc) => 
      this.documents.create(doc, params)
        .catch(e => {
            if(e.message.includes('duplicate') || e.message.includes('unique') ){
              return null
            }
            throw e
          }
        )
    );

    let result = await Promise.all(createPromises)
    return result.filter(e=>!!e)
  }

    /**
     * Describe the tool for integration with other systems or UI.
     * @returns {Tool} - The tool description object.
     */
    describe() {
      // Return the static description of the Semantic Scholar search function
      return description;
    }
  
    /**
     * Runs at initialization of the plugin. Will run asynchronously, so do not depend on completion for a startup event
     * @returns {void}
     */
    async init() {
      
    }

  }

  export const test = true;
  
  // The static description object for the Semantic Scholar search tool.
  export const description = {
    type: 'function',
    plugin: 'CAS Discovery',
    // Identifier for the plugin
    display: 'Search CAS\'s Confluence',
    // Display name for the UI
    function: {
      name: TOOLNAME,
      description: 'Search in NASA\'s CAS Confluence for new opportunity concept reports, problem prompts, and other information related to CAS Discovery and their futurism and wicked problem solutioning',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query for papers, e.g. "covid"'
          }
        },
        required: ['query']
      }
    }
  };