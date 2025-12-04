// =========================
//  Weather App – Script
// =========================

// OpenWeatherMap configuration
const API_KEY = "8782ee8fef993f9d9c26d36a70db1bdd";
const API_BASE = "https://api.openweathermap.org/data/2.5";

// State
let isDarkMode = false;

// DOM Elements
const themeToggle = document.getElementById("themeToggle");
const sunIcon = document.getElementById("sunIcon");
const moonIcon = document.getElementById("moonIcon");

const landingPage = document.getElementById("landingPage");
const weatherContainer = document.getElementById("weatherContainer");
const loadingState = document.getElementById("loadingState");

const searchFormLanding = document.getElementById("searchFormLanding");
const searchForm = document.getElementById("searchForm");
const cityInputLanding = document.getElementById("cityInputLanding");
const cityInput = document.getElementById("cityInput");

// =========================
//  INIT
// =========================

document.addEventListener("DOMContentLoaded", () => {
  generateStars();
  generateLightParticles();

  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }

  if (searchFormLanding) {
    searchFormLanding.addEventListener("submit", handleSearchFromLanding);
  }

  if (searchForm) {
    searchForm.addEventListener("submit", handleSearchFromMain);
  }
});

// =========================
//  THEME TOGGLE
// =========================

function toggleTheme() {
  isDarkMode = !isDarkMode;
  document.body.classList.toggle("dark-mode", isDarkMode);

  if (isDarkMode) {
    sunIcon.classList.add("hidden");
    moonIcon.classList.remove("hidden");
  } else {
    sunIcon.classList.remove("hidden");
    moonIcon.classList.add("hidden");
  }
}

// =========================
//  BACKGROUND EFFECTS
// =========================

function generateStars() {
  const starsContainer = document.querySelector(".stars-container");
  if (!starsContainer) return;

  for (let i = 0; i < 100; i++) {
    const star = document.createElement("div");
    star.className = "star";
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    const size = Math.random() * 3 + 1;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.animationDuration = `${Math.random() * 3 + 2}s`;
    star.style.animationDelay = `${Math.random() * 3}s`;
    starsContainer.appendChild(star);
  }
}

function generateLightParticles() {
  const particlesContainer = document.querySelector(".light-particles");
  if (!particlesContainer) return;

  for (let i = 0; i < 15; i++) {
    const p = document.createElement("div");
    p.style.position = "absolute";
    p.style.borderRadius = "50%";
    p.style.background = "#fef3c7";
    p.style.opacity = "0.3";

    const size = Math.random() * 8 + 4;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.left = `${Math.random() * 100}%`;
    p.style.top = `${Math.random() * 100}%`;
    p.style.animation = `float ${Math.random() * 10 + 10}s ease-in-out infinite`;
    p.style.animationDelay = `${Math.random() * 5}s`;

    particlesContainer.appendChild(p);
  }

  // float keyframes (once, globally)
  const style = document.createElement("style");
  style.textContent = `
    @keyframes float {
      0%, 100% {
        transform: translateY(0) translateX(0);
      }
      50% {
        transform: translateY(-20px) translateX(10px);
      }
    }
  `;
  document.head.appendChild(style);
}

// =========================
//  SEARCH HANDLERS
// =========================

function handleSearchFromLanding(e) {
  e.preventDefault();
  const city = cityInputLanding.value.trim();
  if (city) {
    fetchWeatherData(city);
  }
}

function handleSearchFromMain(e) {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (city) {
    fetchWeatherData(city);
  }
}

// =========================
//  API CALLS
// =========================

async function fetchWeatherData(city) {
  try {
    showLoading();

    // Current weather
    const currentRes = await fetch(
      `${API_BASE}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
    );
    if (!currentRes.ok) {
      throw new Error("City not found");
    }
    const currentData = await currentRes.json();

    // Forecast (3-hourly)
    const forecastRes = await fetch(
      `${API_BASE}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
    );
    if (!forecastRes.ok) {
      throw new Error("Could not fetch forecast");
    }
    const forecastData = await forecastRes.json();

    displayWeather({
      current: currentData,
      forecast: forecastData,
    });

    if (cityInputLanding) cityInputLanding.value = "";
    if (cityInput) cityInput.value = "";
  } catch (err) {
    console.error(err);
    loadingState.classList.add("hidden");
    alert(err.message || "Something went wrong. Please try again.");
  }
}

// =========================
//  UI HELPERS
// =========================

function showLoading() {
  landingPage.classList.add("hidden");
  weatherContainer.classList.add("hidden");
  loadingState.classList.remove("hidden");
}

function displayWeather({ current, forecast }) {
  loadingState.classList.add("hidden");
  landingPage.classList.add("hidden");
  weatherContainer.classList.remove("hidden");

  displayCurrentWeather(current);
  displayDailyForecast(forecast);
  displayHourlyChart(forecast);
  displayMetrics(current);
}

