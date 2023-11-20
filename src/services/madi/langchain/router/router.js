
import { Debug } from '../utils/logger.js'
import * as dotenv from 'dotenv'
import { RouterExecutor } from './router.executor.js';
import { InvestigationRouter } from '../features/investigation/investigation.router.js';
import { SearchRouter } from '../features/search/search.tool.js';
import merge from 'deepmerge'
dotenv.config()
const debug = Debug(import.meta.url)

/**
 * @typedef {import("../types.js").Metadata} Metadata 
 * @typedef {import("../types.js").ServerResponse} ServerResponse
 */

/**
 * 
 * @param {string} message 
 * @param {Metadata} incomingMetadata 
 * @returns {Promise<[string, Metadata]>}
 */
export const router = async (message, incomingMetadata={}) => {
  const { routerKey } = incomingMetadata
  let output = []
  // incomingMetadata.routerKey = null

  const routerPrefix = (routerKey||"").split('_')[0]
  switch(routerPrefix){
    case 'investigation': {
      output = await InvestigationRouter(message, incomingMetadata)
      break;
    }
    case 'search': {
      output = await SearchRouter(message, incomingMetadata)
      break;
    }
    default: {
      output = await RouterExecutor(message, incomingMetadata)
      
    }
  }


  
  /**
   * ALWAYS RETURNS A TUPLE
   */
  if(Array.isArray(output)){
    let newMetadata = merge(incomingMetadata, output[1], {arrayMerge:(d,s)=>s})
    return [output[0], newMetadata]
  }
  if(typeof output === "string"){
    return [output, incomingMetadata]
  }
  if(typeof output === 'object'){
    return [output, incomingMetadata]
  }

  
};



