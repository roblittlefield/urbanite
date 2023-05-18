import { WEATHER_API_KEY } from "../../../apikeys.js";

const openWeatherCity = "San Francisco";
const getWeather = async function () {
  try {
    const openWeatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${openWeatherCity}&units=imperial&appid=${WEATHER_API_KEY}`;
    const response = await fetch(openWeatherApiUrl);
    const data = await response.json();
    const temperature = data.main.temp.toFixed(1);
    const iconCode = data.weather[0].icon;
    const iconUrl = `http://openweathermap.org/img/w/${iconCode}.png`;
    const containerTemp = document.querySelector("#containerTemp");
    //   containerTemp.innerHTML = `<img src="${iconUrl}" alt="${data.weather[0].description}" title="${data.weather[0].description}">`;
    containerTemp.innerHTML += `${temperature}&deg;F`;
  } catch (error) {
    console.error(error);
  }
};

export default getWeather;
