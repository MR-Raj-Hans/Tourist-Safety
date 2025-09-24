const express = require('express');
const axios = require('axios');
const router = express.Router();

// Traffic and incident monitoring
// In production, integrate with services like HERE Traffic API, TomTom, or local traffic authorities

// Get real-time traffic conditions
router.get('/conditions/:lat/:lng/:radius', async (req, res) => {
  try {
    const { lat, lng, radius = 5000 } = req.params;
    
    // Mock real-time traffic data
    const trafficConditions = generateRealtimeTraffic(parseFloat(lat), parseFloat(lng), parseInt(radius));
    
    res.json({
      success: true,
      traffic: trafficConditions,
      timestamp: new Date().toISOString(),
      query: { lat: parseFloat(lat), lng: parseFloat(lng), radius: parseInt(radius) }
    });
    
  } catch (error) {
    console.error('Error fetching traffic conditions:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch traffic conditions',
      error: error.message
    });
  }
});

// Get real-time incidents and emergencies
router.get('/incidents/:lat/:lng/:radius', async (req, res) => {
  try {
    const { lat, lng, radius = 10000 } = req.params;
    
    // Mock real-time incident data
    const incidents = generateRealtimeIncidents(parseFloat(lat), parseFloat(lng), parseInt(radius));
    
    res.json({
      success: true,
      incidents: incidents,
      count: incidents.length,
      timestamp: new Date().toISOString(),
      query: { lat: parseFloat(lat), lng: parseFloat(lng), radius: parseInt(radius) }
    });
    
  } catch (error) {
    console.error('Error fetching incidents:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch incident data',
      error: error.message
    });
  }
});

// Get crowd density estimates
router.get('/crowd-density/:lat/:lng/:radius', async (req, res) => {
  try {
    const { lat, lng, radius = 2000 } = req.params;
    
    // Mock crowd density data based on time and location
    const crowdData = generateCrowdDensity(parseFloat(lat), parseFloat(lng), parseInt(radius));
    
    res.json({
      success: true,
      crowd_density: crowdData,
      timestamp: new Date().toISOString(),
      query: { lat: parseFloat(lat), lng: parseFloat(lng), radius: parseInt(radius) }
    });
    
  } catch (error) {
    console.error('Error fetching crowd density:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch crowd density data',
      error: error.message
    });
  }
});

// Generate realistic real-time traffic data
function generateRealtimeTraffic(lat, lng, radius) {
  const currentHour = new Date().getHours();
  const isRushHour = (currentHour >= 7 && currentHour <= 10) || (currentHour >= 17 && currentHour <= 20);
  const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;
  
  // Generate traffic data for different road segments
  const segments = [];
  const numSegments = Math.floor(radius / 500); // One segment per 500m
  
  for (let i = 0; i < numSegments; i++) {
    let congestionLevel = 'low';
    let speed = 50 + Math.random() * 20; // Base speed 50-70 km/h
    
    if (isRushHour && !isWeekend) {
      congestionLevel = Math.random() > 0.3 ? 'high' : 'moderate';
      speed = 20 + Math.random() * 30; // Reduced speed during rush hour
    } else if (isWeekend && currentHour >= 10 && currentHour <= 18) {
      congestionLevel = Math.random() > 0.5 ? 'moderate' : 'low';
      speed = 35 + Math.random() * 25;
    }
    
    segments.push({
      id: `segment_${i}`,
      lat: lat + (Math.random() - 0.5) * 0.01,
      lng: lng + (Math.random() - 0.5) * 0.01,
      congestion_level: congestionLevel,
      average_speed: Math.round(speed),
      travel_time_ratio: congestionLevel === 'high' ? 2.5 : (congestionLevel === 'moderate' ? 1.5 : 1.0),
      road_type: ['primary', 'secondary', 'residential'][Math.floor(Math.random() * 3)],
      last_updated: new Date().toISOString()
    });
  }
  
  return {
    overall_congestion: isRushHour && !isWeekend ? 'high' : 'moderate',
    segments: segments,
    rush_hour: isRushHour,
    weekend: isWeekend
  };
}

