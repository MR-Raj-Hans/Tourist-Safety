import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import HeatmapLayer from './HeatmapLayer';
import { FiWifi, FiBattery, FiShield, FiTarget, FiLayers } from 'react-icons/fi';
import { getDistance } from 'geolib';
import axios from 'axios';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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
  const [followMode, setFollowMode] = useState(true);
  const [speed, setSpeed] = useState(0);
  const [currentAddress, setCurrentAddress] = useState('Loading...');
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [dangerZones, setDangerZones] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [alertRadius] = useState(3000); // Reduced to 3km
  const [lastPosition, setLastPosition] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const watchIdRef = useRef(null);
  const dataFetchTimeoutRef = useRef(null);
  
  // Real-time data states (simplified)
  const [realTimeWeather, setRealTimeWeather] = useState(null);
  const [realTimeIncidents, setRealTimeIncidents] = useState([]);
  const [lastDataUpdate, setLastDataUpdate] = useState(null);

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
    }
  ];

  // Sample danger zones data (simplified)
  const sampleDangerZones = [
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
    }
  ];

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
  }, [tracking, reverseGeocode]);

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
  }, [currentPosition.lat, currentPosition.lng, fetchEssentialData]);

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

      {/* Weather Panel */}
      {realTimeWeather && (
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
        <Marker position={[currentPosition.lat, currentPosition.lng]}>
          <Popup>
            <div className="text-center">
              <strong>Your Location</strong><br />
              Accuracy: ±{lastPosition?.accuracy?.toFixed(0) || 'Unknown'}m<br />
              Speed: {speed.toFixed(1)} km/h
            </div>
          </Popup>
        </Marker>

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
          <HeatmapLayer data={heatmapData} />
        )}
      </MapContainer>
    </div>
  );
};

export default StableLocationTracking;