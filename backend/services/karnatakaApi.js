const axios = require('axios');

class KarnatakaAPIService {
  constructor() {
    // Karnataka government API endpoints (these are example endpoints - replace with actual ones)
    this.endpoints = {
      weather: 'https://api.karnataka.gov.in/weather',
      traffic: 'https://api.karnataka.gov.in/traffic',
      incidents: 'https://api.karnataka.gov.in/incidents',
      tourism: 'https://api.karnataka.gov.in/tourism',
      emergency: 'https://api.karnataka.gov.in/emergency',
      // Alternative APIs if direct Karnataka APIs aren't available
      weatherBackup: 'https://api.openweathermap.org/data/2.5/weather',
      newsAPI: 'https://newsapi.org/v2/everything'
    };
    
    // API keys (should be in environment variables)
    this.apiKeys = {
      openWeather: process.env.OPENWEATHER_API_KEY || 'your_openweather_key',
      newsAPI: process.env.NEWS_API_KEY || 'your_news_api_key'
    };
    
    // Karnataka districts for data filtering
    this.karnatakaDistricts = [
      'Bangalore Urban', 'Bangalore Rural', 'Mysore', 'Mandya', 'Hassan', 'Tumkur',
      'Kolar', 'Chikkaballapura', 'Chitradurga', 'Davanagere', 'Shimoga', 'Belagavi',
      'Bagalkot', 'Bijapur', 'Gulbarga', 'Raichur', 'Koppal', 'Gadag', 'Dharwad',
      'Haveri', 'Uttara Kannada', 'Udupi', 'Dakshina Kannada', 'Kodagu', 'Chikkamagaluru',
      'Bellary', 'Chamarajanagar', 'Ramanagara', 'Chikkaballapur', 'Yadgir', 'Vijayanagara'
    ];
  }

  // Get weather data for Karnataka location
  async getWeatherData(lat, lng, location = '') {
    try {
      // Try Karnataka government API first
      try {
        const response = await axios.get(`${this.endpoints.weather}`, {
          params: { lat, lng, location },
          timeout: 5000
        });
        
        if (response.data) {
          return this.parseKarnatakaWeatherData(response.data);
        }
      } catch (karnatakaError) {
        console.log('Karnataka weather API unavailable, using backup...');
      }

      // Fallback to OpenWeatherMap with Karnataka-specific interpretation
      const response = await axios.get(this.endpoints.weatherBackup, {
        params: {
          lat,
          lon: lng,
          appid: this.apiKeys.openWeather,
          units: 'metric'
        },
        timeout: 5000
      });

      return this.parseWeatherForKarnataka(response.data, location);
      
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return this.getDefaultWeatherData(location);
    }
  }

  // Get traffic and road condition data
  async getTrafficData(lat, lng, location = '') {
    try {
      // Try Karnataka traffic API
      try {
        const response = await axios.get(`${this.endpoints.traffic}`, {
          params: { lat, lng, location },
          timeout: 5000
        });
        
        if (response.data) {
          return this.parseKarnatakaTrafficData(response.data);
        }
      } catch (karnatakaError) {
        console.log('Karnataka traffic API unavailable, using simulated data...');
      }

      // Generate Karnataka-specific traffic data based on location
      return this.generateKarnatakaTrafficData(lat, lng, location);
      
    } catch (error) {
      console.error('Error fetching traffic data:', error);
      return this.getDefaultTrafficData();
    }
  }

  // Get incident and safety data
  async getIncidentData(lat, lng, location = '') {
    try {
      // Try Karnataka incidents API
      try {
        const response = await axios.get(`${this.endpoints.incidents}`, {
          params: { lat, lng, location, radius: 10 },
          timeout: 5000
        });
        
        if (response.data) {
          return this.parseKarnatakaIncidentData(response.data);
        }
      } catch (karnatakaError) {
        console.log('Karnataka incidents API unavailable, using news data...');
      }

      // Fallback to news API for Karnataka safety incidents
      return await this.getKarnatakaSafetyNews(location);
      
    } catch (error) {
      console.error('Error fetching incident data:', error);
      return this.getDefaultIncidentData();
    }
  }

