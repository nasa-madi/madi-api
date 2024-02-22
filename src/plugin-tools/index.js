import { get_current_weather, get_current_weather_desc } from "./weather/getCurrentWeather.js"
import { searchSemanticScholar, searchSemanticScholarDesc} from "./semantic-scholar/searchSemanticScholar.js"
import StateByZip from "./zipcodes/getStateByZip.js"

export const toolFuncs = {
    get_current_weather,
    searchSemanticScholar,
    [StateByZip.name()]: StateByZip
     
}
export const toolDescs = {
    [get_current_weather_desc.function.name]: get_current_weather_desc,
    [searchSemanticScholarDesc.function.name]: searchSemanticScholarDesc,
    [StateByZip.name()]: StateByZip.describe()
}

export const defaultTools = [
    get_current_weather_desc.function.name,
    searchSemanticScholarDesc.function.name,
    StateByZip.name()
]