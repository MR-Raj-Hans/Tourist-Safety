const express = require('express');
const axios = require('axios');
const router = express.Router();

// Real-time public transport information
// In production, integrate with local transport authorities' APIs

// Get nearby public transport stations
router.get('/stations/:lat/:lng/:radius', async (req, res) => {
  try {
    const { lat, lng, radius = 1000 } = req.params;
    
    // Query OSM for public transport stations
    const overpassQuery = `
      [out:json][timeout:25];
      (
        node["public_transport"="station"](around:${radius},${lat},${lng});
        node["railway"="station"](around:${radius},${lat},${lng});
        node["amenity"="bus_station"](around:${radius},${lat},${lng});
        node["public_transport"="stop_position"](around:${radius},${lat},${lng});
        node["highway"="bus_stop"](around:${radius},${lat},${lng});
        node["railway"="subway_entrance"](around:${radius},${lat},${lng});
      );
      out geom;
    `;
    
    try {
      const response = await axios.post('https://overpass-api.de/api/interpreter', overpassQuery, {
        headers: { 'Content-Type': 'text/plain' },
        timeout: 15000
      });
      
      const stations = response.data.elements.map(element => {
        let type = 'unknown';
        let icon = '🚏';
        
        if (element.tags?.railway === 'station') {
          type = 'train';
          icon = '🚂';
        } else if (element.tags?.railway === 'subway_entrance') {
          type = 'metro';
          icon = '🚇';
        } else if (element.tags?.amenity === 'bus_station' || element.tags?.highway === 'bus_stop') {
          type = 'bus';
          icon = '🚌';
        } else if (element.tags?.public_transport) {
          type = 'public_transport';
          icon = '🚊';
        }
        
        return {
          id: `transport_${element.id}`,
          name: element.tags?.name || `${type} station`,
          type: type,
          icon: icon,
          lat: element.lat,
          lng: element.lon,
          operator: element.tags?.operator || 'Unknown',
          network: element.tags?.network || 'Local',
          wheelchair: element.tags?.wheelchair === 'yes',
          lines: element.tags?.route_ref ? element.tags.route_ref.split(';') : [],
          source: 'overpass_api'
        };
      }).filter(station => station.lat && station.lng);
      
      res.json({
        success: true,
        stations: stations,
        count: stations.length,
        query: { lat: parseFloat(lat), lng: parseFloat(lng), radius: parseInt(radius) }
      });
      
    } catch (osmError) {
      // Fallback to mock data if OSM fails
      const mockStations = generateMockStations(parseFloat(lat), parseFloat(lng), parseInt(radius));
      res.json({
        success: true,
        stations: mockStations,
        count: mockStations.length,
        query: { lat: parseFloat(lat), lng: parseFloat(lng), radius: parseInt(radius) },
        note: 'Using fallback data due to OSM API unavailability'
      });
    }
    
  } catch (error) {
    console.error('Error fetching transport stations:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transport stations',
      error: error.message
    });
  }
});

// Get real-time schedules for a specific station
router.get('/schedules/:stationId', async (req, res) => {
  try {
    const { stationId } = req.params;
    
    // Mock real-time schedule data
    // In production, integrate with GTFS-RT feeds or transport authority APIs
    const schedules = generateMockSchedules(stationId);
    
    res.json({
      success: true,
      station_id: stationId,
      schedules: schedules,
      last_updated: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching schedules:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch schedules',
      error: error.message
    });
  }
});

// Get service alerts and disruptions
router.get('/alerts/:lat/:lng/:radius', async (req, res) => {
  try {
    const { lat, lng, radius = 5000 } = req.params;
    
    // Mock transport alerts
    const alerts = generateTransportAlerts(parseFloat(lat), parseFloat(lng), parseInt(radius));
    
    res.json({
      success: true,
      alerts: alerts,
      count: alerts.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching transport alerts:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transport alerts',
      error: error.message
    });
  }
});

