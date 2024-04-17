
/**
 * Class representing the SemanticScholar plugin.
 */

const TOOLNAME = 'create_cas_scenario'

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
    // const related = await this.chunks?.find({
    //   ...params,
    //   query: {
    //     $search: runOptions?.data?.query,
    //     toolName: TOOLNAME,
    //     $select: ['pageContent'],
    //     $limit: 20
    //   }
    // });
    // const snippets = '##Snippet\n' + related?.data.map(d => d.pageContent).join('\n\n##Snippet\n');
    // return JSON.stringify(snippets);
    return 'hi!'
  }

  async refresh(_data, params) {
    return null
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
    display: 'Scenario Creation',
    // Display name for the UI
    function: {
      name: TOOLNAME,
      description: 'Generate a scenario using CAS\'s futurist scenario creation tool.  The tool is a complex prompt that goes through several steps in order to output a rich futuristic scenario.',
      parameters: {
        type: 'object',
        properties: {
          topic: {
            type: 'string',
            description: 'The topic that the futurist scenario should be about. Can be a whole article or simply a text string.'
          },
          timeline: {
            type: 'string',
            description: 'How far in the future the scenario should imagine.  Defaults to 2050.'
          },
          need: {
            type: 'string',
            description: 'The specific need facing humanity or industry that the scenario should be addressing.' 
          },
          capability: {
            type: 'string',
            description: 'The technical capability that is new or emerging or being applied in a new way that the scenario should be focused on.' 
          },
          trend: {
            type: 'string',
            description: 'A macro trend, good or bad, that is pointing towards a future crisis or capability or change that the scenario should also include.' 
          }
        },
        required: ['topic']
      }
    }
  };