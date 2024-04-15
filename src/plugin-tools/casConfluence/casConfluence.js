/* eslint-disable @typescript-eslint/no-explicit-any */

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
    const related = await this.chunks?.find({
      ...params,
      query: {
        $search: runOptions?.data?.query,
        toolName: TOOLNAME,
        $select: ['pageContent'],
        $limit: 20
      }
    });
    const snippets = '##Snippet\n' + related?.data.map(d => d.pageContent).join('\n\n##Snippet\n');
    return JSON.stringify(snippets);
  }

  async refresh(_data, params) {
    let data = _data.data;
    let converted = data.map((d) => ({
      metadata: {
        pageId: d.page_id,
        title: d.title,
        link: d.link,
        last_update: d.last_update,
      },
      toolName: TOOLNAME,
      content: d.content,
    }));

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
    plugin: 'CAS Confluence',
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