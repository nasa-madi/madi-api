import { get_current_weather, get_current_weather_desc } from "./weather/getCurrentWeather.js"
import { searchSemanticScholar, searchSemanticScholarDesc} from "./semantic-scholar/searchSemanticScholar.js"


export const toolFuncs = {
    get_current_weather,
    searchSemanticScholar

}
export const toolDescs = {
    [get_current_weather_desc.function.name]: get_current_weather_desc,
    [searchSemanticScholarDesc.function.name]: searchSemanticScholarDesc
}

export const defaultTools = [
    get_current_weather_desc.function.name,
    searchSemanticScholarDesc.function.name
]