// -------------------------
//  CURRENT WEATHER
// -------------------------

function displayCurrentWeather(data) {
  const cityName = document.getElementById("cityName");
  const localTime = document.getElementById("localTime");
  const currentTemp = document.getElementById("currentTemp");
  const weatherMain = document.getElementById("weatherMain");
  const tempRange = document.getElementById("tempRange");
  const weatherIcon = document.getElementById("weatherIcon");

  cityName.textContent = `${data.name}, ${data.sys.country}`;

  const now = new Date();
  localTime.textContent =
    now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }) + " • Updated just now";

  currentTemp.textContent = Math.round(data.main.temp);
  weatherMain.textContent = data.weather[0].main;
  tempRange.textContent = `H ${Math.round(
    data.main.temp_max
  )}° L ${Math.round(data.main.temp_min)}°`;

  weatherIcon.innerHTML = getWeatherIconSVG(data.weather[0].main, "large");
}

// -------------------------
//  DAILY FORECAST (7 days)
// -------------------------

function displayDailyForecast(forecast) {
  const dailyForecastEl = document.getElementById("dailyForecast");
  dailyForecastEl.innerHTML = "";

  const dailyMap = {};

  forecast.list.forEach((item) => {
    const date = new Date(item.dt * 1000);
    const dayKey = date.toDateString();

    if (!dailyMap[dayKey]) {
      dailyMap[dayKey] = {
        date,
        temps: [item.main.temp],
        weather: item.weather[0],
      };
    } else {
      dailyMap[dayKey].temps.push(item.main.temp);
    }
  });

  const days = Object.values(dailyMap).slice(0, 7);

  days.forEach((day, index) => {
    const dayEl = document.createElement("div");
    dayEl.className = "forecast-day";

    const maxTemp = Math.max(...day.temps);
    const minTemp = Math.min(...day.temps);

    const dayName =
      index === 0
        ? "Today"
        : day.date.toLocaleDateString("en-US", { weekday: "short" });

    dayEl.innerHTML = `
      <div class="forecast-day-name">${dayName}</div>
      <div class="forecast-icon">
        ${getWeatherIconSVG(day.weather.main, "small")}
      </div>
      <div class="forecast-temp-max">${Math.round(maxTemp)}°</div>
      <div class="forecast-temp-min">${Math.round(minTemp)}°</div>
    `;

    dailyForecastEl.appendChild(dayEl);
  });
}

// -------------------------
//  HOURLY CHART (next 8)
// -------------------------

function displayHourlyChart(forecast) {
  const canvas = document.getElementById("hourlyChart");
  const labelsContainer = document.getElementById("hourlyLabels");
  if (!canvas || !labelsContainer) return;

  const ctx = canvas.getContext("2d");
  labelsContainer.innerHTML = "";

  const hourlyData = forecast.list.slice(0, 8).map((item) => {
    const date = new Date(item.dt * 1000);
    const hours = date.getHours();
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;

    return {
      time: `${displayHours} ${period}`,
      temp: Math.round(item.main.temp),
    };
  });

  // Resize canvas (also clears it)
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = 200 * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const width = rect.width;
  const height = 200;
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const temps = hourlyData.map((d) => d.temp);
  const minTemp = Math.min(...temps) - 2;
  const maxTemp = Math.max(...temps) + 2;
  const tempRange = maxTemp - minTemp || 1;

  const points = hourlyData.map((d, i) => {
    const x = padding + (chartWidth / (hourlyData.length - 1)) * i;
    const y =
      padding +
      chartHeight -
      ((d.temp - minTemp) / tempRange) * chartHeight;
    return { x, y, temp: d.temp };
  });

  // Gradient area
  const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
  if (isDarkMode) {
    gradient.addColorStop(0, "rgba(96, 165, 250, 0.3)");
    gradient.addColorStop(1, "rgba(96, 165, 250, 0)");
  } else {
    gradient.addColorStop(0, "rgba(245, 158, 11, 0.3)");
    gradient.addColorStop(1, "rgba(245, 158, 11, 0)");
  }

  // Area fill
  ctx.beginPath();
  ctx.moveTo(points[0].x, height - padding);
  points.forEach((p) => ctx.lineTo(p.x, p.y));
  ctx.lineTo(points[points.length - 1].x, height - padding);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  // Line
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  points.forEach((p) => ctx.lineTo(p.x, p.y));
  ctx.lineWidth = 3;
  ctx.strokeStyle = isDarkMode ? "#60a5fa" : "#f59e0b";
  ctx.stroke();

  // Points
  points.forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = isDarkMode ? "#60a5fa" : "#f59e0b";
    ctx.fill();
  });

  // Labels under chart
  hourlyData.forEach((d) => {
    const label = document.createElement("div");
    label.className = "hourly-label";
    label.innerHTML = `<div>${d.time}</div><div>${d.temp}°</div>`;
    labelsContainer.appendChild(label);
  });
}

