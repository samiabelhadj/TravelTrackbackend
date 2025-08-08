const express = require("express");
const { body } = require("express-validator");
const weatherController = require("../controllers/weatherController");

const router = express.Router();

// @desc    Get current weather
// @route   GET /api/weather/current
// @access  Public
router.get("/current", weatherController.getCurrentWeather);

// @desc    Get weather forecast
// @route   GET /api/weather/forecast
// @access  Public
router.get("/forecast", weatherController.getWeatherForecast);

// @desc    Get weather alerts
// @route   GET /api/weather/alerts
// @access  Public
router.get("/alerts", weatherController.getWeatherAlerts);

// @desc    Get weather recommendations
// @route   GET /api/weather/recommendations
// @access  Public
router.get("/recommendations", weatherController.getWeatherRecommendations);

module.exports = router;
 