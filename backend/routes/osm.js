const express = require('express');
const router = express.Router();
const axios = require('axios');

// Fetch danger zones from OSM using Overpass API
router.get('/danger-zones/:lat/:lng/:radius', async (req, res) => {
  try {
    const { lat, lng, radius = 5000 } = req.params;
    
    // Overpass API query for dangerous places
    const overpassQuery = `
      [out:json][timeout:25];
      (
        node["amenity"="pub"](around:${radius},${lat},${lng});
        node["amenity"="bar"](around:${radius},${lat},${lng});
        node["amenity"="nightclub"](around:${radius},${lat},${lng});
        way["landuse"="military"](around:${radius},${lat},${lng});
        relation["boundary"="national_park"](around:${radius},${lat},${lng});
        node["emergency"="yes"](around:${radius},${lat},${lng});
      );
      out geom;
    `;
    
    const response = await axios.post('https://overpass-api.de/api/interpreter', overpassQuery, {
      headers: { 'Content-Type': 'text/plain' },
      timeout: 15000 // Reduced timeout to prevent hanging
    });
    
    if (response.data && response.data.elements) {
      const zones = response.data.elements.map(element => {
        let type = 'unknown';
        let icon = '⚠️';
        let riskLevel = 'low';
        
        // Categorize based on amenity/landuse
        if (element.tags?.amenity === 'pub' || element.tags?.amenity === 'bar') {
          type = 'pub';
          icon = '🍺';
          riskLevel = 'medium';
        } else if (element.tags?.amenity === 'nightclub') {
          type = 'nightclub';
          icon = '🎵';
          riskLevel = 'medium';
        } else if (element.tags?.landuse === 'military') {
          type = 'restricted';
          icon = '🚫';
          riskLevel = 'high';
        } else if (element.tags?.boundary === 'national_park') {
          type = 'wildlife';
          icon = '🐅';
          riskLevel = 'medium';
        } else if (element.tags?.emergency === 'yes') {
          type = 'emergency';
          icon = '🚨';
          riskLevel = 'high';
        }
        
        return {
          id: `osm_${element.id}`,
          name: element.tags?.name || `Unnamed ${type}`,
          type: type,
          icon: icon,
          lat: element.lat || element.center?.lat,
          lng: element.lon || element.center?.lon,
          radius: type === 'restricted' ? 500 : 200,
          riskLevel: riskLevel,
          description: `${type} area - ${riskLevel} risk level`,
          osmTag: `${Object.keys(element.tags || {})[0]}=${Object.values(element.tags || {})[0]}`,
          source: 'overpass_api'
        };
      }).filter(zone => zone.lat && zone.lng); // Filter out zones without coordinates
      
      res.json({
        success: true,
        zones: zones,
        count: zones.length,
        query: { lat: parseFloat(lat), lng: parseFloat(lng), radius: parseInt(radius) }
      });
    } else {
      res.json({
        success: true,
        zones: [],
        count: 0,
        message: 'No danger zones found in the specified area'
      });
    }
  } catch (error) {
    console.error('Error fetching danger zones:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch danger zones from OSM',
      error: error.message
    });
  }
});

// Fetch safe zones (police stations, hospitals, metro stations)
router.get('/safe-zones/:lat/:lng/:radius', async (req, res) => {
  try {
    const { lat, lng, radius = 5000 } = req.params;
    
    const overpassQuery = `
      [out:json][timeout:25];
      (
        node["amenity"="police"](around:${radius},${lat},${lng});
        node["amenity"="hospital"](around:${radius},${lat},${lng});
        node["public_transport"="station"](around:${radius},${lat},${lng});
        node["railway"="station"](around:${radius},${lat},${lng});
        node["amenity"="fire_station"](around:${radius},${lat},${lng});
        node["emergency"="access_point"](around:${radius},${lat},${lng});
      );
      out geom;
    `;
    
    const response = await axios.post('https://overpass-api.de/api/interpreter', overpassQuery, {
      headers: { 'Content-Type': 'text/plain' },
      timeout: 15000 // Reduced timeout to prevent hanging
    });
    
    if (response.data && response.data.elements) {
      const zones = response.data.elements.map(element => {
        let type = 'unknown';
        let icon = '🏢';
        
        if (element.tags?.amenity === 'police') {
          type = 'police';
          icon = '👮';
        } else if (element.tags?.amenity === 'hospital') {
          type = 'medical';
          icon = '🏥';
        } else if (element.tags?.public_transport === 'station' || element.tags?.railway === 'station') {
          type = 'transport';
          icon = '🚇';
        } else if (element.tags?.amenity === 'fire_station') {
          type = 'fire';
          icon = '🚒';
        } else if (element.tags?.emergency === 'access_point') {
          type = 'emergency';
          icon = '🆘';
        }
        
        return {
          id: `osm_safe_${element.id}`,
          name: element.tags?.name || `${type} facility`,
          type: type,
          icon: icon,
          lat: element.lat,
          lng: element.lon,
          radius: 200,
          description: `Safe ${type} facility`,
          osmTag: `${Object.keys(element.tags || {})[0]}=${Object.values(element.tags || {})[0]}`,
          source: 'overpass_api'
        };
      }).filter(zone => zone.lat && zone.lng);
      
      res.json({
        success: true,
        zones: zones,
        count: zones.length,
        query: { lat: parseFloat(lat), lng: parseFloat(lng), radius: parseInt(radius) }
      });
    } else {
      res.json({
        success: true,
        zones: [],
        count: 0,
        message: 'No safe zones found in the specified area'
      });
    }
  } catch (error) {
    console.error('Error fetching safe zones:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch safe zones from OSM',
      error: error.message
    });
  }
});

