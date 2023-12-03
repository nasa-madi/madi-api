import { get_current_weather, get_current_weather_desc } from "./weather/getCurrentWeather.js"

export const toolFuncs = {
    get_current_weather
}
export const toolDescs = {
    [get_current_weather_desc.function.name]: get_current_weather_desc
}