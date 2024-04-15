import { get_current_weather, get_current_weather_desc } from "./weather/getCurrentWeather.js"
import { searchSemanticScholar, searchSemanticScholarDesc} from "./semantic-scholar/searchSemanticScholar.js"

// import * as CASC from "madi-plg-cas-confluence"
import * as CASC from './casConfluence/casConfluence.js'


let casConfluence


export let toolFuncs = {}

export let toolDescs = {}

export let defaultTools = []

export let toolRefreshFuncs = {}

console.log(defaultTools)

export const plugins = async (app)=>{
    let options = {
        chunks: app.service('chunks'),
        documents: app.service('documents'),
        uploads: app.service('documents')

    }
    casConfluence = new CASC.Plugin(options)

    toolFuncs = {
        get_current_weather,
        searchSemanticScholar,
        [casConfluence.describe().function.name]: (...args)=>{
            return casConfluence.run(...args)
        }
 
    }

    toolRefreshFuncs = {
        [casConfluence.describe().function.name]: (...args)=>{
            return casConfluence.refresh(...args)
        }
    }
    
    toolDescs = {
        [get_current_weather_desc.function.name]: get_current_weather_desc,
        [searchSemanticScholarDesc.function.name]: searchSemanticScholarDesc,
        [casConfluence.describe().function.name]: casConfluence.describe()
    }
    
    defaultTools = [
        get_current_weather_desc.function.name,
        searchSemanticScholarDesc.function.name,
        casConfluence.describe().function.name
    ]


 

    await casConfluence.init();


}