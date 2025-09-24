const express = require('express');
const axios = require('axios');
const router = express.Router();

// Weather API configuration (using OpenWeatherMap - free tier)
const WEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || 'demo_key'; // In production, use environment variable
const WEATHER_API_BASE = 'https://api.openweathermap.org/data/2.5';

// Get current weather conditions that affect safety
router.get('/current/:lat/:lng', async (req, res) => {
  try {
    const { lat, lng } = req.params;
    
    // For demo purposes, we'll use a mock weather API response
    // In production, uncomment the real API call below
    
    /*
    const response = await axios.get(`${WEATHER_API_BASE}/weather`, {
      params: {
        lat: lat,
        lon: lng,
        appid: WEATHER_API_KEY,
        units: 'metric'
      }
    });
    const weatherData = response.data;
    */
    
    // Mock weather data for demo
    const weatherData = {
      main: {
        temp: 28 + Math.random() * 10, // 28-38°C
        feels_like: 32 + Math.random() * 8,
        humidity: 60 + Math.random() * 30,
        pressure: 1010 + Math.random() * 20
      },
      weather: [
        {
          main: ['Clear', 'Clouds', 'Rain', 'Haze'][Math.floor(Math.random() * 4)],
          description: 'partly cloudy',
          icon: '02d'
        }
      ],
      visibility: 8000 + Math.random() * 2000,
      wind: {
        speed: Math.random() * 15,
        deg: Math.random() * 360
      },
      dt: Math.floor(Date.now() / 1000),
      name: 'Current Location'
    };
    
    // Assess safety impact based on weather
    const safetyAssessment = assessWeatherSafety(weatherData);
    
    res.json({
      success: true,
      weather: weatherData,
      safety: safetyAssessment,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching weather:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weather data',
      error: error.message
    });
  }
});

// Get weather alerts and warnings
router.get('/alerts/:lat/:lng', async (req, res) => {
  try {
    const { lat, lng } = req.params;
    
    // Mock weather alerts for demo
    const alerts = [];
    
    // Randomly generate some alerts for demonstration
    if (Math.random() > 0.7) {
      alerts.push({
        id: 'heat_wave_' + Date.now(),
        title: 'Heat Wave Warning',
        description: 'Extreme temperatures expected. Stay hydrated and avoid prolonged outdoor exposure.',
        severity: 'moderate',
        start: new Date().toISOString(),
        end: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        type: 'heat'
      });
    }
    
    if (Math.random() > 0.8) {
      alerts.push({
        id: 'air_quality_' + Date.now(),
        title: 'Poor Air Quality',
        description: 'Air pollution levels are high. Consider wearing a mask outdoors.',
        severity: 'minor',
        start: new Date().toISOString(),
        end: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
        type: 'air_quality'
      });
    }
    
    res.json({
      success: true,
      alerts: alerts,
      count: alerts.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching weather alerts:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weather alerts',
      error: error.message
    });
  }
});

// Assess safety impact of weather conditions
function assessWeatherSafety(weatherData) {
  const safety = {
    overall_risk: 'low',
    warnings: [],
    recommendations: []
  };
  
  const temp = weatherData.main.temp;
  const humidity = weatherData.main.humidity;
  const visibility = weatherData.visibility;
  const windSpeed = weatherData.wind.speed;
  const condition = weatherData.weather[0].main.toLowerCase();
  
  // Temperature safety assessment
  if (temp > 35) {
    safety.overall_risk = 'high';
    safety.warnings.push('Extreme heat warning');
    safety.recommendations.push('Stay hydrated and seek shade frequently');
  } else if (temp < 5) {
    safety.overall_risk = 'moderate';
    safety.warnings.push('Cold weather alert');
    safety.recommendations.push('Dress warmly and be careful of icy conditions');
  }
  
  // Visibility assessment
  if (visibility < 1000) {
    safety.overall_risk = 'high';
    safety.warnings.push('Poor visibility conditions');
    safety.recommendations.push('Exercise extreme caution when walking or driving');
  } else if (visibility < 5000) {
    safety.overall_risk = safety.overall_risk === 'high' ? 'high' : 'moderate';
    safety.warnings.push('Reduced visibility');
    safety.recommendations.push('Be extra careful in traffic');
  }
  
  // Weather condition assessment
  if (condition.includes('rain') || condition.includes('storm')) {
    safety.overall_risk = 'moderate';
    safety.warnings.push('Wet weather conditions');
    safety.recommendations.push('Carry an umbrella and watch for slippery surfaces');
  }
  
  // Wind assessment
  if (windSpeed > 15) {
    safety.overall_risk = safety.overall_risk === 'high' ? 'high' : 'moderate';
    safety.warnings.push('Strong winds');
    safety.recommendations.push('Be cautious of falling objects and debris');
  }
  
  // High humidity with high temperature
  if (temp > 30 && humidity > 80) {
    safety.warnings.push('High heat index');
    safety.recommendations.push('Take frequent breaks in air-conditioned areas');
  }
  
  return safety;
}

module.exports = router;