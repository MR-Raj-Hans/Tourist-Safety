import React, { useState, useEffect, useRef } from 'react';
import { FiMapPin, FiNavigation, FiWifi, FiBattery, FiRadio, FiShield, FiAlertTriangle, FiSettings, FiTarget, FiActivity, FiClock, FiZap } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const LocationTracking = () => {
  const { t } = useTranslation();
  const mapRef = useRef(null);
  const [tracking, setTracking] = useState(true);
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [signalStrength, setSignalStrength] = useState(4);
  const [touristPosition, setTouristPosition] = useState({ x: 50, y: 50 });
  const [isInSafeZone, setIsInSafeZone] = useState(true);
  const [animationStep, setAnimationStep] = useState(0);
  const [movementTrail, setMovementTrail] = useState([]);

  // Enhanced zones with more detailed properties
  const safeZones = [
    { 
      id: 1, 
      name: 'Tourist Center', 
      center: { x: 30, y: 40 }, 
      radius: 15,
      type: 'safe',
      color: 'emerald',
      description: 'Main tourist information center'
    },
    { 
      id: 2, 
      name: 'Hotel District', 
      center: { x: 70, y: 30 }, 
      radius: 12,
      type: 'safe',
      color: 'blue',
      description: 'Secure accommodation area'
    },
    { 
      id: 3, 
      name: 'Shopping Mall', 
      center: { x: 45, y: 75 }, 
      radius: 10,
      type: 'safe',
      color: 'purple',
      description: 'Commercial shopping district'
    }
  ];

  const restrictedZones = [
    { 
      id: 4, 
      name: 'Construction Zone', 
      center: { x: 15, y: 75 }, 
      radius: 8,
      type: 'restricted',
      color: 'red',
      description: 'Active construction - restricted access'
    },
    { 
      id: 5, 
      name: 'High Crime Area', 
      center: { x: 85, y: 70 }, 
      radius: 12,
      type: 'restricted',
      color: 'orange',
      description: 'Higher risk area - exercise caution'
    }
  ];

  const allZones = [...safeZones, ...restrictedZones];

  // Enhanced movement simulation with smooth trail
  useEffect(() => {
    const moveInterval = setInterval(() => {
      setTouristPosition(prev => {
        const newX = prev.x + (Math.random() - 0.5) * 3;
        const newY = prev.y + (Math.random() - 0.5) * 3;
        const clampedX = Math.max(5, Math.min(95, newX));
        const clampedY = Math.max(5, Math.min(95, newY));
        
        // Add to movement trail
        setMovementTrail(trail => [
          ...trail.slice(-10), // Keep last 10 positions
          { x: clampedX, y: clampedY, timestamp: Date.now() }
        ]);
        
        return { x: clampedX, y: clampedY };
      });
    }, 2000);

    return () => clearInterval(moveInterval);
  }, []);

  // Animation loop for smooth effects
  useEffect(() => {
    const animationInterval = setInterval(() => {
      setAnimationStep(prev => (prev + 1) % 360);
    }, 50);

    return () => clearInterval(animationInterval);
  }, []);

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

  const getZoneColor = (zone) => {
    const colors = {
      emerald: zone.type === 'safe' ? 'rgb(16, 185, 129)' : 'rgb(239, 68, 68)',
      blue: zone.type === 'safe' ? 'rgb(59, 130, 246)' : 'rgb(239, 68, 68)',
      purple: zone.type === 'safe' ? 'rgb(147, 51, 234)' : 'rgb(239, 68, 68)',
      red: 'rgb(239, 68, 68)',
      orange: 'rgb(249, 115, 22)'
    };
    return colors[zone.color] || colors.emerald;
  };

  const toggleTracking = () => {
    setTracking(!tracking);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/30 to-slate-800">
      {/* Minimal Futuristic Status Bar */}
      <div className="bg-black/60 backdrop-blur-xl border-b border-blue-500/30">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left Status */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <FiTarget className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 font-medium text-sm">GPS TRACKING</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${tracking ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`}></div>
                <span className={`text-sm ${tracking ? 'text-green-400' : 'text-gray-500'}`}>
                  {tracking ? 'ACTIVE' : 'PAUSED'}
                </span>
              </div>
            </div>
            
            {/* Center Location */}
            <div className="hidden md:flex items-center space-x-2">
              <FiMapPin className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 text-sm font-mono">
                {touristPosition.x.toFixed(1)}°N, {touristPosition.y.toFixed(1)}°E
              </span>
            </div>
            
            {/* Right Stats */}
            <div className="flex items-center space-x-4">
              {/* Signal Strength */}
              <div className="flex items-center space-x-2">
                <FiWifi className="w-4 h-4 text-green-400" />
                <div className="flex space-x-1">
                  {[1, 2, 3, 4].map(bar => (
                    <div 
                      key={bar}
                      className={`w-1 h-3 rounded-full ${
                        bar <= signalStrength ? 'bg-green-400' : 'bg-gray-600'
                      }`}
                    ></div>
                  ))}
                </div>
              </div>
              
              {/* Battery */}
              <div className="flex items-center space-x-2">
                <FiBattery className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 text-sm font-mono">{batteryLevel}%</span>
              </div>
              
              {/* Time */}
              <div className="text-gray-400 text-sm font-mono">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Main Map Container */}
        <div className="bg-black/40 backdrop-blur-xl rounded-3xl border border-blue-500/30 overflow-hidden mb-6">
          {/* Map Header */}
          <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 p-4 border-b border-blue-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/20 rounded-xl">
                  <FiNavigation className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Live GPS Tracking</h2>
                  <p className="text-blue-300 text-sm">Real-time location monitoring</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  isInSafeZone 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {isInSafeZone ? 'SAFE ZONE' : 'CAUTION AREA'}
                </div>
                
                <button
                  onClick={toggleTracking}
                  className={`px-4 py-2 rounded-xl border transition-all duration-300 ${
                    tracking 
                      ? 'bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30' 
                      : 'bg-green-500/20 border-green-500/50 text-green-400 hover:bg-green-500/30'
                  }`}
                >
                  {tracking ? 'Pause' : 'Resume'}
                </button>
              </div>
            </div>
          </div>
          
          {/* Interactive Map */}
          <div className="relative h-96 bg-gradient-to-br from-slate-800 to-slate-900">
            <svg
              ref={mapRef}
              width="100%"
              height="100%"
              className="absolute inset-0"
              viewBox="0 0 100 100"
            >
              {/* Grid Pattern */}
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(59, 130, 246, 0.1)" strokeWidth="0.5"/>
                </pattern>
                
                {/* Glowing filters */}
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              <rect width="100" height="100" fill="url(#grid)" />
              
              {/* Movement Trail */}
              {movementTrail.map((point, index) => (
                <circle
                  key={index}
                  cx={point.x}
                  cy={point.y}
                  r={0.5}
                  fill="rgba(59, 130, 246, 0.6)"
                  opacity={index / movementTrail.length}
                />
              ))}
              
              {/* Zone Circles */}
              {allZones.map(zone => (
                <g key={zone.id}>
                  {/* Zone Background */}
                  <circle
                    cx={zone.center.x}
                    cy={zone.center.y}
                    r={zone.radius}
                    fill={getZoneColor(zone)}
                    fillOpacity={zone.type === 'safe' ? 0.15 : 0.1}
                    stroke={getZoneColor(zone)}
                    strokeOpacity={0.4}
                    strokeWidth="0.5"
                  />
                  
                  {/* Pulsing Border */}
                  <circle
                    cx={zone.center.x}
                    cy={zone.center.y}
                    r={zone.radius + Math.sin(animationStep * 0.05) * 2}
                    fill="none"
                    stroke={getZoneColor(zone)}
                    strokeOpacity={0.6}
                    strokeWidth="0.3"
                    filter="url(#glow)"
                  />
                  
                  {/* Zone Label */}
                  <text
                    x={zone.center.x}
                    y={zone.center.y - zone.radius - 2}
                    textAnchor="middle"
                    fontSize="2"
                    fill={getZoneColor(zone)}
                    className="font-semibold"
                  >
                    {zone.name}
                  </text>
                </g>
              ))}
              
              {/* Tourist Position with Smooth Animation */}
              <g transform={`translate(${touristPosition.x}, ${touristPosition.y})`}>
                {/* Outer Pulse Ring */}
                <circle
                  r={3 + Math.sin(animationStep * 0.1) * 1.5}
                  fill="none"
                  stroke="rgba(59, 130, 246, 0.8)"
                  strokeWidth="0.5"
                  opacity={0.7}
                />
                
                {/* Direction Indicator */}
                <polygon
                  points="0,-2 1.5,1.5 0,0.5 -1.5,1.5"
                  fill="rgba(59, 130, 246, 0.9)"
                  transform={`rotate(${animationStep * 2})`}
                />
                
                {/* Center Dot */}
                <circle
                  r="1"
                  fill="#3b82f6"
                  filter="url(#glow)"
                />
              </g>
            </svg>
            
            {/* Zone Information Overlay */}
            <div className="absolute top-4 left-4 space-y-2">
              {allZones.map(zone => (
                <div 
                  key={zone.id}
                  className={`bg-black/60 backdrop-blur-md rounded-lg px-3 py-2 border ${
                    zone.type === 'safe' 
                      ? 'border-green-500/30' 
                      : 'border-red-500/30'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div 
                      className={`w-2 h-2 rounded-full ${
                        zone.type === 'safe' ? 'bg-green-400' : 'bg-red-400'
                      }`}
                    ></div>
                    <span className="text-white text-xs font-medium">{zone.name}</span>
                  </div>
                  <p className="text-gray-400 text-xs mt-1">{zone.description}</p>
                </div>
              ))}
            </div>
            
            {/* Live Status Overlay */}
            <div className="absolute bottom-4 right-4">
              <div className="bg-black/80 backdrop-blur-md rounded-xl p-4 border border-blue-500/30">
                <div className="flex items-center space-x-3 mb-3">
                  <FiActivity className="w-5 h-5 text-blue-400" />
                  <span className="text-white font-semibold">Live Status</span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Speed:</span>
                    <span className="text-white">2.3 km/h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Accuracy:</span>
                    <span className="text-green-400">±3m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Update:</span>
                    <span className="text-blue-400">Live</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Control Panel */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-blue-500/30 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FiZap className="w-5 h-5 text-yellow-400 mr-2" />
              Quick Actions
            </h3>
            
            <div className="space-y-3">
              <button className="w-full p-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded-xl text-green-400 font-medium transition-all duration-300">
                Share Location
              </button>
              <button className="w-full p-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded-xl text-blue-400 font-medium transition-all duration-300">
                Find Nearest Safe Zone
              </button>
              <button className="w-full p-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 rounded-xl text-purple-400 font-medium transition-all duration-300">
                Emergency Contact
              </button>
            </div>
          </div>
          
          {/* Zone Statistics */}
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-blue-500/30 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FiShield className="w-5 h-5 text-green-400 mr-2" />
              Zone Status
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Safe Zones:</span>
                <span className="text-green-400 font-semibold">{safeZones.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Restricted:</span>
                <span className="text-red-400 font-semibold">{restrictedZones.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Current Status:</span>
                <span className={`font-semibold ${isInSafeZone ? 'text-green-400' : 'text-yellow-400'}`}>
                  {isInSafeZone ? 'Safe' : 'Caution'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Settings */}
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-blue-500/30 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FiSettings className="w-5 h-5 text-gray-400 mr-2" />
              Settings
            </h3>
            
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-gray-400">Auto-tracking</span>
                <input 
                  type="checkbox" 
                  checked={tracking}
                  onChange={toggleTracking}
                  className="toggle"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-gray-400">Zone Alerts</span>
                <input type="checkbox" defaultChecked className="toggle" />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-gray-400">Share with Police</span>
                <input type="checkbox" defaultChecked className="toggle" />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationTracking;