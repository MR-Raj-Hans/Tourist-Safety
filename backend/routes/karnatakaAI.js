const express = require('express');
const router = express.Router();
const karnatakaAPI = require('../services/karnatakaApi');

// Enhanced AI Risk Assessment with Karnataka data
router.post('/ai-risk-assessment', async (req, res) => {
  try {
    const { 
      lat, 
      lng, 
      location, 
      userProfile = {}, 
      travelPlan = {},
      preferences = {} 
    } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({ 
        error: 'Latitude and longitude are required' 
      });
    }

    console.log(`AI Risk Assessment for Karnataka location: ${location} (${lat}, ${lng})`);

    // Fetch Karnataka-specific data in parallel
    const [weatherData, trafficData, incidentData, tourismData] = await Promise.all([
      karnatakaAPI.getWeatherData(lat, lng, location),
      karnatakaAPI.getTrafficData(lat, lng, location),
      karnatakaAPI.getIncidentData(lat, lng, location),
      karnatakaAPI.getTourismSafetyData(lat, lng, location)
    ]);

    // Calculate comprehensive Karnataka risk score
    const riskAssessment = karnatakaAPI.calculateKarnatakaRiskScore(
      weatherData, 
      trafficData, 
      incidentData, 
      tourismData
    );

    // Generate AI insights based on user profile and Karnataka data
    const aiInsights = generateKarnatakaAIInsights(
      weatherData, 
      trafficData, 
      incidentData, 
      tourismData,
      userProfile,
      travelPlan,
      location
    );

    // Create detailed response
    const response = {
      location: {
        name: location,
        coordinates: { lat, lng },
        state: 'Karnataka',
        district: extractKarnatakaDistrict(location)
      },
      riskAssessment: {
        overallScore: riskAssessment.overallScore,
        riskLevel: riskAssessment.riskLevel,
        factors: riskAssessment.factors,
        recommendations: riskAssessment.recommendations
      },
      detailedAnalysis: {
        weather: {
          ...weatherData,
          riskScore: karnatakaAPI.assessWeatherRisk(weatherData),
          karnatakaSpecific: getKarnatakaWeatherInsights(weatherData, location)
        },
        traffic: {
          ...trafficData,
          karnatakaSpecific: getKarnatakaTrafficInsights(trafficData, location)
        },
        safety: {
          ...incidentData,
          karnatakaSpecific: getKarnatakaSafetyInsights(incidentData, location)
        },
        tourism: {
          ...tourismData,
          karnatakaSpecific: getKarnatakaTourismInsights(tourismData, location)
        }
      },
      aiInsights: aiInsights,
      alerts: generateKarnatakaAlerts(weatherData, trafficData, incidentData, location),
      localInfo: getKarnatakaLocalInfo(location),
      timestamp: new Date().toISOString()
    };

    res.json(response);

  } catch (error) {
    console.error('Error in Karnataka AI risk assessment:', error);
    res.status(500).json({ 
      error: 'Failed to perform AI risk assessment',
      message: error.message 
    });
  }
});

// Get real-time Karnataka updates
router.get('/karnataka-updates/:location', async (req, res) => {
  try {
    const { location } = req.params;
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ 
        error: 'Latitude and longitude are required' 
      });
    }

    // Get latest updates for Karnataka location
    const [weatherUpdate, trafficUpdate, incidentUpdate] = await Promise.all([
      karnatakaAPI.getWeatherData(lat, lng, location),
      karnatakaAPI.getTrafficData(lat, lng, location),
      karnatakaAPI.getIncidentData(lat, lng, location)
    ]);

    const updates = {
      location: location,
      lastUpdated: new Date().toISOString(),
      weather: {
        current: weatherUpdate,
        alerts: weatherUpdate.riskFactors || []
      },
      traffic: {
        current: trafficUpdate,
        congestion: trafficUpdate.congestionLevel,
        incidents: trafficUpdate.accidents || []
      },
      safety: {
        recentIncidents: incidentUpdate.incidents || [],
        riskLevel: incidentUpdate.riskScore < 30 ? 'Low' : 
                  incidentUpdate.riskScore < 60 ? 'Medium' : 'High'
      },
      quickRecommendations: generateQuickRecommendations(weatherUpdate, trafficUpdate, incidentUpdate)
    };

    res.json(updates);

  } catch (error) {
    console.error('Error fetching Karnataka updates:', error);
    res.status(500).json({ 
      error: 'Failed to fetch updates',
      message: error.message 
    });
  }
});

