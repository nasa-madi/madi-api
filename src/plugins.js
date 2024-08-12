import { logger } from './logger.js';

export let toolFuncs = {};
export let toolDescs = {};
export let defaultTools = [];
export let toolRefreshFuncs = {};

const LOG_KEY= 'PLUGINS: ';
/**
 * Initializes the plugins.
 * @param {Object} app - The application object.
 * @returns {Promise<void>}
 */
export const plugins = async (app) => {
    logger.info(`${LOG_KEY}Fetching plugins configuration...`);

    let defaults = app.get('plugins').default || [];
    let restricted = app.get('plugins').restricted || [];
    let development = app.get('plugins').development || [];
    let start = app.get('plugins').start || 'index.js';
    let path = app.get('plugins').path || '../plugins/';

    defaults = await loadPlugins(path, start, defaults, 'defaults');
    restricted = await loadPlugins(path, start, restricted, 'restricted');
    development = await loadPlugins(path, start, development, 'development');

    async function loadPlugins(path, start, plugins, type) {
        let pluginList = [];
        for await (const pluginConfig of plugins) {
            let local;
            let pluginName = pluginConfig; // Default to string case

            // Check if pluginConfig is an object and extract properties
            if (typeof pluginConfig === 'object' && pluginConfig !== null) {
                pluginName = Object.keys(pluginConfig)[0];
                path = pluginConfig[pluginName].path || path; // Use provided path or default
                start = pluginConfig[pluginName].start || start; // Use provided start file or default
            }

            // Normalize path to ensure it ends with a '/'
            if (!path.endsWith('/')) {
                path += '/';
            }

            // Import the plugin
            try {
                local = await import(pluginName);
            } catch (nodeModulesError) {
                // Construct the local import path
                const localImportPath = `${path}${pluginName}/${start}`;
                // If import from node_modules fails, try importing from local folder
                try {
                    local = await import(localImportPath);
                } catch (localImportError) {
                    logger.error(`${LOG_KEY}Failed to import plugin "${pluginName}" from both node_modules and local folder. Tried local path: ${localImportPath}`);
                    if (app.get('plugins').failOnImportError) throw localImportError;
                    continue;
                }
            }
            pluginList.push({
                name: pluginName,
                module: local,
                type
            });
        }
        logger.info(`${LOG_KEY}Fetched ${type} plugins:`+ pluginList.reduce((a, p) => a + ' ' + p.name, ''))
        return pluginList;
    }

    let options = {
        chunks: createServiceWrapper(app.service('chunks')),
        documents: createServiceWrapper(app.service('documents')),
        uploads: createServiceWrapper(app.service('uploads')),
        parser: createServiceWrapper(app.service('parser')),
        _logger: logger,
        makeRequest: (args) => openaiAdapter.makeRequest(
            args,
            app.openai, // shared instance
            app.get('openai').key // API KEY
        )
    };

    let pluginList = [...defaults, ...restricted, ...development];
    logger.info(`${LOG_KEY}Initializing plugins...`);
    for (const plugin of pluginList) {
        logger.info({ 
            message: `Initializing plugin: ${plugin.name}`,
            subcomponent: plugin.name.toUpperCase(),
            component: 'PLUGINS',
            full: true
        });

        // create instance
        const instance = new plugin.module.Plugin(options);

        registerTools(instance)

        await instance.init();
    }
    logger.info(`${LOG_KEY}Plugins successfully initialized.`);
};

function registerTools(instance) {
    const functionName = instance.describe().function.name;

    const wrapMethod = (method) => (...args) => {
        return instance[method](...args);
    };

    toolFuncs[functionName] = (user)=>wrapMethod('run')(user);
    toolRefreshFuncs[functionName] = (user)=>wrapMethod('refresh')(user);
    toolDescs[functionName] = instance.describe();
    defaultTools.push(functionName);
}



// Function to create a secure wrapper for a service
function createServiceWrapper(service) {
    const wrapMethod = (method) => (user)=>(...args) => {
        const params = args[args.length - 1];
        if (params.plugin !== service.name && params.plugin !== 'all') {
            throw new Error(`Invalid plugin name: ${params.plugin}. Expected ${service.name} or 'all'.`);
        }
        if (params.user.id !== user.id){
            throw new Error(`Invalid user: ${params.user}. Expected ${user}.`);
        }
        return service[method](...args);
    };

    return {
        find: wrapMethod('find'),
        get: wrapMethod('get'),
        create: wrapMethod('create'),
        patch: wrapMethod('patch'),
        remove: wrapMethod('remove'),
    };
}