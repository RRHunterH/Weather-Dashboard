const apiKey = '4fab18ec8b2629b2c5bd58592bc2de4c';
const apiUrl = 'https://api.openweathermap.org/data/2.5';

const searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

async function getWeatherAndForecastData(city) {
    try {
        const weatherResponse = await fetch(`${apiUrl}/weather?q=${city}&appid=${apiKey}&units=imperial`);
        const forecastResponse = await fetch(`${apiUrl}/forecast?q=${city}&appid=${apiKey}&units=imperial`);

        const weatherData = await weatherResponse.json();
        const forecastData = await forecastResponse.json();

        return { weather: weatherData, forecast: forecastData };
    } catch (error) {
        console.error('Error fetching data:', error);
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
        <p>Temperature: ${formatTemperature(main.temp)}°F</p>
        <p>Humidity: ${main.humidity}%</p>
        <p>Wind Speed: ${wind.speed} m/s</p>
      `;

        currentWeatherSection.innerHTML = html;
    } else {
        currentWeatherSection.innerHTML = '<p>City not found. Please try again.</p>';
    }
}

function convertToFahrenheit(celsius) {
    return (celsius * 9/5) + 32;
}

function formatTemperature(temperature) {
    return temperature.toFixed(1)
}


function addToSearchHistory(city) {
    const searchHistorySection = document.getElementById('searchHistory');
    const ul = searchHistorySection.querySelector('ul') || document.createElement('ul');

    const li = document.createElement('li');
    li.textContent = city;

    li.addEventListener('click', async () => {
        const { weather, forecast } = await getWeatherAndForecastData(city);
        displayCurrentWeather(weather);
        displayForecast(forecast);
    });

    ul.appendChild(li);
    searchHistorySection.appendChild(ul);

    searchHistory.push(city);
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
}

async function getForecastData(city) {
    try {
        const response = await fetch(`${apiUrl}/forecast?q=${city}&appid=${apiKey}&units=imperial`);
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
        let dailyForecasts = {};
        data.list.forEach(item => {
            const date = new Date(item.dt_txt).toLocaleDateString();
            if (!dailyForecasts[date]) {
                dailyForecasts[date] = [];
            }
            dailyForecasts[date].push(item);
        });

        let forecasts = Object.values(dailyForecasts).map(items => items[Math.floor(items.length / 2)]);

        forecasts = forecasts.slice(0, 5);

        const forecastHtml = forecasts.map(item => {
            const { dt_txt, main, weather, wind } = item;
            const weatherIconUrl = `http://openweathermap.org/img/w/${weather[0].icon}.png`;

            return `
                <div class="forecast-item">
                  <p>Date: ${new Date(dt_txt).toLocaleDateString()}</p>
                  <img src="${weatherIconUrl}" alt="${weather[0].description}">
                  <p>Temperature: ${formatTemperature(main.temp)}°F</p>
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

function displayForecastPlaceholders() {
    const forecastSection = document.getElementById('forecast');
    forecastSection.innerHTML = '';

    for (let i = 0; i < 5; i++) {
        const placeholderHtml = `
            <div class="forecast-item">
                <p>Date: 5-Day Forecast ${i + 1}</p>
                <p>Loading...</p>
            </div>
        `;
        forecastSection.innerHTML += placeholderHtml;
    }
}

document.getElementById('searchForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const cityInput = document.getElementById('cityInput');
    const cityName = cityInput.value.trim();

    if (cityName !== '') {
        displayForecastPlaceholders();

        const { weather, forecast } = await getWeatherAndForecastData(cityName);

        if (weather && forecast) {
            displayCurrentWeather(weather);
            addToSearchHistory(cityName);
            displayForecast(forecast);
        } else {
            console.error('Unable to retrieve data for the specified city.');
        }
    }

    cityInput.value = '';
});

document.getElementById('searchHistory').addEventListener('click', async function(event) {
    if (event.target.tagName === 'LI') {
        const cityName = event.target.textContent;
        const { weather, forecast } = await getWeatherAndForecastData(cityName);
        displayCurrentWeather(weather);
        displayForecast(forecast);
    }
});

document.getElementById('deleteSearchesBtn').addEventListener('click', function() {
    const searchHistorySection = document.getElementById('searchHistory');
    const ul = searchHistorySection.querySelector('ul');

    if (ul) {
        ul.innerHTML = '';
        localStorage.removeItem('searchHistory');
    }
});

function populateSearchHistory() {
    const searchHistorySection = document.getElementById('searchHistory');
    const ul = searchHistorySection.querySelector('ul') || document.createElement('ul');

    searchHistory.forEach(city => {
        const li = document.createElement('li');
        li.textContent = city;

        li.addEventListener('click', async () => {
            const { weather, forecast } = await getWeatherAndForecastData(city);
            displayCurrentWeather(weather);
            displayForecast(forecast);
        });

        ul.appendChild(li);
    });

    searchHistorySection.appendChild(ul);
}

populateSearchHistory();