// Get Karnataka district-specific information
router.get('/karnataka-districts/:district', async (req, res) => {
  try {
    const { district } = req.params;
    
    const districtInfo = getKarnatakaDistrictInfo(district);
    
    res.json({
      district: district,
      info: districtInfo,
      touristSpots: getDistrictTouristSpots(district),
      safetyTips: getDistrictSafetyTips(district),
      emergencyContacts: getDistrictEmergencyContacts(district),
      localTransport: getDistrictTransportInfo(district)
    });

  } catch (error) {
    console.error('Error fetching district info:', error);
    res.status(500).json({ 
      error: 'Failed to fetch district information',
      message: error.message 
    });
  }
});

// Helper functions for AI insights
function generateKarnatakaAIInsights(weatherData, trafficData, incidentData, tourismData, userProfile, travelPlan, location) {
  const insights = [];

  // Weather-based insights
  if (weatherData.temperature > 35) {
    insights.push({
      type: 'weather_warning',
      priority: 'high',
      message: `Extreme heat expected in ${location}. Carry water and avoid midday outdoor activities.`,
      recommendation: 'Plan indoor activities during 11 AM - 4 PM'
    });
  }

  // Traffic insights
  if (trafficData.congestionLevel === 'heavy') {
    insights.push({
      type: 'traffic_advisory',
      priority: 'medium',
      message: `Heavy traffic expected in ${location}. Consider using public transport.`,
      recommendation: location.toLowerCase().includes('bangalore') ? 
        'Use Namma Metro or BMTC buses' : 'Use local bus services'
    });
  }

  // Safety insights
  if (incidentData.riskScore > 60) {
    insights.push({
      type: 'safety_alert',
      priority: 'high',
      message: `Recent safety incidents reported in ${location} area.`,
      recommendation: 'Stay in well-lit, crowded areas and keep emergency contacts ready'
    });
  }

  // Tourism insights
  if (tourismData.riskScore < 30) {
    insights.push({
      type: 'tourism_opportunity',
      priority: 'low',
      message: `Good conditions for sightseeing in ${location}.`,
      recommendation: 'Great time to explore local attractions'
    });
  }

  // Location-specific insights
  if (location.toLowerCase().includes('bangalore')) {
    insights.push({
      type: 'local_tip',
      priority: 'low',
      message: 'Bangalore traffic is heavy during peak hours (8-10 AM, 6-9 PM).',
      recommendation: 'Plan your travel outside peak hours or use Metro'
    });
  }

  return insights;
}

function generateKarnatakaAlerts(weatherData, trafficData, incidentData, location) {
  const alerts = [];

  // Critical weather alerts
  if (weatherData.riskFactors && weatherData.riskFactors.length > 0) {
    weatherData.riskFactors.forEach(factor => {
      if (factor.severity === 'high') {
        alerts.push({
          type: 'weather',
          level: 'critical',
          message: factor.message,
          action: 'Take immediate precautions'
        });
      }
    });
  }

  // Traffic alerts
  if (trafficData.accidents && trafficData.accidents.length > 0) {
    alerts.push({
      type: 'traffic',
      level: 'warning',
      message: `${trafficData.accidents.length} traffic incidents reported in ${location}`,
      action: 'Use alternative routes'
    });
  }

  // Safety alerts
  if (incidentData.incidents && incidentData.incidents.length > 0) {
    const highSeverityIncidents = incidentData.incidents.filter(inc => inc.severity === 'high');
    if (highSeverityIncidents.length > 0) {
      alerts.push({
        type: 'safety',
        level: 'critical',
        message: `${highSeverityIncidents.length} serious incidents reported recently`,
        action: 'Exercise extra caution'
      });
    }
  }

  return alerts;
}

function getKarnatakaLocalInfo(location) {
  const info = {
    emergency: {
      police: '100',
      fire: '101',
      ambulance: '108',
      touristHelpline: '1363',
      karnatakaPolice: '0832-2424020'
    },
    language: {
      primary: 'Kannada',
      commonPhrases: {
        'Hello': 'Namaskara',
        'Thank you': 'Dhanyavaadagalu',
        'Help': 'Sahayavagalu',
        'Where is...?': 'Elli ide...?',
        'How much?': 'Estu?'
      }
    },
    currency: 'Indian Rupee (INR)',
    timeZone: 'IST (UTC+5:30)'
  };

  // Location-specific additions
  if (location.toLowerCase().includes('bangalore')) {
    info.transport = {
      metro: 'Namma Metro',
      bus: 'BMTC',
      auto: 'Available (use meter)',
      taxi: 'Ola/Uber available'
    };
  }

  return info;
}

// Additional helper functions
function extractKarnatakaDistrict(location) {
  const districts = [
    'Bangalore Urban', 'Bangalore Rural', 'Mysore', 'Mandya', 'Hassan', 'Tumkur',
    'Kolar', 'Chikkaballapura', 'Chitradurga', 'Davanagere', 'Shimoga', 'Belagavi'
  ];
  
  return districts.find(district => 
    location.toLowerCase().includes(district.toLowerCase())
  ) || 'Unknown District';
}