  // Get tourism-specific safety data
  async getTourismSafetyData(lat, lng, location = '') {
    try {
      const response = await axios.get(`${this.endpoints.tourism}`, {
        params: { lat, lng, location },
        timeout: 5000
      });
      
      if (response.data) {
        return this.parseKarnatakaTourismData(response.data);
      }
    } catch (error) {
      console.log('Karnataka tourism API unavailable, using default data...');
    }

    return this.getDefaultTourismData(location);
  }

  // Parse Karnataka weather data
  parseKarnatakaWeatherData(data) {
    return {
      temperature: data.temperature || 25,
      humidity: data.humidity || 65,
      windSpeed: data.windSpeed || 10,
      visibility: data.visibility || 8,
      uvIndex: data.uvIndex || 6,
      airQuality: data.airQuality || 'Moderate',
      alerts: data.weatherAlerts || [],
      riskFactors: this.calculateWeatherRisk(data)
    };
  }

  // Parse weather data for Karnataka context
  parseWeatherForKarnataka(data, location) {
    const karnatakaSpecific = {
      temperature: data.main.temp,
      humidity: data.main.humidity,
      windSpeed: data.wind?.speed || 0,
      visibility: data.visibility ? data.visibility / 1000 : 10,
      condition: data.weather[0].main,
      description: data.weather[0].description,
      riskFactors: []
    };

    // Add Karnataka-specific weather risk assessment
    if (karnatakaSpecific.temperature > 35) {
      karnatakaSpecific.riskFactors.push({
        type: 'heat_wave',
        severity: 'high',
        message: 'Extreme heat warning for Karnataka region'
      });
    }

    if (karnatakaSpecific.humidity > 80 && location.toLowerCase().includes('coastal')) {
      karnatakaSpecific.riskFactors.push({
        type: 'high_humidity',
        severity: 'medium',
        message: 'High humidity in coastal Karnataka - stay hydrated'
      });
    }

    return karnatakaSpecific;
  }

  // Generate Karnataka-specific traffic data
  generateKarnatakaTrafficData(lat, lng, location) {
    const majorRoutes = this.getKarnatakaMajorRoutes(location);
    const timeOfDay = new Date().getHours();
    
    return {
      congestionLevel: this.calculateCongestionForLocation(location, timeOfDay),
      majorRoutes: majorRoutes,
      roadConditions: this.getKarnatakaRoadConditions(location),
      accidents: this.getRecentAccidents(location),
      alternatives: this.getAlternativeRoutes(location),
      riskScore: this.calculateTrafficRisk(location, timeOfDay)
    };
  }

  // Get Karnataka safety news
  async getKarnatakaSafetyNews(location) {
    try {
      const query = `Karnataka ${location} safety incident crime`;
      const response = await axios.get(this.endpoints.newsAPI, {
        params: {
          q: query,
          country: 'in',
          language: 'en',
          sortBy: 'publishedAt',
          pageSize: 10,
          apiKey: this.apiKeys.newsAPI
        },
        timeout: 5000
      });

      return this.parseNewsForIncidents(response.data.articles);
    } catch (error) {
      console.error('Error fetching news data:', error);
      return this.getDefaultIncidentData();
    }
  }

  // Parse news articles for safety incidents
  parseNewsForIncidents(articles) {
    const incidents = [];
    const safetyKeywords = ['accident', 'crime', 'theft', 'incident', 'emergency', 'safety', 'security'];
    
    articles.forEach(article => {
      const hasSafety = safetyKeywords.some(keyword => 
        article.title.toLowerCase().includes(keyword) || 
        article.description?.toLowerCase().includes(keyword)
      );
      
      if (hassafety) {
        incidents.push({
          type: this.categorizeIncident(article.title),
          severity: this.assessIncidentSeverity(article.title, article.description),
          location: this.extractLocation(article.title, article.description),
          timestamp: new Date(article.publishedAt),
          source: article.source.name,
          description: article.description,
          url: article.url
        });
      }
    });

    return {
      incidents: incidents.slice(0, 5),
      totalCount: incidents.length,
      lastUpdated: new Date(),
      riskScore: this.calculateIncidentRisk(incidents)
    };
  }

