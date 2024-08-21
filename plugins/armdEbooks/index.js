import Turndown from 'turndown'
import { BasePlugin } from 'madi-plg-base-class'
var turndownService = new Turndown()

const TOOLNAME = 'search_armd_ebooks'; // Identifier for the plugin

export const test = true;

// The static description object for the Confluence search tool.
export const description = {
  type: 'function',
  plugin: 'ARMD E-Books',
  // Identifier for the plugin
  display: 'Search ARMD E-Books',
  // Display name for the UI
  function: {
    name: TOOLNAME,
    description: 'Search in NASA ARMD\'s published e-books on the history of NASA\'s flight and aeronautics research.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query for the books.'
        }
      },
      required: ['query']
    }
  }
};

/**
 * Class representing the SemanticScholar plugin.
 */
export class Plugin extends BasePlugin {

  /**
   * Create a CAS Scenario plugin.
   * @param {PluginOptions} [options] - The plugin options.
   */
  constructor(options) {
    super({
      ...options,
      description
    })
  }


  /**
   * Run the CAS Scenario operation.
   * @param {RunOptions} options - The options for the search operation.
   * @returns {Promise<string>} - The search results in string format.
   */
  async run(runOptions, params) {
    // Destructure the search parameters or set defaults

    const related = (await this.chunks?.find({
      ...params,
      query: {
        $search: runOptions?.data?.query ?? '',
        plugin: TOOLNAME,
        $select: ['metadata','pageContent','documentId','plugin'],
        $limit: 50
      }
    }))?.data ?? [];

    const filled = await Promise.all(
      related.map(async (c) => {
        let doc = await this.documents.get(c.documentId, {
          ...params,
          query: {
            $select: ['metadata', 'abstract', 'plugin'],
            plugin: TOOLNAME,
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


    const INSTRUCTION = `INSTRUCTIONS: Below are several snippets from ebooks published by NASA ARMD pertaining to your request. They are in order of closeness depending on the cosine similarity of the embeddings of the query and the snippet.  They also include abstracts and metadata of the full documents.  Respond only with information provided by ther snippets. When responding make sure to include the relevant links to the documents and name the document from which the snippet was pulled.  Do not guess at links, names, or other data points. It is CRITICAL that you only use the exact links returned in the document metadata or redirect to the user to www.nasa.gov/ebooks/#aeronautics, otherwise return no link at at. If you are unable to find the information requested, please respond with "No information found".\n\n`
    const snippets = '##Snippet\n' + cleaned?.map(d => JSON.stringify(d)).join('\n\n##Snippet\n');
    return {"content":INSTRUCTION + snippets}
  }

  async refresh(_data, params) {
    let data = _data.data;
    let converted = data.map((d) => {
      d.plugin = TOOLNAME;
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

}

  