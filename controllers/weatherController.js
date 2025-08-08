const axios = require("axios");
const { validationResult } = require("express-validator");

// Get current weather
exports.getCurrentWeather = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { city, country, lat, lon } = req.query;
    let url = `https://api.openweathermap.org/data/2.5/weather?appid=${process.env.WEATHER_API_KEY}&units=metric`;
    if (lat && lon) {
      url += `&lat=${lat}&lon=${lon}`;
    } else if (city) {
      url += `&q=${city}${country ? `,${country}` : ""}`;
    } else {
      return res
        .status(400)
        .json({
          success: false,
          message: "Please provide either city or coordinates (lat, lon)",
        });
    }
    const response = await axios.get(url);
    const weatherData = {
      location: {
        name: response.data.name,
        country: response.data.sys.country,
        coordinates: {
          lat: response.data.coord.lat,
          lon: response.data.coord.lon,
        },
      },
      current: {
        temperature: response.data.main.temp,
        feels_like: response.data.main.feels_like,
        humidity: response.data.main.humidity,
        pressure: response.data.main.pressure,
        description: response.data.weather[0].description,
        icon: response.data.weather[0].icon,
        wind_speed: response.data.wind.speed,
        wind_direction: response.data.wind.deg,
        visibility: response.data.visibility,
        sunrise: new Date(response.data.sys.sunrise * 1000),
        sunset: new Date(response.data.sys.sunset * 1000),
      },
    };
    res.status(200).json({ success: true, data: weatherData });
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res
        .status(404)
        .json({ success: false, message: "Location not found" });
    }
    next(error);
  }
};

// Get weather forecast
exports.getWeatherForecast = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { city, country, lat, lon, days = 7 } = req.query;
    let url = `https://api.openweathermap.org/data/2.5/forecast?appid=${process.env.WEATHER_API_KEY}&units=metric`;
    if (lat && lon) {
      url += `&lat=${lat}&lon=${lon}`;
    } else if (city) {
      url += `&q=${city}${country ? `,${country}` : ""}`;
    } else {
      return res
        .status(400)
        .json({
          success: false,
          message: "Please provide either city or coordinates (lat, lon)",
        });
    }
    const response = await axios.get(url);
    const forecastData = processForecastData(response.data, parseInt(days));
    res.status(200).json({ success: true, data: forecastData });
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res
        .status(404)
        .json({ success: false, message: "Location not found" });
    }
    next(error);
  }
};

// Get weather alerts
exports.getWeatherAlerts = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { city, country, lat, lon } = req.query;
    let url = `https://api.openweathermap.org/data/2.5/onecall?appid=${process.env.WEATHER_API_KEY}&exclude=current,minutely,hourly,daily`;
    if (lat && lon) {
      url += `&lat=${lat}&lon=${lon}`;
    } else {
      return res
        .status(400)
        .json({
          success: false,
          message: "Please provide coordinates (lat, lon) for weather alerts",
        });
    }
    const response = await axios.get(url);
    const alerts = response.data.alerts || [];
    const alertData = alerts.map((alert) => ({
      event: alert.event,
      description: alert.description,
      start: new Date(alert.start * 1000),
      end: new Date(alert.end * 1000),
      severity: alert.tags[0] || "Unknown",
    }));
    res
      .status(200)
      .json({
        success: true,
        data: { alerts: alertData, count: alertData.length },
      });
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res
        .status(404)
        .json({ success: false, message: "Location not found" });
    }
    next(error);
  }
};

// Get weather recommendations
exports.getWeatherRecommendations = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { city, country, lat, lon, activities } = req.query;
    let url = `https://api.openweathermap.org/data/2.5/weather?appid=${process.env.WEATHER_API_KEY}&units=metric`;
    if (lat && lon) {
      url += `&lat=${lat}&lon=${lon}`;
    } else if (city) {
      url += `&q=${city}${country ? `,${country}` : ""}`;
    } else {
      return res
        .status(400)
        .json({
          success: false,
          message: "Please provide either city or coordinates (lat, lon)",
        });
    }
    const response = await axios.get(url);
    const weather = response.data;
    const recommendations = generateWeatherRecommendations(weather, activities);
    res.status(200).json({ success: true, data: recommendations });
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res
        .status(404)
        .json({ success: false, message: "Location not found" });
    }
    next(error);
  }
};

