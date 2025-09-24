import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import HeatmapLayer from './HeatmapLayer';
import { FiWifi, FiBattery, FiShield, FiTarget, FiLayers, FiList, FiPhone, FiNavigation } from 'react-icons/fi';
import { getDistance } from 'geolib';
import axios from 'axios';
import nearbyPlacesService from '../services/nearbyPlaces';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different place types
const createCustomIcon = (color, emoji) => {
  return L.divIcon({
    html: `<div style="background-color: ${color}; border: 2px solid white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${emoji}</div>`,
    className: 'custom-div-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });
};

const placeIcons = {
  police: createCustomIcon('#3B82F6', '👮‍♂️'),
  hospital: createCustomIcon('#EF4444', '🏥'),
  embassy: createCustomIcon('#8B5CF6', '🏛️'),
  transport: createCustomIcon('#10B981', '🚇'),
  current: L.divIcon({
    html: '<div style="background-color: #FF0000; border: 3px solid white; border-radius: 50%; width: 20px; height: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.3); animation: pulse 2s infinite;"></div>',
    className: 'current-location-icon',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  })
};

const StableLocationTracking = () => {
  const mapRef = useRef(null);
  const [tracking, setTracking] = useState(true);
  const [batteryLevel] = useState(85);
  const [signalStrength, setSignalStrength] = useState(4);
  const [currentPosition, setCurrentPosition] = useState({ lat: 28.6139, lng: 77.2090 }); // Default to Delhi
  const [isInSafeZone, setIsInSafeZone] = useState(true);
  const [movementTrail, setMovementTrail] = useState([]);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showZones, setShowZones] = useState(true);
  const [speed, setSpeed] = useState(0);
  const [currentAddress, setCurrentAddress] = useState('Loading...');
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [dangerZones, setDangerZones] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [lastPosition, setLastPosition] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const watchIdRef = useRef(null);
  const dataFetchTimeoutRef = useRef(null);
  
  // Real-time data states (simplified)
  const [realTimeWeather, setRealTimeWeather] = useState(null);
  const [lastDataUpdate, setLastDataUpdate] = useState(null);

  // Nearby places states
  const [nearbyPlaces, setNearbyPlaces] = useState({
    police: [],
    hospitals: [],
    embassies: [],
    transport: []
  });
  const [showNearbyPanel, setShowNearbyPanel] = useState(false);
  const [nearbyPlacesLoading, setNearbyPlacesLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);

  // GPS Tracking Implementation
  const startGPSTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      return;
    }

    setLocationError(null);

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        setCurrentPosition(newPosition);
        setLastPosition(position.coords);
        
        // Calculate speed
        if (position.coords.speed !== null) {
          setSpeed(position.coords.speed * 3.6); // Convert m/s to km/h
        }
        
        // Add to movement trail
        setMovementTrail(prev => [...prev.slice(-50), newPosition]); // Keep last 50 points
        
        console.log('GPS Position updated:', newPosition);
      },
      (error) => {
        console.error('GPS Error:', error);
        setLocationError(`GPS Error: ${error.message}`);
      },
      options
    );
  }, []);

  const stopGPSTracking = useCallback(() => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setLocationError(null);
      console.log('GPS tracking stopped');
    }
  }, []);

  // Effect to handle tracking state changes
  useEffect(() => {
    if (tracking) {
      startGPSTracking();
    } else {
      stopGPSTracking();
    }

    return () => {
      stopGPSTracking();
    };
  }, [tracking, startGPSTracking, stopGPSTracking]);

  // Sample safe zones data
  const safeZones = [
    {
      id: 'police_cp',
      name: 'Connaught Place Police Station',
      type: 'police',
      icon: '👮',
      lat: 28.6315,
      lng: 77.2167,
      radius: 300
    },
    {
      id: 'hospital_aiims',
      name: 'AIIMS Hospital',
      type: 'medical',
      icon: '🏥',
      lat: 28.5672,
      lng: 77.2100,
      radius: 500
    },
    {
      id: 'metro_rajiv',
      name: 'Rajiv Chowk Metro Station',
      type: 'transport',
      icon: '🚇',
      lat: 28.6330,
      lng: 77.2194,
      radius: 200
    },
    {
      id: 'embassy_area',
      name: 'Embassy District',
      type: 'diplomatic',
      icon: '🏛️',
      lat: 28.5976,
      lng: 77.1892,
      radius: 800
    },
    {
      id: 'india_gate',
      name: 'India Gate Tourist Area',
      type: 'tourist',
      icon: '🏛️',
      lat: 28.6129,
      lng: 77.2295,
      radius: 600
    },
    {
      id: 'airport_metro',
      name: 'Airport Express Metro',
      type: 'transport',
      icon: '✈️',
      lat: 28.5562,
      lng: 77.1188,
      radius: 400
    }
  ];

  // Generate heatmap data based on movement trail and zones
  useEffect(() => {
    if (movementTrail.length > 0) {
      const heatPoints = [];
      
      // Add movement trail points with varying intensity
      movementTrail.forEach((point, index) => {
        const intensity = Math.min(1.0, (index + 1) / movementTrail.length);
        heatPoints.push({
          lat: point.lat,
          lng: point.lng,
          intensity: intensity
        });
      });
      
      // Add high-intensity points around danger zones
      dangerZones.forEach(zone => {
        heatPoints.push({
          lat: zone.lat,
          lng: zone.lng,
          intensity: 0.9
        });
      });
      
      // Add activity points around current location
      for (let i = 0; i < 10; i++) {
        const latOffset = (Math.random() - 0.5) * 0.01;
        const lngOffset = (Math.random() - 0.5) * 0.01;
        heatPoints.push({
          lat: currentPosition.lat + latOffset,
          lng: currentPosition.lng + lngOffset,
          intensity: Math.random() * 0.8
        });
      }
      
      setHeatmapData(heatPoints);
    }
  }, [movementTrail, dangerZones, currentPosition]);

  // Sample danger zones data (enhanced) - wrapped in useMemo to prevent re-creation
  const sampleDangerZones = useMemo(() => [
    {
      id: 'high_crime_area',
      name: 'High Crime Zone',
      type: 'crime',
      icon: '⚠️',
      lat: 28.6506,
      lng: 77.2334,
      radius: 600,
      riskLevel: 'high',
      description: 'High crime area - stay alert'
    },
    {
      id: 'construction_zone',
      name: 'Construction Site',
      type: 'construction',
      icon: '🚧',
      lat: 28.6200,
      lng: 77.2000,
      radius: 300,
      riskLevel: 'medium',
      description: 'Active construction - avoid area'
    },
    {
      id: 'protest_area',
      name: 'Protest Zone',
      type: 'civil_unrest',
      icon: '📢',
      lat: 28.6100,
      lng: 77.2300,
      radius: 500,
      riskLevel: 'high',
      description: 'Civil unrest reported - detour recommended'
    }
  ], []);

  // Reverse geocoding function
  const reverseGeocode = useCallback(async (position) => {
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
        params: {
          lat: position.lat,
          lon: position.lng,
          format: 'json',
          addressdetails: 1
        },
        timeout: 8000
      });
      
      if (response.data && response.data.display_name) {
        setCurrentAddress(response.data.display_name);
      }
    } catch (error) {
      console.warn('Reverse geocoding failed:', error);
      setCurrentAddress('Address unavailable');
    }
  }, []);

  // Simplified location tracking
  useEffect(() => {
    if (tracking && navigator.geolocation) {
      const options = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000 // 1 minute cache
      };

      let lastUpdateTime = 0;
      const updateThreshold = 10000; // 10 seconds minimum between updates

      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const now = Date.now();
          
          const newPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            speed: position.coords.speed
          };
          
          // Throttle updates
          const shouldUpdate = !lastPosition || 
                              getDistance(lastPosition, newPos) > 100 || // 100m minimum movement
                              (now - lastUpdateTime) > updateThreshold;

          if (shouldUpdate) {
            if (lastPosition) {
              const distance = getDistance(lastPosition, newPos);
              const timeDiff = (now - lastPosition.timestamp) / 1000;
              const currentSpeed = distance / timeDiff;
              setSpeed(currentSpeed * 3.6);
              
              const newSignalStrength = position.coords.accuracy < 15 ? 4 : 
                                      position.coords.accuracy < 30 ? 3 :
                                      position.coords.accuracy < 60 ? 2 : 1;
              setSignalStrength(newSignalStrength);
            }

            setCurrentPosition(newPos);
            setLastPosition({ ...newPos, timestamp: now });
            setLocationError(null);
            lastUpdateTime = now;
            
            // Add to trail (limited)
            setMovementTrail(trail => [
              ...trail.slice(-10), // Keep only last 10 positions
              { ...newPos, timestamp: now }
            ]);

            // Update address only on significant movement
            if (!lastPosition || getDistance(lastPosition, newPos) > 500) {
              reverseGeocode(newPos);
            }
          }
        },
        (error) => {
          setLocationError(error.message);
          console.error('Geolocation error:', error);
          setSignalStrength(1);
        },
        options
      );
    }

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [tracking, reverseGeocode, lastPosition]);

  // Simplified real-time data fetching (MUCH less aggressive)
  const fetchEssentialData = useCallback(async (position) => {
    if (!position.lat || !position.lng) return;
    
    try {
      setLastDataUpdate(new Date().toISOString());
      
      // Only fetch weather data (most stable API)
      const weatherResponse = await axios.get(
        `http://localhost:5000/api/weather/current/${position.lat}/${position.lng}`, 
        { timeout: 10000 }
      );

      if (weatherResponse.data && weatherResponse.data.success) {
        setRealTimeWeather(weatherResponse.data);
      }

      // Use static danger zones instead of fetching from OSM
      setDangerZones(sampleDangerZones);
      
      console.log('Essential data updated successfully');
    } catch (error) {
      console.warn('Essential data fetch failed:', error);
      // Use fallback static data
      setDangerZones(sampleDangerZones);
    }
  }, [sampleDangerZones]);

  // Fetch nearby places
  const fetchNearbyPlaces = useCallback(async (position) => {
    if (!position.lat || !position.lng) return;
    
    setNearbyPlacesLoading(true);
    try {
      console.log('Fetching nearby places for:', position);
      const places = await nearbyPlacesService.getAllNearbyPlaces(position.lat, position.lng);
      
      // Add distance and format data
      Object.keys(places).forEach(category => {
        places[category] = places[category].map(place => ({
          ...place,
          formattedDistance: nearbyPlacesService.formatDistance(place.distance),
          icon: nearbyPlacesService.getPlaceIcon(place.type, place.amenity)
        }));
      });
      
      setNearbyPlaces(places);
      console.log('Nearby places updated:', places);
    } catch (error) {
      console.error('Error fetching nearby places:', error);
    } finally {
      setNearbyPlacesLoading(false);
    }
  }, []);

  // Much less frequent data updates
  useEffect(() => {
    if (!currentPosition.lat || !currentPosition.lng) return;

    // Clear any existing timeout
    if (dataFetchTimeoutRef.current) {
      clearTimeout(dataFetchTimeoutRef.current);
    }

    // Initial fetch with delay
    dataFetchTimeoutRef.current = setTimeout(() => {
      fetchEssentialData(currentPosition);
    }, 3000);

    return () => {
      if (dataFetchTimeoutRef.current) {
        clearTimeout(dataFetchTimeoutRef.current);
      }
    };
  }, [currentPosition, fetchEssentialData]);

  // Fetch nearby places when location changes significantly
  useEffect(() => {
    if (!currentPosition.lat || !currentPosition.lng) return;
    
    const lastFetchedLocation = nearbyPlaces.lastFetchedLocation;
    
    // Only fetch if we haven't fetched before or moved more than 2km
    if (!lastFetchedLocation || 
        getDistance(
          { latitude: currentPosition.lat, longitude: currentPosition.lng },
          { latitude: lastFetchedLocation.lat, longitude: lastFetchedLocation.lng }
        ) > 2000) {
      
      // Debounce the fetch to avoid too many requests
      const timeoutId = setTimeout(() => {
        fetchNearbyPlaces(currentPosition);
        setNearbyPlaces(prev => ({
          ...prev,
          lastFetchedLocation: { lat: currentPosition.lat, lng: currentPosition.lng }
        }));
      }, 5000);

      return () => clearTimeout(timeoutId);
    }
  }, [currentPosition, fetchNearbyPlaces, nearbyPlaces.lastFetchedLocation]);

  // Simplified geofencing
  useEffect(() => {
    const checkGeofences = () => {
      const newAlerts = [];
      
      dangerZones.forEach(zone => {
        const distance = getDistance(currentPosition, { latitude: zone.lat, longitude: zone.lng });
        
        if (distance <= zone.radius) {
          newAlerts.push({
            id: zone.id,
            title: `⚠️ ${zone.type.toUpperCase()} Alert!`,
            message: `You are near ${zone.name}. ${zone.description}`,
            distance: distance,
            timestamp: Date.now(),
            type: 'danger_zone'
          });
        }
      });

      setActiveAlerts(newAlerts);
      setIsInSafeZone(newAlerts.length === 0);
    };

    checkGeofences();
  }, [currentPosition, dangerZones]);

  // Map click handler
  const MapClickHandler = () => {
    const map = useMap();
    
    useEffect(() => {
      const onClick = (e) => {
        console.log('Map clicked at:', e.latlng);
      };
      
      map.on('click', onClick);
      return () => map.off('click', onClick);
    }, [map]);

    return null;
  };

  return (
    <div className="relative h-screen bg-gray-100">
      {/* Add CSS for animations */}
      <style jsx>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.7;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .current-location-icon div {
          animation: pulse 2s infinite;
        }
      `}</style>
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-[1000] bg-white shadow-lg">
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isInSafeZone ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
            <span className={`font-semibold ${isInSafeZone ? 'text-green-700' : 'text-red-700'}`}>
              {isInSafeZone ? 'SAFE ZONE' : 'ALERT ZONE'}
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <FiWifi className={`w-4 h-4 ${signalStrength >= 3 ? 'text-green-500' : signalStrength >= 2 ? 'text-yellow-500' : 'text-red-500'}`} />
              <span className="text-xs font-mono">{signalStrength}/4</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <FiBattery className="w-4 h-4 text-green-500" />
              <span className="text-xs font-mono">{batteryLevel}%</span>
            </div>
          </div>
        </div>
        
        <div className="px-4 pb-2">
          <div className="text-sm text-gray-600 truncate">{currentAddress}</div>
          <div className="text-xs text-gray-500">
            Speed: {speed.toFixed(1)} km/h | Last update: {lastDataUpdate ? new Date(lastDataUpdate).toLocaleTimeString() : 'Never'}
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="absolute top-24 left-4 z-[1000] bg-white rounded-lg shadow-lg p-3 space-y-2">
        <button
          onClick={() => setTracking(!tracking)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg w-full ${
            tracking ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
          }`}
        >
          <FiTarget className="w-4 h-4" />
          <span className="text-sm">{tracking ? 'Stop' : 'Start'}</span>
        </button>
        
        <button
          onClick={() => setShowZones(!showZones)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg w-full ${
            showZones ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
          }`}
        >
          <FiShield className="w-4 h-4" />
          <span className="text-sm">Zones</span>
        </button>
        
        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg w-full ${
            showHeatmap ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
          }`}
        >
          <FiLayers className="w-4 h-4" />
          <span className="text-sm">Heat</span>
        </button>

        <button
          onClick={() => setShowNearbyPanel(!showNearbyPanel)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg w-full ${
            showNearbyPanel ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
          }`}
        >
          <FiList className="w-4 h-4" />
          <span className="text-sm">Places</span>
        </button>
      </div>

      {/* Alerts Panel */}
      {activeAlerts.length > 0 && (
        <div className="absolute top-4 right-4 z-[1000] max-w-sm">
          {activeAlerts.map((alert) => (
            <div key={alert.id} className="bg-red-100 border-l-4 border-red-500 p-4 mb-2 rounded shadow-lg">
              <div className="flex">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-red-800">{alert.title}</h4>
                  <p className="text-xs text-red-700 mt-1">{alert.message}</p>
                  <p className="text-xs text-red-600 mt-1">Distance: {(alert.distance/1000).toFixed(2)} km</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Nearby Places Panel */}
      {showNearbyPanel && (
        <div className="absolute bottom-4 right-4 z-[1000] bg-white rounded-lg shadow-lg max-w-md max-h-96 overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="text-lg font-semibold flex items-center">
              <FiList className="mr-2" />
              Nearby Places
              {nearbyPlacesLoading && <span className="ml-2 text-xs text-gray-500">Loading...</span>}
            </h3>
          </div>
          
          <div className="overflow-y-auto max-h-80">
            {/* Police Stations */}
            {nearbyPlaces.police.length > 0 && (
              <div className="p-3 border-b">
                <h4 className="font-medium text-blue-700 mb-2">👮‍♂️ Police Stations</h4>
                {nearbyPlaces.police.slice(0, 3).map((place) => (
                  <div key={place.id} className="mb-2 p-2 bg-blue-50 rounded text-sm">
                    <div className="font-medium">{place.name}</div>
                    <div className="text-gray-600 text-xs">{place.formattedDistance}</div>
                    {place.phone && (
                      <div className="flex items-center text-xs text-blue-600 mt-1">
                        <FiPhone className="w-3 h-3 mr-1" />
                        {place.phone}
                      </div>
                    )}
                    <button
                      onClick={() => setSelectedPlace(place)}
                      className="text-xs text-blue-600 hover:underline mt-1 flex items-center"
                    >
                      <FiNavigation className="w-3 h-3 mr-1" />
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Hospitals */}
            {nearbyPlaces.hospitals.length > 0 && (
              <div className="p-3 border-b">
                <h4 className="font-medium text-red-700 mb-2">🏥 Hospitals & Clinics</h4>
                {nearbyPlaces.hospitals.slice(0, 3).map((place) => (
                  <div key={place.id} className="mb-2 p-2 bg-red-50 rounded text-sm">
                    <div className="font-medium">{place.name}</div>
                    <div className="text-gray-600 text-xs">{place.formattedDistance}</div>
                    {place.phone && (
                      <div className="flex items-center text-xs text-red-600 mt-1">
                        <FiPhone className="w-3 h-3 mr-1" />
                        {place.phone}
                      </div>
                    )}
                    <button
                      onClick={() => setSelectedPlace(place)}
                      className="text-xs text-red-600 hover:underline mt-1 flex items-center"
                    >
                      <FiNavigation className="w-3 h-3 mr-1" />
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Embassies */}
            {nearbyPlaces.embassies.length > 0 && (
              <div className="p-3 border-b">
                <h4 className="font-medium text-purple-700 mb-2">🏛️ Embassies & Consulates</h4>
                {nearbyPlaces.embassies.slice(0, 2).map((place) => (
                  <div key={place.id} className="mb-2 p-2 bg-purple-50 rounded text-sm">
                    <div className="font-medium">{place.name}</div>
                    <div className="text-gray-600 text-xs">{place.formattedDistance}</div>
                    {place.phone && (
                      <div className="flex items-center text-xs text-purple-600 mt-1">
                        <FiPhone className="w-3 h-3 mr-1" />
                        {place.phone}
                      </div>
                    )}
                    <button
                      onClick={() => setSelectedPlace(place)}
                      className="text-xs text-purple-600 hover:underline mt-1 flex items-center"
                    >
                      <FiNavigation className="w-3 h-3 mr-1" />
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Transport */}
            {nearbyPlaces.transport.length > 0 && (
              <div className="p-3">
                <h4 className="font-medium text-green-700 mb-2">🚇 Transport Hubs</h4>
                {nearbyPlaces.transport.slice(0, 3).map((place) => (
                  <div key={place.id} className="mb-2 p-2 bg-green-50 rounded text-sm">
                    <div className="font-medium">{place.name}</div>
                    <div className="text-gray-600 text-xs">{place.formattedDistance}</div>
                    {place.phone && (
                      <div className="flex items-center text-xs text-green-600 mt-1">
                        <FiPhone className="w-3 h-3 mr-1" />
                        {place.phone}
                      </div>
                    )}
                    <button
                      onClick={() => setSelectedPlace(place)}
                      className="text-xs text-green-600 hover:underline mt-1 flex items-center"
                    >
                      <FiNavigation className="w-3 h-3 mr-1" />
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!nearbyPlacesLoading && 
             nearbyPlaces.police.length === 0 && 
             nearbyPlaces.hospitals.length === 0 && 
             nearbyPlaces.embassies.length === 0 && 
             nearbyPlaces.transport.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                <div className="text-sm">No nearby places found</div>
                <div className="text-xs mt-1">Try moving to a different location</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Weather Panel */}
      {realTimeWeather && !showNearbyPanel && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-4 max-w-xs">
          <h3 className="text-sm font-semibold mb-2">🌡️ Weather Conditions</h3>
          <div className="text-xs space-y-1">
            <p>Temperature: {realTimeWeather.weather?.main?.temp?.toFixed(1)}°C</p>
            <p>Condition: {realTimeWeather.weather?.weather?.[0]?.description || 'Clear'}</p>
            {realTimeWeather.safety?.warnings?.length > 0 && (
              <p className="text-orange-600 font-medium">⚠️ {realTimeWeather.safety.warnings[0]}</p>
            )}
          </div>
        </div>
      )}

      {/* Selected Place Details Modal */}
      {selectedPlace && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[2000] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold flex items-center">
                  {selectedPlace.icon} {selectedPlace.name}
                </h3>
                <button
                  onClick={() => setSelectedPlace(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ×
                </button>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {selectedPlace.type} • {selectedPlace.formattedDistance} away
              </div>
            </div>
            
            <div className="p-4 space-y-4 overflow-y-auto max-h-64">
              {/* Address */}
              {selectedPlace.address && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">📍 Address</h4>
                  <p className="text-sm text-gray-600">{selectedPlace.address}</p>
                </div>
              )}
              
              {/* Contact Information */}
              {selectedPlace.phone && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">📞 Contact</h4>
                  <a 
                    href={`tel:${selectedPlace.phone}`}
                    className="text-sm text-blue-600 hover:underline flex items-center"
                  >
                    <FiPhone className="w-4 h-4 mr-2" />
                    {selectedPlace.phone}
                  </a>
                </div>
              )}
              
              {/* Operating Hours */}
              {selectedPlace.opening_hours && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">🕒 Operating Hours</h4>
                  <p className="text-sm text-gray-600">{selectedPlace.opening_hours}</p>
                </div>
              )}
              
              {/* Website */}
              {selectedPlace.website && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">🌐 Website</h4>
                  <a 
                    href={selectedPlace.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Visit Website
                  </a>
                </div>
              )}
              
              {/* Additional Info */}
              {selectedPlace.operator && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">🏢 Operator</h4>
                  <p className="text-sm text-gray-600">{selectedPlace.operator}</p>
                </div>
              )}
              
              {/* Emergency Info for Hospitals */}
              {selectedPlace.type === 'hospital' && (
                <div>
                  <h4 className="font-medium text-red-700 mb-1">🚨 Emergency Info</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>• Available 24/7 for emergencies</p>
                    <p>• Call ahead for non-emergency visits</p>
                    {selectedPlace.emergency && (
                      <p>• Emergency services: {selectedPlace.emergency}</p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Police Info */}
              {selectedPlace.type === 'police' && (
                <div>
                  <h4 className="font-medium text-blue-700 mb-1">👮‍♂️ Police Services</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>• Report crimes and incidents</p>
                    <p>• Tourist assistance available</p>
                    <p>• Emergency dial: 100</p>
                    {selectedPlace.police_type && (
                      <p>• Type: {selectedPlace.police_type}</p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Embassy Info */}
              {selectedPlace.type === 'embassy' && (
                <div>
                  <h4 className="font-medium text-purple-700 mb-1">🏛️ Consular Services</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>• Passport and visa services</p>
                    <p>• Citizen services</p>
                    <p>• Emergency assistance</p>
                    <p>• Appointment usually required</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t bg-gray-50 flex space-x-3">
              <button
                onClick={() => {
                  const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.lat},${selectedPlace.lng}`;
                  window.open(url, '_blank');
                }}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 flex items-center justify-center"
              >
                <FiNavigation className="w-4 h-4 mr-2" />
                Get Directions
              </button>
              
              {selectedPlace.phone && (
                <button
                  onClick={() => window.location.href = `tel:${selectedPlace.phone}`}
                  className="flex-1 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 flex items-center justify-center"
                >
                  <FiPhone className="w-4 h-4 mr-2" />
                  Call Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {locationError && (
        <div className="absolute bottom-4 right-4 z-[1000] bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <span className="text-sm">Location Error: {locationError}</span>
        </div>
      )}

      {/* Map */}
      <MapContainer
        ref={mapRef}
        center={[currentPosition.lat, currentPosition.lng]}
        zoom={15}
        className="h-full w-full"
        key={`${currentPosition.lat}-${currentPosition.lng}`}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <MapClickHandler />
        
        {/* Current Position Marker */}
        <Marker 
          position={[currentPosition.lat, currentPosition.lng]}
          icon={placeIcons.current}
        >
          <Popup>
            <div className="text-center">
              <strong>📍 Your Location</strong><br />
              Accuracy: ±{lastPosition?.accuracy?.toFixed(0) || 'Unknown'}m<br />
              Speed: {speed.toFixed(1)} km/h
            </div>
          </Popup>
        </Marker>

        {/* Nearby Places Markers */}
        {Object.entries(nearbyPlaces).map(([category, places]) => 
          places.map && places.map((place) => (
            <Marker
              key={`${category}-${place.id}`}
              position={[place.lat, place.lng]}
              icon={placeIcons[place.type] || placeIcons.transport}
            >
              <Popup>
                <div className="min-w-48">
                  <div className="font-semibold text-lg mb-2">
                    {place.icon} {place.name}
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div><strong>Distance:</strong> {place.formattedDistance}</div>
                    
                    {place.address && (
                      <div><strong>Address:</strong> {place.address}</div>
                    )}
                    
                    {place.phone && (
                      <div className="flex items-center">
                        <FiPhone className="w-3 h-3 mr-1" />
                        <a href={`tel:${place.phone}`} className="text-blue-600 hover:underline">
                          {place.phone}
                        </a>
                      </div>
                    )}
                    
                    {place.opening_hours && (
                      <div><strong>Hours:</strong> {place.opening_hours}</div>
                    )}
                    
                    {place.website && (
                      <div>
                        <a 
                          href={place.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-xs"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 flex space-x-2">
                    <button
                      onClick={() => setSelectedPlace(place)}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
                    >
                      View Details
                    </button>
                    
                    <button
                      onClick={() => {
                        const url = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;
                        window.open(url, '_blank');
                      }}
                      className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 flex items-center"
                    >
                      <FiNavigation className="w-3 h-3 mr-1" />
                      Navigate
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))
        )}

        {/* Safe Zones */}
        {showZones && safeZones.map((zone) => (
          <React.Fragment key={zone.id}>
            <Circle
              center={[zone.lat, zone.lng]}
              radius={zone.radius}
              pathOptions={{ color: 'green', fillColor: 'green', fillOpacity: 0.1 }}
            />
            <Marker position={[zone.lat, zone.lng]}>
              <Popup>
                <div>
                  <strong>{zone.icon} {zone.name}</strong><br />
                  Type: {zone.type}<br />
                  Safe radius: {zone.radius}m
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        ))}

        {/* Danger Zones */}
        {showZones && dangerZones.map((zone) => (
          <React.Fragment key={zone.id}>
            <Circle
              center={[zone.lat, zone.lng]}
              radius={zone.radius}
              pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.2 }}
            />
            <Marker position={[zone.lat, zone.lng]}>
              <Popup>
                <div>
                  <strong>{zone.icon} {zone.name}</strong><br />
                  Risk Level: {zone.riskLevel}<br />
                  {zone.description}
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        ))}

        {/* Heatmap Layer */}
        {showHeatmap && heatmapData.length > 0 && (
          <HeatmapLayer points={heatmapData} show={showHeatmap} />
        )}
      </MapContainer>
    </div>
  );
};

export default StableLocationTracking;