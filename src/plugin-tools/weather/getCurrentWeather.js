
/**
 * Class representing the SemanticScholar plugin.
 */
const TOOLNAME = "get_current_weather"

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
    const { data } = runOptions;
    let { location, unit = "fahrenheit" } = data
    if (location.toLowerCase().includes("tokyo")) {
      return JSON.stringify({ location: "Tokyo", temperature: "10", unit: "celsius" });
    } else if (location.toLowerCase().includes("san francisco")) {
      return JSON.stringify({ location: "San Francisco", temperature: "72", unit: "fahrenheit" });
    } else if (location.toLowerCase().includes("paris")) {
      return JSON.stringify({ location: "Paris", temperature: "22", unit: "fahrenheit" });
    } else {
      return JSON.stringify({ location, temperature: "unknown" });
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
  plugin: "Weather API",
  display: "Get Weather",
  function: {
    name: TOOLNAME,
    description: "Get the current weather in a given location",
    parameters: {
      type: "object",
      properties: {
        location: {
          type: "string",
          description: "The city and state, e.g. San Francisco, CA",
        },
        unit: { type: "string", enum: ["celsius", "fahrenheit"] },
      },
      required: ["location"],
    },
  },
};