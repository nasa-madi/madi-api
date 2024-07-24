import { BasePlugin } from 'madi-plg-base-class'

const TOOLNAME = "get_current_weather"

export class Plugin extends BasePlugin {

  constructor(options) {
    super({
      ...options,
      description
    })
  }

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