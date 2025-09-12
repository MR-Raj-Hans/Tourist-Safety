import React, { useState, useEffect, useRef } from 'react';
import { FiMapPin, FiNavigation, FiWifi, FiBattery, FiSatellite, FiShield, FiAlertTriangle, FiSettings } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const LocationTracking = () => {
  const { t } = useTranslation();
  const mapRef = useRef(null);
  const [tracking, setTracking] = useState(true);
  const [currentLocation, setCurrentLocation] = useState({ lat: 40.7580, lng: -73.9855 });
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [signalStrength, setSignalStrength] = useState(4);
  const [touristPosition, setTouristPosition] = useState({ x: 50, y: 50 });
  const [isInSafeZone, setIsInSafeZone] = useState(true);

  // Predefined zones
  const safeZones = [
    { id: 1, name: 'Tourist Center', center: { x: 30, y: 40 }, radius: 15 },
    { id: 2, name: 'Hotel District', center: { x: 70, y: 30 }, radius: 12 },
    { id: 3, name: 'Shopping Mall', center: { x: 45, y: 75 }, radius: 10 }
  ];

  const restrictedZones = [
    { id: 1, name: 'Construction Area', center: { x: 20, y: 80 }, radius: 8 },
    { id: 2, name: 'Restricted Zone', center: { x: 85, y: 70 }, radius: 12 }
  ];

  // Simulate tourist movement
  useEffect(() => {
    if (!tracking) return;

    const interval = setInterval(() => {
      setTouristPosition(prev => ({
        x: Math.max(5, Math.min(95, prev.x + (Math.random() - 0.5) * 4)),
        y: Math.max(5, Math.min(95, prev.y + (Math.random() - 0.5) * 4))
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [tracking]);

  // Check if tourist is in safe zone
  useEffect(() => {
    const inSafe = safeZones.some(zone => {
      const distance = Math.sqrt(
        Math.pow(touristPosition.x - zone.center.x, 2) + 
        Math.pow(touristPosition.y - zone.center.y, 2)
      );
      return distance <= zone.radius;
    });
    setIsInSafeZone(inSafe);
  }, [touristPosition]);

  const ZoneCircle = ({ zone, color, opacity = 0.3 }) => (
    <div
      className={`absolute rounded-full border-2 ${color} animate-pulse`}
      style={{
        left: `${zone.center.x - zone.radius}%`,
        top: `${zone.center.y - zone.radius}%`,
        width: `${zone.radius * 2}%`,
        height: `${zone.radius * 2}%`,
        backgroundColor: color.includes('green') ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        borderColor: color.includes('green') ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)',
        boxShadow: `0 0 20px ${color.includes('green') ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-medium text-white bg-black/50 px-2 py-1 rounded">
          {zone.name}
        </span>
      </div>
    </div>
  );

  const TouristIcon = () => (
    <div
      className="absolute w-4 h-4 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-2000 ease-in-out"
      style={{
        left: `${touristPosition.x}%`,
        top: `${touristPosition.y}%`
      }}
    >
      {/* Pulse effect */}
      <div className={`absolute inset-0 rounded-full animate-ping ${isInSafeZone ? 'bg-green-400' : 'bg-red-400'}`}></div>
      <div className={`absolute inset-0 rounded-full ${isInSafeZone ? 'bg-green-500' : 'bg-red-500'} shadow-lg`}>
        <FiNavigation className="w-4 h-4 text-white absolute inset-0 m-auto" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-800">
      {/* Status Bar */}
      <div className="bg-gray-900/90 backdrop-blur-sm border-b border-gray-700/50 px-4 py-3">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-6">
            <h1 className="text-white font-bold text-lg">{t('Location Tracking')}</h1>
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
              tracking ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${tracking ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
              <span className="text-sm font-medium">
                {tracking ? t('Tracking Active') : t('Tracking Disabled')}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Signal Strength */}
            <div className="flex items-center space-x-2 text-gray-300">
              <FiWifi className="w-4 h-4" />
              <div className="flex space-x-1">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 h-3 rounded ${
                      i < signalStrength ? 'bg-green-400' : 'bg-gray-600'
                    }`}
                  ></div>
                ))}
              </div>
            </div>

            {/* Battery */}
            <div className="flex items-center space-x-2 text-gray-300">
              <FiBattery className="w-4 h-4" />
              <span className="text-sm">{batteryLevel}%</span>
            </div>

            {/* GPS Status */}
            <div className="flex items-center space-x-2 text-green-400">
              <FiSatellite className="w-4 h-4" />
              <span className="text-sm">{t('GPS Connected')}</span>
            </div>

            {/* Tracking Toggle */}
            <button
              onClick={() => setTracking(!tracking)}
              className={`p-2 rounded-lg transition-colors ${
                tracking ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
              } text-white`}
            >
              {tracking ? t('Stop') : t('Start')}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)]">
        {/* Map Section */}
        <div className="flex-1 relative overflow-hidden">
          {/* Map Container */}
          <div 
            ref={mapRef}
            className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 relative"
            style={{
              backgroundImage: `
                radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 75% 75%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
                linear-gradient(135deg, rgba(17, 24, 39, 0.8) 0%, rgba(31, 41, 55, 0.6) 100%)
              `
            }}
          >
            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="grid grid-cols-10 grid-rows-10 h-full w-full">
                {[...Array(100)].map((_, i) => (
                  <div key={i} className="border border-gray-600/30"></div>
                ))}
              </div>
            </div>

            {/* Safe Zones */}
            {safeZones.map(zone => (
              <ZoneCircle key={`safe-${zone.id}`} zone={zone} color="border-green-400" />
            ))}

            {/* Restricted Zones */}
            {restrictedZones.map(zone => (
              <ZoneCircle key={`restricted-${zone.id}`} zone={zone} color="border-red-400" />
            ))}

            {/* Tourist Position */}
            {tracking && <TouristIcon />}

            {/* Map Controls */}
            <div className="absolute top-4 right-4 space-y-2">
              <button className="bg-gray-800/80 backdrop-blur-sm text-white p-3 rounded-lg hover:bg-gray-700/80 transition-colors">
                <FiSettings className="w-5 h-5" />
              </button>
              <button className="bg-gray-800/80 backdrop-blur-sm text-white p-3 rounded-lg hover:bg-gray-700/80 transition-colors">
                <FiMapPin className="w-5 h-5" />
              </button>
            </div>

            {/* Current Location Info */}
            <div className="absolute bottom-4 left-4 bg-gray-800/90 backdrop-blur-sm border border-gray-600/50 rounded-lg p-4 text-white max-w-sm">
              <div className="flex items-center space-x-2 mb-2">
                <FiMapPin className="w-4 h-4 text-blue-400" />
                <span className="font-medium">{t('Current Location')}</span>
              </div>
              <p className="text-sm text-gray-300 mb-1">Times Square, New York</p>
              <p className="text-xs text-gray-400">40.7580° N, 73.9855° W</p>
              <div className="mt-2 flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isInSafeZone ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className={`text-xs font-medium ${isInSafeZone ? 'text-green-400' : 'text-red-400'}`}>
                  {isInSafeZone ? t('In Safe Zone') : t('Outside Safe Zone')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Panel */}
        <div className="lg:w-80 bg-gray-900/50 backdrop-blur-sm border-l border-gray-700/50 p-6 space-y-6 overflow-y-auto">
          {/* Zone Status */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center space-x-2">
              <FiShield className="w-5 h-5" />
              <span>{t('Zone Status')}</span>
            </h3>
            
            <div className="space-y-3">
              <div className={`p-3 rounded-lg border ${
                isInSafeZone 
                  ? 'bg-green-900/30 border-green-600 text-green-300' 
                  : 'bg-red-900/30 border-red-600 text-red-300'
              }`}>
                <div className="flex items-center space-x-2">
                  {isInSafeZone ? <FiShield className="w-4 h-4" /> : <FiAlertTriangle className="w-4 h-4" />}
                  <span className="font-medium">
                    {isInSafeZone ? t('Safe Zone') : t('Caution Zone')}
                  </span>
                </div>
                <p className="text-xs mt-1 opacity-80">
                  {isInSafeZone 
                    ? t('You are in a monitored safe area') 
                    : t('Please move to a designated safe zone')
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Safe Zones List */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('Safe Zones')}</h3>
            <div className="space-y-2">
              {safeZones.map(zone => (
                <div key={zone.id} className="bg-green-900/20 border border-green-700/30 rounded-lg p-3">
                  <div className="flex items-center space-x-2 text-green-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="font-medium text-sm">{t(zone.name)}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{t('Monitored 24/7')}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Restricted Zones List */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('Restricted Zones')}</h3>
            <div className="space-y-2">
              {restrictedZones.map(zone => (
                <div key={zone.id} className="bg-red-900/20 border border-red-700/30 rounded-lg p-3">
                  <div className="flex items-center space-x-2 text-red-400">
                    <FiAlertTriangle className="w-3 h-3" />
                    <span className="font-medium text-sm">{t(zone.name)}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{t('Avoid this area')}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tracking Statistics */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('Tracking Stats')}</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">{t('Distance Traveled')}</span>
                <span className="text-white">2.4 km</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">{t('Time in Safe Zones')}</span>
                <span className="text-green-400">87%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">{t('Average Speed')}</span>
                <span className="text-white">3.2 km/h</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">{t('Last Update')}</span>
                <span className="text-blue-400">{t('Just now')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationTracking;