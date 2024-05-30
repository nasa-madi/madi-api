import * as Weather from "./devGetWeather/index.js"
import * as CASC from './casConfluence/index.js'
import * as CASS from './casScenarios/index.js'
import * as ARMDEBooks from './armdEBooks/index.js'
import * as SemanticScholarSearch from "./searchSemanticScholar/index.js"
import * as openaiAdapter from '../services/chats/chats.openai.js'

let isProduction = process.env.NODE_CONFIG_ENV === 'production'

export let toolFuncs = {}
export let toolDescs = {}
export let defaultTools = []
export let toolRefreshFuncs = {}


let pluginList = [
    { name: 'casConfluence', module: CASC },
    { name: 'casScenarios', module: CASS },
    { name: 'semanticScholarSearch', module: SemanticScholarSearch },
    { name: 'armdEBooks', module: ARMDEBooks }
];

const developPluginList = [
    { name: 'getCurrentWeather', module: Weather },
];

if (!isProduction) {
    pluginList = pluginList.concat(developPluginList)
}   

/**
 * Initializes the plugins.
 * @param {Object} app - The application object.
 * @returns {Promise<void>}
 */
export const plugins = async (app) => {
    let options = {
        chunks: app.service('chunks'),
        documents: app.service('documents'),
        uploads: app.service('documents'),
        makeRequest: (args)=>openaiAdapter.makeRequest(
            args,
            app.openai,  // shared instance
            app.get('openai').key // API KEY
        )
    }

    for (const plugin of pluginList) {
        const instance = new plugin.module.Plugin(options);
        const functionName = instance.describe().function.name;

        toolFuncs[functionName] = (...args) => instance.run(...args);
        toolRefreshFuncs[functionName] = (...args) => instance.refresh(...args);
        toolDescs[functionName] = instance.describe();
        defaultTools.push(functionName);

        await instance.init();
    }
 

}