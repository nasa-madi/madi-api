
import { Type  } from '@sinclair/typebox';
import Ajv from 'ajv';
const ajv = new Ajv();


export default class BasePlugin {

  constructor(options) {
    this.documents = options.documents || [];
    this.chunks = options.chunks || [];
    this.uploads = options.uploads || [];
    this.description = options.description;
    this.makeRequest = options.makeRequest;
    if(!this.description) throw new Error('Description is a required configuration field');
    this.validate()
  }
  validate(){
    const validate = ajv.compile(descriptionSchema);
    const valid = validate(this.description);
    if (!valid) {
        throw new Error(validate.errors)
    }
  }

  /**
   * Describe the tool for integration with other systems or UI.
   * @returns {Tool} - The tool description object.
   */
  describe() {
    if (!this.description || !this.description.function || !this.description.function.parameters) {
      throw new Error('Description is not well formatted');
    }
    return this.description;
  }

  /**
   * Runs at initialization of the plugin. Will run asynchronously, so do not depend on completion for a startup event
   * @returns {void}
   */
  async init() {

  }
}


// Define the schema using TypeBox
const descriptionSchema = Type.Object({
    type: Type.Literal('function'),
    plugin: Type.String(),
    display: Type.String(),
    function: Type.Object({
      name: Type.String(),
      description: Type.String(),
      parameters: Type.Object({
        type: Type.Literal('object'),
        properties: Type.Record(Type.String(), Type.Object({
          type: Type.String(),
          description: Type.Optional(Type.String())
        })), // Extendable properties object
        required: Type.Array(Type.String())
      })
    })
});
