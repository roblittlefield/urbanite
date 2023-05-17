const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  const apiKey = process.env.openWeatherApi_Key;
  const openWeatherCity = 'San Francisco';

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${openWeatherCity}&units=metric&appid=${apiKey}`
    );
    const data = await response.json();
    const temperature = data.main.temp.toFixed(1);

    return {
      statusCode: 200,
      body: JSON.stringify({ temperature }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch weather data.' }),
    };
  }
};
