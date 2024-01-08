const apiKey = 'Bd5e378503939ddaee76f12ad7a97608';
const apiUrl = 'https://api.openweathermap.org/data/2.5';

async function getWeatherData(city) {
  try {
    const response = await fetch(`${apiUrl}/weather?q=${city}&appid=${apiKey}&units=metric`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
}

function displayCurrentWeather(data) {
  const currentWeatherSection = document.getElementById('currentWeather');
  currentWeatherSection.innerHTML = '';

  if (data) {
    const { name, main, weather, wind } = data;
    const weatherIconUrl = `http://openweathermap.org/img/w/${weather[0].icon}.png`;

    const html = `
      <h2>${name}</h2>
      <p>Date: ${new Date().toLocaleDateString()}</p>
      <img src="${weatherIconUrl}" alt="${weather[0].description}">
      <p>Temperature: ${main.temp}°C</p>
      <p>Humidity: ${main.humidity}%</p>
      <p>Wind Speed: ${wind.speed} m/s</p>
    `;

    currentWeatherSection.innerHTML = html;
  } else {
    currentWeatherSection.innerHTML = '<p>City not found. Please try again.</p>';
  }
}

function addToSearchHistory(city) {
  const searchHistorySection = document.getElementById('searchHistory');
  const ul = searchHistorySection.querySelector('ul') || document.createElement('ul');

  const li = document.createElement('li');
  li.textContent = city;

  li.addEventListener('click', async () => {
    const currentWeatherData = await getWeatherData(city);
    displayCurrentWeather(currentWeatherData);
    const forecastData = await getForecastData(city);
    displayForecast(forecastData);
  });

  ul.appendChild(li);
  searchHistorySection.appendChild(ul);
}

async function getForecastData(city) {
  try {
    const response = await fetch(`${apiUrl}/forecast?q=${city}&appid=${apiKey}&units=metric`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching forecast data:', error);
    return null;
  }
}

function displayForecast(data) {
  const forecastSection = document.getElementById('forecast');
  forecastSection.innerHTML = '';

  if (data) {
    const forecastList = data.list.slice(0, 5); // Take only the first 5 items
    const forecastHtml = forecastList.map(item => {
      const { dt_txt, main, weather, wind } = item;
      const weatherIconUrl = `http://openweathermap.org/img/w/${weather[0].icon}.png`;

      return `
        <div class="forecast-item">
          <p>Date: ${new Date(dt_txt).toLocaleDateString()}</p>
          <img src="${weatherIconUrl}" alt="${weather[0].description}">
          <p>Temperature: ${main.temp}°C</p>
          <p>Humidity: ${main.humidity}%</p>
          <p>Wind Speed: ${wind.speed} m/s</p>
        </div>
      `;
    }).join('');

    forecastSection.innerHTML = forecastHtml;
  } else {
    forecastSection.innerHTML = '<p>Forecast not available. Please try again.</p>';
  }
}

document.getElementById('searchForm').addEventListener('submit', async function(event) {
  event.preventDefault();

  const cityInput = document.getElementById('cityInput');
  const cityName = cityInput.value.trim();

  if (cityName !== '') {
    const currentWeatherData = await getWeatherData(cityName);
    displayCurrentWeather(currentWeatherData);
    addToSearchHistory(cityName);
  }

  cityInput.value = '';
});

document.getElementById('searchHistory').addEventListener('click', async function(event) {
  if (event.target.tagName === 'LI') {
    const cityName = event.target.textContent;
    const currentWeatherData = await getWeatherData(cityName);
    displayCurrentWeather(currentWeatherData);
    const forecastData = await getForecastData(cityName);
    displayForecast(forecastData);
  }
});