function getKarnatakaWeatherInsights(weatherData, location) {
  const insights = [];
  
  if (location.toLowerCase().includes('coastal')) {
    if (weatherData.humidity > 80) {
      insights.push('High humidity typical for coastal Karnataka - stay hydrated');
    }
  }
  
  if (weatherData.temperature > 30 && location.toLowerCase().includes('bangalore')) {
    insights.push('Warmer than usual for Bangalore - summer heat advisory');
  }
  
  return insights;
}

function getKarnatakaTrafficInsights(trafficData, location) {
  const insights = [];
  
  if (location.toLowerCase().includes('bangalore')) {
    insights.push('Bangalore traffic is notorious - plan extra time');
    insights.push('Consider using Namma Metro for faster travel');
  }
  
  if (trafficData.congestionLevel === 'heavy') {
    insights.push('Peak hour traffic detected - consider alternative timing');
  }
  
  return insights;
}

function getKarnatakaSafetyInsights(incidentData, location) {
  const insights = [];
  
  insights.push('Karnataka is generally safe for tourists');
  insights.push('Keep emergency contacts handy');
  
  if (incidentData.riskScore > 50) {
    insights.push('Recent incidents reported - exercise extra caution');
  }
  
  return insights;
}

function getKarnatakaTourismInsights(tourismData, location) {
  const insights = [];
  
  if (location.toLowerCase().includes('hampi')) {
    insights.push('UNESCO World Heritage Site - respect historical monuments');
  }
  
  if (location.toLowerCase().includes('coorg')) {
    insights.push('Hill station - weather can change quickly');
  }
  
  insights.push('Karnataka rich in heritage and culture - explore responsibly');
  
  return insights;
}

function generateQuickRecommendations(weatherData, trafficData, incidentData) {
  const recommendations = [];
  
  if (weatherData.temperature > 35) {
    recommendations.push('Carry water and stay hydrated');
  }
  
  if (trafficData.congestionLevel === 'heavy') {
    recommendations.push('Use public transport when possible');
  }
  
  if (incidentData.riskScore > 60) {
    recommendations.push('Stay alert and avoid isolated areas');
  }
  
  recommendations.push('Keep emergency contacts ready');
  
  return recommendations;
}

// District-specific data functions
function getKarnatakaDistrictInfo(district) {
  const districtData = {
    'Bangalore Urban': {
      capital: true,
      population: '12.3 million',
      knownFor: 'IT Hub, Gardens, Pleasant weather',
      bestTime: 'October to February'
    },
    'Mysore': {
      population: '3.4 million', 
      knownFor: 'Royal Palace, Silk, Sandalwood',
      bestTime: 'October to March'
    },
    'Dakshina Kannada': {
      population: '2.1 million',
      knownFor: 'Coastal beauty, Temples, Beaches',
      bestTime: 'November to February'
    }
  };
  
  return districtData[district] || {
    population: 'Data not available',
    knownFor: 'Rich cultural heritage',
    bestTime: 'October to March'
  };
}

function getDistrictTouristSpots(district) {
  const spots = {
    'Bangalore Urban': ['Lalbagh', 'Cubbon Park', 'Bangalore Palace', 'ISKCON Temple'],
    'Mysore': ['Mysore Palace', 'Chamundi Hills', 'Brindavan Gardens'],
    'Dakshina Kannada': ['Panambur Beach', 'Kadri Manjunatha Temple', 'Pilikula Nisargadhama']
  };
  
  return spots[district] || ['Local attractions', 'Historical sites'];
}

function getDistrictSafetyTips(district) {
  return [
    'Carry identification documents',
    'Respect local customs',
    'Use registered tour guides',
    'Keep emergency numbers handy',
    'Stay in authorized accommodations'
  ];
}

function getDistrictEmergencyContacts(district) {
  return {
    police: '100',
    fire: '101', 
    ambulance: '108',
    touristHelpline: '1363',
    districtCollector: 'Contact district administration'
  };
}

function getDistrictTransportInfo(district) {
  const transport = {
    'Bangalore Urban': {
      metro: 'Namma Metro',
      bus: 'BMTC',
      airport: 'Kempegowda International Airport',
      railway: 'Bangalore City Junction'
    },
    'Mysore': {
      bus: 'KSRTC',
      railway: 'Mysore Junction',
      airport: 'Nearest - Bangalore (150km)'
    }
  };
  
  return transport[district] || {
    bus: 'KSRTC State Transport',
    railway: 'Nearest railway station',
    airport: 'Nearest airport information'
  };
}

module.exports = router;