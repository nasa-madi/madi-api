import * as Weather from "./weather/getCurrentWeather.js"
import * as CASC from './casConfluence/casConfluence.js'
import * as CASS from './casScenarios/casScenarios.js'
import * as SemanticScholarSearch from "./semantic-scholar/searchSemanticScholar.js"
import * as openaiAdapter from '../services/chats/chats.openai.js'

let isDeployed = !!process.env.GOOGLE_CLOUD_PROJECT

export let toolFuncs = {}
export let toolDescs = {}
export let defaultTools = []
export let toolRefreshFuncs = {}


let pluginList = [
    { name: 'casConfluence', module: CASC },
    { name: 'casScenarios', module: CASS },
    { name: 'semanticScholarSearch', module: SemanticScholarSearch }
];

const developPluginList = [
    { name: 'getCurrentWeather', module: Weather },
];

if (!isDeployed) {
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