// Helper function to process forecast data
function processForecastData(data, days) {
  const dailyData = {};
  const location = {
    name: data.city.name,
    country: data.city.country,
    coordinates: {
      lat: data.city.coord.lat,
      lon: data.city.coord.lon,
    },
  };
  data.list.forEach((item) => {
    const date = new Date(item.dt * 1000).toDateString();
    if (!dailyData[date]) {
      dailyData[date] = {
        date: new Date(item.dt * 1000),
        temp_min: item.main.temp_min,
        temp_max: item.main.temp_max,
        humidity: item.main.humidity,
        pressure: item.main.pressure,
        description: item.weather[0].description,
        icon: item.weather[0].icon,
        wind_speed: item.wind.speed,
        wind_direction: item.wind.deg,
        pop: item.pop * 100, // Probability of precipitation
        hourly: [],
      };
    }
    dailyData[date].hourly.push({
      time: new Date(item.dt * 1000),
      temperature: item.main.temp,
      description: item.weather[0].description,
      icon: item.weather[0].icon,
      humidity: item.main.humidity,
      wind_speed: item.wind.speed,
      pop: item.pop * 100,
    });
    // Update min/max temperatures
    if (item.main.temp_min < dailyData[date].temp_min) {
      dailyData[date].temp_min = item.main.temp_min;
    }
    if (item.main.temp_max > dailyData[date].temp_max) {
      dailyData[date].temp_max = item.main.temp_max;
    }
  });
  const forecast = Object.values(dailyData).slice(0, days);
  return { location, forecast };
}

// Helper function to generate weather recommendations
function generateWeatherRecommendations(weather, activities) {
  const temp = weather.main.temp;
  const description = weather.weather[0].description.toLowerCase();
  const windSpeed = weather.wind.speed;
  const humidity = weather.main.humidity;
  const recommendations = {
    general: [],
    activities: [],
    clothing: [],
    precautions: [],
  };
  // Temperature-based recommendations
  if (temp < 10) {
    recommendations.clothing.push("Wear warm clothing, jacket, and gloves");
    recommendations.activities.push("Indoor activities recommended");
    if (temp < 0) {
      recommendations.precautions.push(
        "Be careful of ice and slippery conditions"
      );
    }
  } else if (temp > 25) {
    recommendations.clothing.push("Wear light, breathable clothing");
    recommendations.activities.push(
      "Stay hydrated and avoid strenuous outdoor activities during peak hours"
    );
    recommendations.precautions.push(
      "Use sunscreen and stay in shade when possible"
    );
  } else {
    recommendations.clothing.push(
      "Comfortable clothing suitable for moderate temperatures"
    );
    recommendations.activities.push("Good weather for outdoor activities");
  }
  // Weather condition-based recommendations
  if (description.includes("rain")) {
    recommendations.clothing.push("Bring umbrella or rain jacket");
    recommendations.activities.push(
      "Indoor activities or waterproof gear needed"
    );
    recommendations.precautions.push("Be careful of wet and slippery surfaces");
  } else if (description.includes("snow")) {
    recommendations.clothing.push("Wear warm, waterproof clothing and boots");
    recommendations.activities.push("Winter sports activities available");
    recommendations.precautions.push(
      "Be careful of icy conditions and reduced visibility"
    );
  } else if (description.includes("cloud")) {
    recommendations.activities.push(
      "Good for outdoor activities with moderate sun exposure"
    );
  } else if (description.includes("clear") || description.includes("sunny")) {
    recommendations.activities.push("Excellent weather for outdoor activities");
    recommendations.precautions.push("Use sunscreen and stay hydrated");
  }
  // Wind-based recommendations
  if (windSpeed > 20) {
    recommendations.precautions.push(
      "High winds - secure loose objects and be careful of flying debris"
    );
    recommendations.activities.push(
      "Avoid outdoor activities that require stability"
    );
  }
  // Humidity-based recommendations
  if (humidity > 80) {
    recommendations.clothing.push("Wear moisture-wicking clothing");
    recommendations.precautions.push(
      "High humidity - stay hydrated and take breaks"
    );
  }
  // Activity-specific recommendations
  if (activities) {
    const activityList = activities.split(",");
    activityList.forEach((activity) => {
      const trimmedActivity = activity.trim().toLowerCase();
      if (
        trimmedActivity.includes("hiking") ||
        trimmedActivity.includes("walking")
      ) {
        if (temp < 10 || temp > 30) {
          recommendations.activities.push(
            "Consider indoor alternatives or adjust timing"
          );
        }
        if (description.includes("rain") || description.includes("snow")) {
          recommendations.activities.push(
            "Hiking not recommended due to weather conditions"
          );
        }
      } else if (
        trimmedActivity.includes("beach") ||
        trimmedActivity.includes("swimming")
      ) {
        if (temp < 20) {
          recommendations.activities.push(
            "Beach activities not recommended due to cold weather"
          );
        }
        if (description.includes("rain") || description.includes("storm")) {
          recommendations.activities.push(
            "Avoid beach activities due to weather conditions"
          );
        }
      } else if (
        trimmedActivity.includes("cycling") ||
        trimmedActivity.includes("biking")
      ) {
        if (windSpeed > 15) {
          recommendations.activities.push(
            "Cycling may be difficult due to strong winds"
          );
        }
        if (description.includes("rain") || description.includes("snow")) {
          recommendations.activities.push(
            "Cycling not recommended due to weather conditions"
          );
        }
      }
    });
  }
  return recommendations;
}
