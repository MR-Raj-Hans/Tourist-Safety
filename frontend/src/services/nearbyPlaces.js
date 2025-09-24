import axios from 'axios';
import { getDistance } from 'geolib';

// Service for fetching nearby important places
class NearbyPlacesService {
  constructor() {
    this.overpassUrl = 'https://overpass-api.de/api/interpreter';
    this.cache = new Map();
    this.cacheTimeout = 300000; // 5 minutes
  }

  // Cache key generator
  getCacheKey(lat, lng, radius, type) {
    const roundedLat = Math.round(lat * 1000) / 1000;
    const roundedLng = Math.round(lng * 1000) / 1000;
    return `${type}_${roundedLat}_${roundedLng}_${radius}`;
  }

  // Check if cache is valid
  isCacheValid(cacheEntry) {
    return cacheEntry && (Date.now() - cacheEntry.timestamp) < this.cacheTimeout;
  }

  // Overpass query builder
  buildOverpassQuery(lat, lng, radius, amenities) {
    const amenityFilter = amenities.map(amenity => `amenity="${amenity}"`).join(' or ');
    return `
      [out:json][timeout:25];
      (
        node[${amenityFilter}](around:${radius},${lat},${lng});
        way[${amenityFilter}](around:${radius},${lat},${lng});
        relation[${amenityFilter}](around:${radius},${lat},${lng});
      );
      out center meta;
    `;
  }

