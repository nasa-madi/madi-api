import { get_current_weather, get_current_weather_desc } from "./weather/getCurrentWeather.js"
import { searchSemanticScholar, searchSemanticScholarDesc} from "./semantic-scholar/searchSemanticScholar.js"

// import * as CASC from "madi-plg-cas-confluence"
import * as CASC from './casConfluence/casConfluence.js'
import * as CASS from './casScenarios/casScenarios.js'


let isDeployed = !!process.env.GOOGLE_CLOUD_PROJECT

let casConfluence
let casScenarios


export let toolFuncs = {}

export let toolDescs = {}

export let defaultTools = []

export let toolRefreshFuncs = {}

// console.log(defaultTools)

export const plugins = async (app)=>{
    let options = {
        chunks: app.service('chunks'),
        documents: app.service('documents'),
        uploads: app.service('documents')

    }

    casConfluence = new CASC.Plugin(options)
    casScenarios = new CASS.Plugin(options)


    toolFuncs = {
        get_current_weather: isDeployed ? get_current_weather : undefined,
        searchSemanticScholar,
        [casConfluence.describe().function.name]: (...args)=>{
            return casConfluence.run(...args)
        },
        [casScenarios.describe().function.name]: (...args)=>{
            return casScenarios.run(...args)
        }
 
    }

    toolRefreshFuncs = {
        [casConfluence.describe().function.name]: (...args)=>{
            return casConfluence.refresh(...args)
        },
        [casScenarios.describe().function.name]: (...args)=>{
            return casScenarios.refresh(...args)
        }
    }
    
    toolDescs = {
        [get_current_weather_desc.function.name]: isDeployed ? get_current_weather_desc : undefined,
        [searchSemanticScholarDesc.function.name]: searchSemanticScholarDesc,
        [casConfluence.describe().function.name]: casConfluence.describe(),
        [casScenarios.describe().function.name]: casScenarios.describe()

    }
    
    defaultTools = [
        searchSemanticScholarDesc.function.name,
        casConfluence.describe().function.name,
        casScenarios.describe().function.name
    ]
    if(isDeployed) defaultTools.push(get_current_weather_desc.function.name)


    await casConfluence.init();
    await casScenarios.init();

}