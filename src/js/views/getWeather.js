import { WEATHER_API_KEY } from "../../../apikeys.js";
import { weatherConditions } from "../config.js";

/**
 * Retrieves weather data for a given geographic position.
 *
 * @param {number[]} position - An array containing latitude and longitude.
 * @throws {Error} Throws an error if weather data cannot be retrieved.
 */
const getWeather = async function (position) {
  try {
    // Open Weather API URL
    const openWeatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${position[0]}&lon=${position[1]}&units=imperial&appid=${WEATHER_API_KEY}`;

    // Await Open Weather API call
    const response = await fetch(openWeatherApiUrl);
    const data = await response.json();

    // Get the current conditions by code
    const conditionCode = data.weather[0].id.toString();
    const conditionEmoji = weatherConditions[conditionCode] || "";

    // Round temperature to nearest single decimal
    const temperature = data.main.temp.toFixed(1);

    // Find the temperature container
    const containerTemp = document.querySelector("#containerTemp");

    // Clear the temperature container
    containerTemp.innerHTML = "";

    // Update the temperature container with the latest temperature
    containerTemp.innerHTML += `${temperature}&deg;F ${conditionEmoji}`;
  } catch (err) {
    throw err;
  }
};

export default getWeather;