  // Process Overpass response
  processOverpassResponse(data, userLat, userLng, type) {
    const places = [];
    
    data.elements.forEach(element => {
      const lat = element.lat || (element.center && element.center.lat);
      const lng = element.lon || (element.center && element.center.lon);
      
      if (!lat || !lng) return;

      const distance = getDistance(
        { latitude: userLat, longitude: userLng },
        { latitude: lat, longitude: lng }
      );

      const place = {
        id: element.id,
        type: type,
        lat: lat,
        lng: lng,
        distance: distance,
        name: element.tags?.name || element.tags?.brand || `${type} facility`,
        amenity: element.tags?.amenity,
        address: this.formatAddress(element.tags),
        phone: element.tags?.phone || element.tags?.['contact:phone'],
        website: element.tags?.website || element.tags?.['contact:website'],
        opening_hours: element.tags?.opening_hours,
        emergency: element.tags?.emergency,
        operator: element.tags?.operator,
        healthcare: element.tags?.healthcare,
        police_type: element.tags?.police || element.tags?.government,
        tags: element.tags
      };

      places.push(place);
    });

    // Sort by distance and return top 10
    return places
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10);
  }

  // Format address from OSM tags
  formatAddress(tags) {
    if (!tags) return 'Address not available';
    
    const parts = [];
    if (tags['addr:housenumber']) parts.push(tags['addr:housenumber']);
    if (tags['addr:street']) parts.push(tags['addr:street']);
    if (tags['addr:city']) parts.push(tags['addr:city']);
    if (tags['addr:state']) parts.push(tags['addr:state']);
    if (tags['addr:postcode']) parts.push(tags['addr:postcode']);
    
    return parts.length > 0 ? parts.join(', ') : 'Address not available';
  }

  // Fetch nearby police stations
  async getNearbyPoliceStations(lat, lng, radius = 5000) {
    const cacheKey = this.getCacheKey(lat, lng, radius, 'police');
    const cached = this.cache.get(cacheKey);
    
    if (this.isCacheValid(cached)) {
      return cached.data;
    }

    try {
      const query = this.buildOverpassQuery(lat, lng, radius, ['police']);
      const response = await axios.post(this.overpassUrl, query, {
        headers: { 'Content-Type': 'text/plain' },
        timeout: 15000
      });

      const places = this.processOverpassResponse(response.data, lat, lng, 'police');
      
      this.cache.set(cacheKey, {
        data: places,
        timestamp: Date.now()
      });

      return places;
    } catch (error) {
      console.error('Error fetching police stations:', error);
      return this.getFallbackPoliceStations(lat, lng);
    }
  }

  // Fetch nearby hospitals
  async getNearbyHospitals(lat, lng, radius = 5000) {
    const cacheKey = this.getCacheKey(lat, lng, radius, 'hospital');
    const cached = this.cache.get(cacheKey);
    
    if (this.isCacheValid(cached)) {
      return cached.data;
    }

    try {
      const query = this.buildOverpassQuery(lat, lng, radius, ['hospital', 'clinic', 'doctors']);
      const response = await axios.post(this.overpassUrl, query, {
        headers: { 'Content-Type': 'text/plain' },
        timeout: 15000
      });

      const places = this.processOverpassResponse(response.data, lat, lng, 'hospital');
      
      this.cache.set(cacheKey, {
        data: places,
        timestamp: Date.now()
      });

      return places;
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      return this.getFallbackHospitals(lat, lng);
    }
  }

  // Fetch nearby embassies
  async getNearbyEmbassies(lat, lng, radius = 10000) {
    const cacheKey = this.getCacheKey(lat, lng, radius, 'embassy');
    const cached = this.cache.get(cacheKey);
    
    if (this.isCacheValid(cached)) {
      return cached.data;
    }

    try {
      const query = `
        [out:json][timeout:25];
        (
          node[office="diplomatic"](around:${radius},${lat},${lng});
          node[diplomatic="embassy"](around:${radius},${lat},${lng});
          way[office="diplomatic"](around:${radius},${lat},${lng});
          way[diplomatic="embassy"](around:${radius},${lat},${lng});
        );
        out center meta;
      `;
      
      const response = await axios.post(this.overpassUrl, query, {
        headers: { 'Content-Type': 'text/plain' },
        timeout: 15000
      });

      const places = this.processOverpassResponse(response.data, lat, lng, 'embassy');
      
      this.cache.set(cacheKey, {
        data: places,
        timestamp: Date.now()
      });

      return places;
    } catch (error) {
      console.error('Error fetching embassies:', error);
      return this.getFallbackEmbassies(lat, lng);
    }
  }

  // Fetch nearby transport hubs
  async getNearbyTransport(lat, lng, radius = 3000) {
    const cacheKey = this.getCacheKey(lat, lng, radius, 'transport');
    const cached = this.cache.get(cacheKey);
    
    if (this.isCacheValid(cached)) {
      return cached.data;
    }

    try {
      const query = `
        [out:json][timeout:25];
        (
          node[public_transport="station"](around:${radius},${lat},${lng});
          node[railway="station"](around:${radius},${lat},${lng});
          node[amenity="bus_station"](around:${radius},${lat},${lng});
          node[aeroway="aerodrome"](around:${radius},${lat},${lng});
          way[public_transport="station"](around:${radius},${lat},${lng});
          way[railway="station"](around:${radius},${lat},${lng});
        );
        out center meta;
      `;
      
      const response = await axios.post(this.overpassUrl, query, {
        headers: { 'Content-Type': 'text/plain' },
        timeout: 15000
      });

      const places = this.processOverpassResponse(response.data, lat, lng, 'transport');
      
      this.cache.set(cacheKey, {
        data: places,
        timestamp: Date.now()
      });

      return places;
    } catch (error) {
      console.error('Error fetching transport:', error);
      return this.getFallbackTransport(lat, lng);
    }
  }

  // Fallback data for Delhi area
  getFallbackPoliceStations(lat, lng) {
    const fallbackData = [
      {
        id: 'cp_police',
        type: 'police',
        name: 'Connaught Place Police Station',
        lat: 28.6315,
        lng: 77.2167,
        phone: '011-23741156',
        address: 'Connaught Place, New Delhi - 110001',
        distance: getDistance({ latitude: lat, longitude: lng }, { latitude: 28.6315, longitude: 77.2167 })
      },
      {
        id: 'ip_police',
        type: 'police',
        name: 'India Gate Police Station',
        lat: 28.6129,
        lng: 77.2295,
        phone: '011-23386368',
        address: 'India Gate, New Delhi - 110003',
        distance: getDistance({ latitude: lat, longitude: lng }, { latitude: 28.6129, longitude: 77.2295 })
      }
    ];
    
    return fallbackData.sort((a, b) => a.distance - b.distance);
  }

  getFallbackHospitals(lat, lng) {
    const fallbackData = [
      {
        id: 'aiims',
        type: 'hospital',
        name: 'All India Institute of Medical Sciences (AIIMS)',
        lat: 28.5672,
        lng: 77.2100,
        phone: '011-26588500',
        address: 'Sri Aurobindo Marg, New Delhi - 110029',
        distance: getDistance({ latitude: lat, longitude: lng }, { latitude: 28.5672, longitude: 77.2100 })
      },
      {
        id: 'safdarjung',
        type: 'hospital',
        name: 'Safdarjung Hospital',
        lat: 28.5691,
        lng: 77.2074,
        phone: '011-26165060',
        address: 'Ring Road, New Delhi - 110029',
        distance: getDistance({ latitude: lat, longitude: lng }, { latitude: 28.5691, longitude: 77.2074 })
      }
    ];
    
    return fallbackData.sort((a, b) => a.distance - b.distance);
  }

  getFallbackEmbassies(lat, lng) {
    const fallbackData = [
      {
        id: 'us_embassy',
        type: 'embassy',
        name: 'Embassy of the United States',
        lat: 28.5976,
        lng: 77.1892,
        phone: '011-24198000',
        address: 'Shantipath, Chanakyapuri, New Delhi - 110021',
        distance: getDistance({ latitude: lat, longitude: lng }, { latitude: 28.5976, longitude: 77.1892 })
      },
      {
        id: 'uk_embassy',
        type: 'embassy',
        name: 'British High Commission',
        lat: 28.5943,
        lng: 77.1881,
        phone: '011-24192100',
        address: 'Shantipath, Chanakyapuri, New Delhi - 110021',
        distance: getDistance({ latitude: lat, longitude: lng }, { latitude: 28.5943, longitude: 77.1881 })
      }
    ];
    
    return fallbackData.sort((a, b) => a.distance - b.distance);
  }

  getFallbackTransport(lat, lng) {
    const fallbackData = [
      {
        id: 'rajiv_metro',
        type: 'transport',
        name: 'Rajiv Chowk Metro Station',
        lat: 28.6330,
        lng: 77.2194,
        address: 'Connaught Place, New Delhi',
        distance: getDistance({ latitude: lat, longitude: lng }, { latitude: 28.6330, longitude: 77.2194 })
      },
      {
        id: 'ndls',
        type: 'transport',
        name: 'New Delhi Railway Station',
        lat: 28.6431,
        lng: 77.2197,
        phone: '139',
        address: 'Paharganj, New Delhi - 110055',
        distance: getDistance({ latitude: lat, longitude: lng }, { latitude: 28.6431, longitude: 77.2197 })
      }
    ];
    
    return fallbackData.sort((a, b) => a.distance - b.distance);
  }

  // Get all nearby places
  async getAllNearbyPlaces(lat, lng) {
    try {
      const [police, hospitals, embassies, transport] = await Promise.allSettled([
        this.getNearbyPoliceStations(lat, lng),
        this.getNearbyHospitals(lat, lng),
        this.getNearbyEmbassies(lat, lng),
        this.getNearbyTransport(lat, lng)
      ]);

      return {
        police: police.status === 'fulfilled' ? police.value : [],
        hospitals: hospitals.status === 'fulfilled' ? hospitals.value : [],
        embassies: embassies.status === 'fulfilled' ? embassies.value : [],
        transport: transport.status === 'fulfilled' ? transport.value : []
      };
    } catch (error) {
      console.error('Error fetching all nearby places:', error);
      return {
        police: this.getFallbackPoliceStations(lat, lng),
        hospitals: this.getFallbackHospitals(lat, lng),
        embassies: this.getFallbackEmbassies(lat, lng),
        transport: this.getFallbackTransport(lat, lng)
      };
    }
  }

  // Format distance for display
  formatDistance(distance) {
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    }
    return `${(distance / 1000).toFixed(1)}km`;
  }

  // Get place icon based on type
  getPlaceIcon(type, amenity) {
    switch (type) {
      case 'police':
        return '👮‍♂️';
      case 'hospital':
        return amenity === 'clinic' ? '🏥' : '🏥';
      case 'embassy':
        return '🏛️';
      case 'transport':
        return amenity === 'bus_station' ? '🚌' : '🚇';
      default:
        return '📍';
    }
  }
}

const nearbyPlacesService = new NearbyPlacesService();
export default nearbyPlacesService;