// Generate heatmap data based on crowd reports and incidents
router.get('/heatmap/:lat/:lng/:radius', async (req, res) => {
  try {
    const { lat, lng, radius = 10000 } = req.params;
    
    // Query for crowded places that might contribute to heatmap
    const overpassQuery = `
      [out:json][timeout:25];
      (
        node["amenity"~"^(restaurant|fast_food|cafe|pub|bar|nightclub|cinema|theatre|shopping_mall)$"](around:${radius},${lat},${lng});
        node["tourism"~"^(attraction|museum|monument)$"](around:${radius},${lat},${lng});
        node["leisure"~"^(park|stadium|sports_centre)$"](around:${radius},${lat},${lng});
      );
      out geom;
    `;
    
    const response = await axios.post('https://overpass-api.de/api/interpreter', overpassQuery, {
      headers: { 'Content-Type': 'text/plain' },
      timeout: 15000 // Reduced timeout to prevent hanging
    });
    
    if (response.data && response.data.elements) {
      const heatmapPoints = response.data.elements.map(element => {
        let intensity = 0.3; // Base intensity
        
        // Assign intensity based on type of place
        if (element.tags?.amenity === 'pub' || element.tags?.amenity === 'bar' || element.tags?.amenity === 'nightclub') {
          intensity = 0.8; // High intensity for nightlife
        } else if (element.tags?.amenity === 'restaurant' || element.tags?.amenity === 'shopping_mall') {
          intensity = 0.6; // Medium-high for dining/shopping
        } else if (element.tags?.tourism || element.tags?.leisure === 'stadium') {
          intensity = 0.7; // High for tourist attractions
        } else if (element.tags?.amenity === 'cafe' || element.tags?.leisure === 'park') {
          intensity = 0.4; // Lower for casual places
        }
        
        return {
          lat: element.lat,
          lng: element.lon,
          intensity: intensity,
          type: element.tags?.amenity || element.tags?.tourism || element.tags?.leisure || 'unknown',
          name: element.tags?.name || 'Unnamed location'
        };
      }).filter(point => point.lat && point.lng);
      
      res.json({
        success: true,
        points: heatmapPoints,
        count: heatmapPoints.length,
        query: { lat: parseFloat(lat), lng: parseFloat(lng), radius: parseInt(radius) }
      });
    } else {
      res.json({
        success: true,
        points: [],
        count: 0,
        message: 'No heatmap data found in the specified area'
      });
    }
  } catch (error) {
    console.error('Error generating heatmap:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to generate heatmap data',
      error: error.message
    });
  }
});

// Get route suggestions using OSRM (Open Source Routing Machine)
router.post('/safe-route', async (req, res) => {
  try {
    const { start, end, avoid_zones } = req.body;
    
    if (!start || !end || !start.lat || !start.lng || !end.lat || !end.lng) {
      return res.status(400).json({
        success: false,
        message: 'Start and end coordinates are required'
      });
    }
    
    // Use OSRM demo server for routing (in production, host your own OSRM instance)
    const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson&steps=true`;
    
    const response = await axios.get(osrmUrl, { timeout: 15000 });
    
    if (response.data && response.data.routes && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      
      // TODO: Implement logic to check if route passes through danger zones
      // and suggest alternative routes if needed
      
      res.json({
        success: true,
        route: {
          geometry: route.geometry,
          distance: route.distance,
          duration: route.duration,
          steps: route.legs[0]?.steps || []
        },
        alternatives: response.data.routes.slice(1), // Alternative routes if available
        danger_zones_avoided: avoid_zones || []
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'No route found between the specified points'
      });
    }
  } catch (error) {
    console.error('Error getting route:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get route suggestions',
      error: error.message
    });
  }
});

// Reverse geocoding
router.get('/reverse-geocode/:lat/:lng', async (req, res) => {
  try {
    const { lat, lng } = req.params;
    
    const response = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
      params: {
        lat: lat,
        lon: lng,
        format: 'json',
        addressdetails: 1
      },
      timeout: 10000
    });
    
    res.json({
      success: true,
      address: response.data.display_name,
      details: response.data
    });
  } catch (error) {
    console.error('Error reverse geocoding:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to reverse geocode location',
      error: error.message
    });
  }
});

module.exports = router;