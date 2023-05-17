import { wxKeyLocal } from "./localWxKey";

const getWeather = async function () {
  try {
    fetch("/.netlify/functions/getWx")
      .then((response) => response.json())
      .then((data) => {
        const temperature = data.temperature;
        console.log(`Temperature: ${temperature}`);
      })
      .catch((error) => {
        console.error("Error fetching weather data:", error);
      });

    // const openWeatherCity = "San Francisco";

    //   const wxKeyNetlify = process.env.openWeatherApi_Key;
    //   const OPENWEATHER_API_KEY = wxKeyNetlify ? wxKeyNetlify : wxKeyLocal;
    //   const openWeatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${openWeatherCity}&units=imperial&appid=${OPENWEATHER_API_KEY}`;
    //   const response = await fetch(openWeatherApiUrl);
    //   const data = await response.json();
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

console.log(wxKeyNetlify);
console.log(OPENWEATHER_API_KEY);
console.log(wxKeyLocal);
console.log(process.env);