  // Get major routes for Karnataka locations
  getKarnatakaMajorRoutes(location) {
    const routes = {
      'bangalore': [
        'NH-4 (Bangalore-Mumbai Highway)',
        'NH-7 (Bangalore-Chennai Highway)', 
        'NH-206 (Bangalore-Mysore Highway)',
        'Outer Ring Road',
        'Electronic City Flyover'
      ],
      'mysore': [
        'NH-275 (Mysore-Bangalore Highway)',
        'SH-17 (Mysore-Ooty Road)',
        'Mysore Ring Road'
      ],
      'mangalore': [
        'NH-66 (Coastal Highway)',
        'NH-169 (Mangalore-Bangalore Highway)',
        'Pumpwell Circle'
      ],
      'hubli': [
        'NH-4 (Mumbai-Bangalore Highway)',
        'NH-218 (Hubli-Ankola Road)'
      ]
    };

    const locationKey = Object.keys(routes).find(key => 
      location.toLowerCase().includes(key)
    );

    return routes[locationKey] || ['State Highway', 'District Road'];
  }

  // Calculate Karnataka-specific risk scores
  calculateKarnatakaRiskScore(weatherData, trafficData, incidentData, tourismData) {
    let riskScore = 0;
    const factors = [];

    // Weather risk (30% weight)
    const weatherRisk = this.assessWeatherRisk(weatherData);
    riskScore += weatherRisk * 0.3;
    if (weatherRisk > 70) factors.push('Severe weather conditions');

    // Traffic risk (25% weight)
    const trafficRisk = trafficData.riskScore || 0;
    riskScore += trafficRisk * 0.25;
    if (trafficRisk > 60) factors.push('Heavy traffic congestion');

    // Incident risk (35% weight)
    const incidentRisk = incidentData.riskScore || 0;
    riskScore += incidentRisk * 0.35;
    if (incidentRisk > 50) factors.push('Recent safety incidents reported');

    // Tourism risk (10% weight)
    const tourismRisk = tourismData.riskScore || 0;
    riskScore += tourismRisk * 0.1;

    return {
      overallScore: Math.min(Math.round(riskScore), 100),
      riskLevel: this.getRiskLevel(riskScore),
      factors: factors,
      recommendations: this.getKarnatakaRecommendations(riskScore, factors),
      lastUpdated: new Date()
    };
  }

  // Get Karnataka-specific recommendations
  getKarnatakaRecommendations(riskScore, factors) {
    const recommendations = [];

    if (riskScore > 70) {
      recommendations.push('Consider postponing travel if possible');
      recommendations.push('Stay in tourist-friendly areas');
      recommendations.push('Keep emergency contacts handy');
    }

    if (factors.includes('Severe weather conditions')) {
      recommendations.push('Check weather updates regularly');
      recommendations.push('Carry rain gear during monsoon season');
    }

    if (factors.includes('Heavy traffic congestion')) {
      recommendations.push('Use public transport when available');
      recommendations.push('Plan for extra travel time');
      recommendations.push('Consider using Namma Metro in Bangalore');
    }

    recommendations.push('Download Karnataka Tourism app');
    recommendations.push('Keep local emergency numbers: Police (100), Fire (101), Ambulance (108)');
    
    return recommendations;
  }

  // Default data methods
  getDefaultWeatherData(location) {
    return {
      temperature: 26,
      humidity: 65,
      windSpeed: 8,
      visibility: 10,
      condition: 'Clear',
      riskFactors: []
    };
  }

