
import { InvestigationConfirmation } from './investigation.tool.js';
import { InvestigationPicker } from './investigation.tool.js';

/**
 * @typedef {import("../../types.js").Metadata} Metadata 
 * @typedef {import("../../types.js").ServerResponse} ServerResponse
 */

/**
 * @param {string} message 
 * @param {Metadata} incomingMetadata 
 * @returns {Promise<Array<string, Metadata>>}
 */
export const InvestigationRouter = async (message, incomingMetadata) => {
    const { routerKey } = incomingMetadata || {}
    const route = routerKey.split("_")[1]
    switch(route){
      case 'confirmation': {
        return InvestigationConfirmation(message, incomingMetadata)
      }
      default: {
        return InvestigationPicker(message, incomingMetadata)
      }
    }
  };
  