// -------------------------
//  METRICS (right column)
// -------------------------

function displayMetrics(current) {
  const metricsGrid = document.getElementById("metricsGrid");
  if (!metricsGrid) return;

  metricsGrid.innerHTML = "";

  const visibilityKm = (current.visibility / 1000).toFixed(1);
  const windSpeed = Math.round(current.wind.speed * 3.6); // m/s → km/h
  const windDirection = getWindDirection(current.wind.deg);
  const pressure = current.main.pressure;
  const humidity = current.main.humidity;

  const sunrise = new Date(current.sys.sunrise * 1000);
  const sunset = new Date(current.sys.sunset * 1000);

  const metrics = [
    {
      icon: getIconSVG("eye"),
      title: "Visibility",
      value: `${visibilityKm} km`,
      subtitle: "Distance you can see",
    },
    {
      icon: getIconSVG("wind"),
      title: "Wind",
      value: `${windSpeed} km/h`,
      subtitle: windDirection,
    },
    {
      icon: getIconSVG("gauge"),
      title: "Pressure",
      value: `${pressure} mb`,
      subtitle: "Atmospheric pressure",
    },
    {
      icon: getIconSVG("droplets"),
      title: "Humidity",
      value: `${humidity}%`,
      subtitle:
        humidity > 70 ? "High" : humidity > 40 ? "Comfortable" : "Dry",
    },
    {
      icon: getIconSVG("sunrise"),
      title: "Sunrise",
      value: sunrise.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      subtitle: "",
    },
    {
      icon: getIconSVG("sunset"),
      title: "Sunset",
      value: sunset.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      subtitle: "",
    },
  ];

  metrics.forEach((m) => {
    const card = document.createElement("div");
    card.className = "metric-card";
    card.innerHTML = `
      <div class="metric-header">
        <div class="metric-title-wrapper">
          <div class="metric-icon">${m.icon}</div>
          <span class="metric-title">${m.title}</span>
        </div>
      </div>
      <div class="metric-value">${m.value}</div>
      <div class="metric-subtitle">${m.subtitle}</div>
    `;
    metricsGrid.appendChild(card);
  });
}

// =========================
//  ICON HELPERS
// =========================

function getWeatherIconSVG(weatherMain, size) {
  const iconSize = size === "large" ? "96" : "32";
  const weatherType = weatherMain.toLowerCase();

  if (weatherType === "clear") {
    return `
      <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2">
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>
    `;
  }

  if (weatherType.includes("cloud")) {
    return `
      <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2">
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
      </svg>
    `;
  }

  if (weatherType.includes("rain") || weatherType.includes("drizzle")) {
    return `
      <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2">
        <line x1="16" y1="13" x2="16" y2="21"></line>
        <line x1="8" y1="13" x2="8" y2="21"></line>
        <line x1="12" y1="15" x2="12" y2="23"></line>
        <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></path>
      </svg>
    `;
  }

  if (weatherType.includes("snow")) {
    return `
      <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="#e0f2fe" stroke-width="2">
        <path d="M12 2v20M2 12h20"></path>
      </svg>
    `;
  }

  // default (cloudy)
  return `
    <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2">
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
    </svg>
  `;
}

function getIconSVG(name) {
  switch (name) {
    case "eye":
      return `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      `;
    case "wind":
      return `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9.59 4.59A2 2 0 1 1 11 8H2"></path>
          <path d="M17.73 7.73A2.5 2.5 0 1 1 19.5 12H2"></path>
          <path d="M12.41 19.41A2 2 0 1 0 14 16H2"></path>
        </svg>
      `;
    case "gauge":
      return `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="m12 14 4-4"></path>
          <path d="M3.34 19a10 10 0 1 1 17.32 0"></path>
        </svg>
      `;
    case "droplets":
      return `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
        </svg>
      `;
    case "sunrise":
      return `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2v8"></path>
          <path d="m5 12 2-2"></path>
          <path d="m19 12-2-2"></path>
          <path d="M2 20h20"></path>
          <path d="M4 16h16"></path>
          <path d="m8 8 4-4 4 4"></path>
        </svg>
      `;
    case "sunset":
      return `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 10v8"></path>
          <path d="m5 12 2-2"></path>
          <path d="m19 12-2-2"></path>
          <path d="M2 20h20"></path>
          <path d="M4 16h16"></path>
          <path d="m16 6-4-4-4 4"></path>
        </svg>
      `;
    default:
      return "";
  }
}

function getWindDirection(deg) {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(deg / 45) % 8;
  return dirs[index];
}