  getDefaultTrafficData() {
    return {
      congestionLevel: 'moderate',
      riskScore: 40,
      majorRoutes: ['State Highway'],
      roadConditions: 'fair'
    };
  }

  getDefaultIncidentData() {
    return {
      incidents: [],
      totalCount: 0,
      riskScore: 30,
      lastUpdated: new Date()
    };
  }

  getDefaultTourismData(location) {
    return {
      touristAreas: this.getKarnatakaTouristAreas(location),
      safetyTips: this.getKarnatakaSafetyTips(),
      riskScore: 25
    };
  }

  // Helper methods
  getRiskLevel(score) {
    if (score >= 80) return 'Very High';
    if (score >= 60) return 'High';
    if (score >= 40) return 'Medium';
    if (score >= 20) return 'Low';
    return 'Very Low';
  }

  getKarnatakaTouristAreas(location) {
    const areas = {
      'bangalore': ['Lalbagh', 'Cubbon Park', 'Bangalore Palace', 'ISKCON Temple'],
      'mysore': ['Mysore Palace', 'Chamundi Hills', 'Brindavan Gardens'],
      'hampi': ['Virupaksha Temple', 'Vittala Temple', 'Hampi Bazaar'],
      'coorg': ['Abbey Falls', 'Raja Seat', 'Dubare Elephant Camp']
    };

    const locationKey = Object.keys(areas).find(key => 
      location.toLowerCase().includes(key)
    );

    return areas[locationKey] || ['Local attractions', 'City center'];
  }

  getKarnatakaSafetyTips() {
    return [
      'Respect local customs and traditions',
      'Dress modestly when visiting temples',
      'Be cautious during festival seasons',
      'Use official tourism guides',
      'Keep copies of important documents',
      'Learn basic Kannada phrases for better communication'
    ];
  }

  // Additional helper methods for risk calculations
  assessWeatherRisk(data) {
    let risk = 0;
    if (data.temperature > 35) risk += 30;
    if (data.humidity > 80) risk += 20;
    if (data.windSpeed > 25) risk += 25;
    if (data.riskFactors && data.riskFactors.length > 0) risk += 25;
    return Math.min(risk, 100);
  }

  calculateCongestionForLocation(location, timeOfDay) {
    // Peak hours: 8-10 AM, 5-8 PM
    const isPeakHour = (timeOfDay >= 8 && timeOfDay <= 10) || (timeOfDay >= 17 && timeOfDay <= 20);
    
    if (location.toLowerCase().includes('bangalore') && isPeakHour) {
      return 'heavy';
    } else if (isPeakHour) {
      return 'moderate';
    }
    return 'light';
  }

  calculateIncidentRisk(incidents) {
    if (incidents.length === 0) return 20;
    
    const severityWeight = {
      'high': 30,
      'medium': 20,
      'low': 10
    };

    const totalRisk = incidents.reduce((sum, incident) => {
      return sum + (severityWeight[incident.severity] || 15);
    }, 0);

    return Math.min(totalRisk, 100);
  }

  categorizeIncident(title) {
    const title_lower = title.toLowerCase();
    if (title_lower.includes('accident') || title_lower.includes('crash')) return 'traffic_accident';
    if (title_lower.includes('theft') || title_lower.includes('robbery')) return 'crime';
    if (title_lower.includes('flood') || title_lower.includes('rain')) return 'weather';
    if (title_lower.includes('fire')) return 'fire';
    return 'general';
  }

  assessIncidentSeverity(title, description) {
    const content = `${title} ${description}`.toLowerCase();
    if (content.includes('death') || content.includes('killed') || content.includes('fatal')) return 'high';
    if (content.includes('injured') || content.includes('hurt') || content.includes('serious')) return 'medium';
    return 'low';
  }

  extractLocation(title, description) {
    const content = `${title} ${description}`;
    const district = this.karnatakaDistricts.find(dist => 
      content.toLowerCase().includes(dist.toLowerCase())
    );
    return district || 'Karnataka';
  }
}

module.exports = new KarnatakaAPIService();