// Generate realistic real-time incident data
function generateRealtimeIncidents(lat, lng, radius) {
  const incidents = [];
  const currentTime = new Date();
  
  // Randomly generate incidents based on realistic probability
  if (Math.random() > 0.8) { // 20% chance of having incidents
    const incidentTypes = [
      { type: 'accident', severity: 'minor', icon: '🚗', duration: 30 },
      { type: 'roadwork', severity: 'moderate', icon: '🚧', duration: 180 },
      { type: 'police_activity', severity: 'high', icon: '👮', duration: 60 },
      { type: 'emergency_vehicle', severity: 'high', icon: '🚨', duration: 15 },
      { type: 'protest', severity: 'moderate', icon: '👥', duration: 120 },
      { type: 'event', severity: 'low', icon: '🎪', duration: 240 }
    ];
    
    const numIncidents = Math.floor(Math.random() * 3) + 1; // 1-3 incidents
    
    for (let i = 0; i < numIncidents; i++) {
      const incident = incidentTypes[Math.floor(Math.random() * incidentTypes.length)];
      const incidentLat = lat + (Math.random() - 0.5) * (radius / 111000); // Convert radius to degrees
      const incidentLng = lng + (Math.random() - 0.5) * (radius / 111000);
      
      incidents.push({
        id: `incident_${Date.now()}_${i}`,
        type: incident.type,
        severity: incident.severity,
        icon: incident.icon,
        lat: incidentLat,
        lng: incidentLng,
        title: `${incident.type.replace('_', ' ').toUpperCase()}`,
        description: getIncidentDescription(incident.type),
        reported_at: new Date(currentTime.getTime() - Math.random() * 3600000).toISOString(), // Random time in last hour
        estimated_duration: incident.duration,
        impact_radius: incident.severity === 'high' ? 1000 : (incident.severity === 'moderate' ? 500 : 200),
        source: 'real_time_monitoring',
        status: 'active'
      });
    }
  }
  
  return incidents;
}

// Generate crowd density data
function generateCrowdDensity(lat, lng, radius) {
  const currentHour = new Date().getHours();
  const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;
  
  let baseDensity = 0.3; // Low baseline
  
  // Adjust based on time
  if (currentHour >= 9 && currentHour <= 18) {
    baseDensity = isWeekend ? 0.6 : 0.5; // Higher during day
  } else if (currentHour >= 19 && currentHour <= 23) {
    baseDensity = 0.7; // Peak evening activity
  }
  
  // Generate density points
  const densityPoints = [];
  const gridSize = Math.ceil(radius / 200); // 200m grid
  
  for (let x = -gridSize; x <= gridSize; x++) {
    for (let y = -gridSize; y <= gridSize; y++) {
      const pointLat = lat + (x * 0.002); // ~200m per grid cell
      const pointLng = lng + (y * 0.002);
      const distance = Math.sqrt(x*x + y*y) * 200;
      
      if (distance <= radius) {
        let density = baseDensity + (Math.random() - 0.5) * 0.4;
        density = Math.max(0, Math.min(1, density)); // Clamp to 0-1
        
        densityPoints.push({
          lat: pointLat,
          lng: pointLng,
          density: Math.round(density * 100) / 100,
          estimated_people: Math.floor(density * 100),
          confidence: 0.7 + Math.random() * 0.3 // 70-100% confidence
        });
      }
    }
  }
  
  return {
    overall_density: baseDensity,
    density_level: baseDensity > 0.7 ? 'high' : (baseDensity > 0.4 ? 'moderate' : 'low'),
    points: densityPoints,
    methodology: 'mobile_data_analysis',
    confidence: 0.85
  };
}

// Get incident descriptions
function getIncidentDescription(type) {
  const descriptions = {
    accident: 'Traffic accident reported. Emergency services on scene.',
    roadwork: 'Road construction in progress. Expect delays.',
    police_activity: 'Police operation in progress. Area may be restricted.',
    emergency_vehicle: 'Emergency vehicles responding. Keep roads clear.',
    protest: 'Public gathering in progress. Traffic may be affected.',
    event: 'Public event taking place. Increased foot traffic expected.'
  };
  
  return descriptions[type] || 'Incident reported in area.';
}

module.exports = router;