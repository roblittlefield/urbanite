import { WEATHER_API_KEY } from "../../../apikeys.js";

const getWeather = async function (position) {
  try {
    const openWeatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${position[0]}&lon=${position[1]}&units=imperial&appid=${WEATHER_API_KEY}`;
    const response = await fetch(openWeatherApiUrl);
    const data = await response.json();
    const temperature = data.main.temp.toFixed(1);
    const containerTemp = document.querySelector("#containerTemp");
    containerTemp.innerHTML = "";
    containerTemp.innerHTML += `${temperature}&deg;F`;
  } catch (err) {
    throw err;
  }
};

export default getWeather;
