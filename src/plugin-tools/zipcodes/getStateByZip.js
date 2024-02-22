
export default class StateByZipPlugin{

  constructor (options) {
    this.documents = options?.documents;
    this.chunks = options?.chunks;
    this.uploads = options?.uploads;
    this.chats = options?.chats;
    this.tools = options?.tools;
  }

  static describe() { return stateByZipDesc;}

  static provider() { return 'openai'; }

  static name()     { return stateByZipDesc.function.name}

  async run (data, params){
    return {
      content: get_zip(data.zip),
      partial: true,
      nextCall: JSON.stringify({
        zip:'90210'
      })
    }
  }

}

function get_zip(zip) {
  switch (zip) {
      case '70003':
          return 'Louisiana';
      case '90210':
          return 'California';
      case '10001':
          return 'New York';
      case '60601':
          return 'Illinois';
      case '33101':
          return 'Florida';
      case '98101':
          return 'Washington';
      case '85001':
          return 'Arizona';
      case '30301':
          return 'Georgia';
      case '48201':
          return 'Michigan';
      case '77001':
          return 'Texas';
      default:
          return 'Unknown Location';
  }
}

const stateByZipDesc = {
  type: "function",
  plugin: "State ZIP API",
  display: "Get State By Zip",
  function: {
    name: "get_state_by_zip",
    description: "Get the state for a given zipcode.",
    parameters: {
      type: "object",
      properties: {
        zip: {
          type: "string",
          description: "The zipcode being requested",
        },
      },
      required: ["zip"],
    },
  },
};