// Generate mock station data
function generateMockStations(lat, lng, radius) {
  const stations = [];
  const types = [
    { type: 'metro', icon: '🚇', name: 'Metro Station' },
    { type: 'bus', icon: '🚌', name: 'Bus Stop' },
    { type: 'train', icon: '🚂', name: 'Railway Station' }
  ];
  
  const numStations = Math.floor(radius / 300); // One station per 300m
  
  for (let i = 0; i < Math.min(numStations, 10); i++) {
    const station = types[Math.floor(Math.random() * types.length)];
    const angle = (i / numStations) * 2 * Math.PI;
    const distance = Math.random() * radius;
    
    const stationLat = lat + (distance * Math.cos(angle)) / 111000;
    const stationLng = lng + (distance * Math.sin(angle)) / 111000;
    
    stations.push({
      id: `mock_station_${i}`,
      name: `${station.name} ${i + 1}`,
      type: station.type,
      icon: station.icon,
      lat: stationLat,
      lng: stationLng,
      operator: station.type === 'metro' ? 'Delhi Metro' : station.type === 'bus' ? 'DTC' : 'Indian Railways',
      network: station.type === 'metro' ? 'DMRC' : 'Public Transport',
      wheelchair: Math.random() > 0.5,
      lines: generateMockLines(station.type),
      source: 'mock_data'
    });
  }
  
  return stations;
}

// Generate mock schedule data
function generateMockSchedules(stationId) {
  const currentTime = new Date();
  const schedules = [];
  
  // Generate next 10 departures
  for (let i = 0; i < 10; i++) {
    const departureTime = new Date(currentTime.getTime() + (i * 5 + Math.random() * 10) * 60000);
    const isDelayed = Math.random() > 0.8;
    const delay = isDelayed ? Math.floor(Math.random() * 15) + 1 : 0;
    
    schedules.push({
      id: `schedule_${i}`,
      line: `Line ${Math.floor(Math.random() * 5) + 1}`,
      destination: `Destination ${String.fromCharCode(65 + Math.floor(Math.random() * 10))}`,
      scheduled_time: departureTime.toISOString(),
      estimated_time: new Date(departureTime.getTime() + delay * 60000).toISOString(),
      delay_minutes: delay,
      status: isDelayed ? 'delayed' : 'on_time',
      platform: Math.floor(Math.random() * 8) + 1,
      vehicle_type: ['Metro', 'Bus', 'Train'][Math.floor(Math.random() * 3)]
    });
  }
  
  return schedules.sort((a, b) => new Date(a.estimated_time) - new Date(b.estimated_time));
}

// Generate mock transport alerts
function generateTransportAlerts(lat, lng, radius) {
  const alerts = [];
  
  if (Math.random() > 0.7) { // 30% chance of alerts
    const alertTypes = [
      { type: 'delay', severity: 'minor', icon: '⏰' },
      { type: 'disruption', severity: 'major', icon: '🚫' },
      { type: 'maintenance', severity: 'minor', icon: '🔧' },
      { type: 'strike', severity: 'major', icon: '✊' }
    ];
    
    const numAlerts = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < numAlerts; i++) {
      const alert = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      const currentTime = new Date();
      
      alerts.push({
        id: `transport_alert_${Date.now()}_${i}`,
        type: alert.type,
        severity: alert.severity,
        icon: alert.icon,
        title: `${alert.type.toUpperCase()} Alert`,
        description: getAlertDescription(alert.type),
        affected_lines: [`Line ${Math.floor(Math.random() * 5) + 1}`],
        start_time: new Date(currentTime.getTime() - Math.random() * 3600000).toISOString(),
        end_time: new Date(currentTime.getTime() + Math.random() * 7200000).toISOString(),
        source: 'transport_authority'
      });
    }
  }
  
  return alerts;
}

// Generate mock transport lines
function generateMockLines(type) {
  const lines = {
    metro: ['Red Line', 'Blue Line', 'Yellow Line', 'Green Line'],
    bus: ['Route 101', 'Route 205', 'Express A1'],
    train: ['Express Mail', 'Passenger', 'Suburban']
  };
  
  const typeLines = lines[type] || ['Line 1'];
  const numLines = Math.floor(Math.random() * 3) + 1;
  
  return typeLines.slice(0, numLines);
}

// Get alert descriptions
function getAlertDescription(type) {
  const descriptions = {
    delay: 'Services are running with delays due to technical issues.',
    disruption: 'Service disruption on this line. Use alternative routes.',
    maintenance: 'Scheduled maintenance work affecting some services.',
    strike: 'Industrial action affecting public transport services.'
  };
  
  return descriptions[type] || 'Service alert in effect.';
}

module.exports = router;