
<template>
  <div class="container">
    <div class="header">
      <h1>WEATHER APP</h1>

      <div class="search-bar">
        <input
          type="text"
          v-model="city"
          placeholder="Enter city name"
          class="search-input"
          @keyup.enter="searchByCity"
        />

        <button
          @click="searchByCity"
          class="search-button"
          :disabled="loading"
        >
          {{ loading ? "Loading..." : "Search" }}
        </button>
      </div>
    </div>

    <!-- Display error messages -->
    <p v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </p>

    <!-- Main weather content -->
    <main>
      <div v-if="weatherData">
        <h2>
          {{ weatherData.name }},
          {{ weatherData.sys.country }}
        </h2>

        <div>
          <img :src="iconUrl" alt="Weather Icon" />

          <p>{{ temperature }} °C</p>
        </div>

        <span>
          {{ weatherData.weather[0].description }}
        </span>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";

// OpenWeatherMap API key from Vite environment variable
const apikey = import.meta.env.VITE_WEATHER_API_KEY;

// OpenWeatherMap endpoint
const WEATHER_API_URL =
  "https://api.openweathermap.org/data/2.5/weather";

// Reactive state
const city = ref("");
const weatherData = ref(null);
const loading = ref(false);
const errorMessage = ref("");

// Temperature is already in Celsius because units=metric
const temperature = computed(() => {
  return weatherData.value
    ? Math.floor(weatherData.value.main.temp)
    : null;
});

// Weather icon URL
const iconUrl = computed(() => {
  return weatherData.value
    ? `https://openweathermap.org/img/wn/${weatherData.value.weather[0].icon}@2x.png`
    : null;
});

// Fetch weather information from OpenWeatherMap
const fetchWeatherData = async (params) => {
  if (!apikey) {
    errorMessage.value = "Weather API key is not configured.";
    return;
  }

  loading.value = true;
  errorMessage.value = "";
  weatherData.value = null;

  try {
    const response = await axios.get(WEATHER_API_URL, {
      params: {
        ...params,
        appid: apikey,
        units: "metric",
      },
    });

    weatherData.value = response.data;
  } catch (error) {
    const status = error.response?.status;

    console.error(
      "Weather API error:",
      status,
      error.response?.data?.message
    );

    if (status === 401) {
      errorMessage.value =
        "Invalid or inactive API key.";
    } else if (status === 404) {
      errorMessage.value =
        "City not found. Please try another city.";
    } else if (status === 429) {
      errorMessage.value =
        "Too many requests. Please try again later.";
    } else {
      errorMessage.value =
        "Unable to fetch weather information.";
    }
  } finally {
    loading.value = false;
  }
};

// Search weather by city
const searchByCity = async () => {
  const cityName = city.value.trim();

  if (!cityName) {
    errorMessage.value = "Please enter a city name.";
    return;
  }

  // OpenWeatherMap requires q, not city
  await fetchWeatherData({
    q: cityName,
  });
};

// Fetch weather using current location
const fetchCurrentLocationWeather = () => {
  if (!navigator.geolocation) {
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;

      await fetchWeatherData({
        lat: latitude,
        lon: longitude,
      });
    },
    (error) => {
      console.error(
        "Error getting current location:",
        error.message
      );
    }
  );
};

// Fetch current-location weather on page load
onMounted(() => {
  fetchCurrentLocationWeather();
});
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 30px;
}

.header {
  text-align: center;
}

.header h1 {
  margin-bottom: 20px;
}

.search-bar {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 30px;
}

.search-input {
  padding: 10px;
  width: 250px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.search-button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.search-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: #dc3545;
  margin: 15px 0;
}

main {
  text-align: center;
}

main img {
  width: 100px;
  height: 100px;
}

main p {
  font-size: 24px;
  font-weight: bold;
}

main span {
  text-transform: capitalize;
  font-size: 18px;
}
</style>
