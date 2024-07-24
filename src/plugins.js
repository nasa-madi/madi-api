let isProduction = process.env.NODE_CONFIG_ENV === 'production'

export let toolFuncs = {}
export let toolDescs = {}
export let defaultTools = []
export let toolRefreshFuncs = {}

/**
 * Initializes the plugins.
 * @param {Object} app - The application object.
 * @returns {Promise<void>}
 */
export const plugins = async (app) => {

    console.log('\nplugins:', app.get('plugins'),'\n')

    let defaults = app.get('plugins').default || []
    let restricted = app.get('plugins').restricted || []
    let development = app.get('plugins').development || []
    let start = app.get('plugins').start || 'index.js'
    let path = app.get('plugins').path || '../plugins/'
    
    defaults = await loadPlugins(path, start, defaults, 'defaults')
    restricted = await loadPlugins(path, start, restricted, 'restricted')
    development = await loadPlugins(path, start, development, 'development')
    
    async function loadPlugins(path, start, plugins, type) {
        let pluginList = [];
        for await (const pluginConfig of plugins) {
            let local;
            let pluginName = pluginConfig; // Default to string case
                
            // Check if pluginConfig is an object and extract properties
            if (typeof pluginConfig === 'object' && pluginConfig !== null) {
                pluginName = Object.keys(pluginConfig)[0]
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
                    console.error(`Failed to import plugin "${pluginName}" from both node_modules and local folder. Tried local path: ${localImportPath}`);
                    if(app.get('plugins').failOnImportError) throw localImportError;
                    continue;
                }
            }
            pluginList.push({
                name: pluginName,
                module: local,
                type
            });

        }      
        console.log(`\n\nSpinning up ${type} plugins...`);
        console.log(pluginList.map(p => p.name));
        return pluginList  
    }


    let options = {
        chunks: app.service('chunks'),
        documents: app.service('documents'),
        uploads: app.service('documents'),
        makeRequest: (args) => openaiAdapter.makeRequest(
            args,
            app.openai, // shared instance
            app.get('openai').key // API KEY
        )
    };

    let pluginList = [...defaults, ...restricted, ...development];
    for (const plugin of pluginList) {
        console.log(`\n\nInitializing plugin: ${plugin.name}`);
        const instance = new plugin.module.Plugin(options);
        const functionName = instance.describe().function.name;

        toolFuncs[functionName] = (...args) => instance.run(...args);
        toolRefreshFuncs[functionName] = (...args) => instance.refresh(...args);
        toolDescs[functionName] = instance.describe();
        defaultTools.push(functionName);

        await instance.init();
    }
    console.log('\n\nToolFuncs:', toolFuncs, '\n\n');
    console.log('\n\nToolDescs:', toolDescs, '\n\n');
    console.log('\n\nDefaultTools:', defaultTools, '\n\n');
};