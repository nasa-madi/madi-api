import fetch from 'node-fetch';
import { BasePlugin } from 'madi-plg-base-class'

/************** NEW STRUCTURE VERSION *************/  
const TOOLNAME = 'search_semantic_scholar'

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
   * Run the SemanticScholar operation.
   * @param {RunOptions} options - The options for the search operation.
   * @returns {Promise<string>} - The search results in string format.
   */
  async run(runOptions, params) {
    const { data } = runOptions;
    let { query } = data;
    const fields = [
      'paperId',
      'url',
      'title',
      'venue',
      'publicationVenue',
      'year',
      'authors',
      'abstract',
      'publicationDate',
      'tldr'
    ].join(',');

    const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(
      query
    )}&fields=${fields}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }
      const data = await response.json();
      return JSON.stringify(data);
    } catch (error) {
      return JSON.stringify({ error: error.message });
    }
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

export const description = {
  type: "function",
  plugin: "Semantic Scholar",
  display: "Search Semantic Scholar",
  function: {
    name: TOOLNAME,
    description: "A powerful tool to search for academic papers and research articles from Semantic Scholar. This function allows users to perform detailed searches using various parameters such as query terms, publication dates, venues, and fields of study. It is designed to help researchers, students, and academics find relevant literature efficiently.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query for papers, e.g. 'covid'",
        },
        limit: {
          type: "integer",
          description: "The maximum number of results to return (must be <= 100).",
          default: 100
        },
        publicationDateOrYear: {
          type: "string",
          description: "Restrict results to the given range of publication dates or years (inclusive). Accepts the format <startDate>:<endDate> where each term is optional, allowing for specific dates, fixed ranges, or open-ended ranges."
        },
        year: {
          type: "string",
          description: "Restrict results to the given publication year (inclusive)."
        },
        venue: {
          type: "string",
          description: "Restrict results by venue, including ISO4 abbreviations. Use a comma-separated list to include papers from more than one venue. Example: 'Nature,Radiology'."
        },
        fieldsOfStudy: {
          type: "string",
          description: "Restrict results to given field-of-study. Available fields include 'Computer Science', 'Medicine', 'Biology', etc."
        },
        offset: {
          type: "integer",
          description: "When returning a list of results, start with the element at this position in the list.",
          default: 0
        }
      },
      required: ["query"],
    },
  },
};
