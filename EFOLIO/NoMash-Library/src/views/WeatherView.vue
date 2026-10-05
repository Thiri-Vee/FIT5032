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
        />

        <button @click="searchByCity" class="search-button">
          Search
        </button>
      </div>
    </div>

    <!-- Main weather content -->
    <main>
      <!-- Only display weather information when data is available -->
      <div v-if="weatherData">
        <h2>
          {{ weatherData.name }}, {{ weatherData.sys.country }}
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

// Replace this with your OpenWeatherMap API key
const apikey = "c8540a13289356684dc01b01d7662fe7";

// Reactive state
const city = ref("");
const weatherData = ref(null);

// Convert Kelvin temperature to Celsius
const temperature = computed(() => {
  return weatherData.value
    ? Math.floor(weatherData.value.main.temp - 273.15)
    : null;
});

// Get the weather icon URL
const iconUrl = computed(() => {
  return weatherData.value
    ? `https://openweathermap.org/img/wn/${weatherData.value.weather[0].icon}@2x.png`
    : null;
});

// Fetch weather information from OpenWeatherMap
const fetchWeatherData = async (url) => {
  try {
    const response = await axios.get(url);

    weatherData.value = response.data;
  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
};

// Search weather by city
const searchByCity = async () => {
  if (!city.value.trim()) {
    return;
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    city.value
  )}&appid=${apikey}`;

  await fetchWeatherData(url);
};

// Get weather based on the user's current location
const fetchCurrentLocationWeather = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apikey}`;

        await fetchWeatherData(url);
      },
      (error) => {
        console.error("Error getting current location:", error);
      }
    );
  }
};

// Run when the page is first loaded
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