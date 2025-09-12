import React, { useState, useEffect } from 'react';
import { FiAlertTriangle, FiPhone, FiMapPin, FiClock, FiShield, FiZap, FiActivity, FiRadio, FiWifi, FiCheck } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const EmergencyAlerts = () => {
  const { t } = useTranslation();
  const [alertStatus, setAlertStatus] = useState('inactive'); // inactive, activating, active, sent
  const [countdown, setCountdown] = useState(0);
  const [pulseIntensity, setPulseIntensity] = useState(1);
  const [glowPulse, setGlowPulse] = useState(0);

  const emergencyContacts = [
    { 
      name: 'Emergency Services', 
      number: '911', 
      type: 'emergency', 
      icon: FiAlertTriangle,
      description: 'Police, Fire, Medical',
      color: 'from-red-500 to-red-700',
      priority: 'CRITICAL'
    },
    { 
      name: 'Tourist Police', 
      number: '+1-800-TOURIST', 
      type: 'police', 
      icon: FiShield,
      description: 'Tourist Safety Division',
      color: 'from-blue-500 to-blue-700',
      priority: 'HIGH'
    },
    { 
      name: 'Medical Emergency', 
      number: '+1-800-MEDICAL', 
      type: 'medical', 
      icon: FiActivity,
      description: 'Hospital & Ambulance',
      color: 'from-green-500 to-green-700',
      priority: 'CRITICAL'
    },
    { 
      name: 'Embassy Contact', 
      number: '+1-800-EMBASSY', 
      type: 'embassy', 
      icon: FiMapPin,
      description: 'Diplomatic Support',
      color: 'from-purple-500 to-purple-700',
      priority: 'MEDIUM'
    }
  ];

  // Enhanced glow and pulse effects
  useEffect(() => {
    const glowInterval = setInterval(() => {
      setGlowPulse(prev => (prev + 1) % 100);
    }, 100);
    return () => clearInterval(glowInterval);
  }, []);

  useEffect(() => {
    const pulseInterval = setInterval(() => {
      if (alertStatus === 'activating' || alertStatus === 'active') {
        setPulseIntensity(prev => prev === 1 ? 1.4 : 1);
      }
    }, alertStatus === 'activating' ? 200 : 600);
    return () => clearInterval(pulseInterval);
  }, [alertStatus]);

  // Countdown effect for activation
  useEffect(() => {
    if (alertStatus === 'activating' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (alertStatus === 'activating' && countdown === 0) {
      setAlertStatus('active');
      setTimeout(() => {
        setAlertStatus('sent');
      }, 3000);
    }
  }, [alertStatus, countdown]);

  const handlePanicButtonPress = () => {
    if (alertStatus === 'inactive') {
      setAlertStatus('activating');
      setCountdown(5);
    }
  };

  const handleCancelAlert = () => {
    if (alertStatus === 'activating') {
      setAlertStatus('inactive');
      setCountdown(0);
    }
  };

  const handleResetAlert = () => {
    setAlertStatus('inactive');
    setCountdown(0);
  };

  const getStatusMessage = () => {
    switch (alertStatus) {
      case 'inactive':
        return 'System Ready - Press for Emergency';
      case 'activating':
        return `Alert Activating in ${countdown}s - Release to Cancel`;
      case 'active':
        return 'EMERGENCY ALERT ACTIVE - Sending Location...';
      case 'sent':
        return 'ALERT SENT - Help is on the way!';
      default:
        return 'System Ready';
    }
  };

  const getStatusColor = () => {
    switch (alertStatus) {
      case 'inactive':
        return 'text-gray-300';
      case 'activating':
        return 'text-yellow-400';
      case 'active':
        return 'text-red-400';
      case 'sent':
        return 'text-green-400';
      default:
        return 'text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900/20 to-gray-800">
      {/* Futuristic Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-red-500/20 to-transparent"></div>
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-red-500/20 to-transparent"></div>
      </div>

      {/* Header Status Bar */}
      <div className="relative z-10 bg-black/50 backdrop-blur-md border-b border-red-500/30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FiZap className="w-5 h-5 text-red-400" />
                <span className="text-red-400 font-semibold">EMERGENCY SYSTEM</span>
              </div>
              <div className="h-4 w-px bg-gray-600"></div>
              <div className="flex items-center space-x-2">
                <FiWifi className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm">Connected</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm">GPS Active</span>
              </div>
              <div className="text-gray-400 text-sm">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Main Alert Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            EMERGENCY
            <span className="text-red-400 ml-4">ALERT</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Press and hold the emergency button below to send an immediate alert to emergency services with your location.
          </p>
        </div>

        {/* Status Display */}
        <div className="bg-black/60 backdrop-blur-lg rounded-2xl border border-red-500/30 p-6 mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                alertStatus === 'inactive' ? 'bg-gray-500' :
                alertStatus === 'activating' ? 'bg-yellow-400 animate-pulse' :
                alertStatus === 'active' ? 'bg-red-500 animate-pulse' :
                'bg-green-500'
              }`}></div>
              <span className={`text-lg font-semibold ${getStatusColor()}`}>
                {getStatusMessage()}
              </span>
            </div>
          </div>
        </div>

        {/* Main Panic Button */}
        <div className="flex justify-center mb-12">
          <div className="relative">
            {/* Outer Glow Rings */}
            {(alertStatus === 'activating' || alertStatus === 'active') && (
              <>
                <div 
                  className="absolute inset-0 rounded-full bg-red-500/30 animate-ping"
                  style={{ 
                    transform: `scale(${1.2 + Math.sin(glowPulse * 0.1) * 0.3})`,
                    animationDuration: '1s'
                  }}
                ></div>
                <div 
                  className="absolute inset-0 rounded-full bg-red-500/20 animate-ping"
                  style={{ 
                    transform: `scale(${1.5 + Math.sin(glowPulse * 0.08) * 0.4})`,
                    animationDuration: '1.5s'
                  }}
                ></div>
              </>
            )}
            
            {/* Main Button */}
            <button
              onMouseDown={handlePanicButtonPress}
              onMouseUp={handleCancelAlert}
              onTouchStart={handlePanicButtonPress}
              onTouchEnd={handleCancelAlert}
              className={`
                relative w-64 h-64 rounded-full border-4 border-red-500
                transition-all duration-300 transform
                ${alertStatus === 'inactive' ? 'bg-gradient-to-br from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 hover:scale-105' :
                  alertStatus === 'activating' ? 'bg-gradient-to-br from-yellow-500 to-red-600 scale-110' :
                  alertStatus === 'active' ? 'bg-gradient-to-br from-red-400 to-red-600 scale-115 animate-pulse' :
                  'bg-gradient-to-br from-green-500 to-green-700 scale-105'
                }
                shadow-2xl shadow-red-500/50
              `}
              style={{
                transform: `scale(${pulseIntensity})`,
                boxShadow: `0 0 ${30 + Math.sin(glowPulse * 0.1) * 20}px rgba(239, 68, 68, 0.8)`
              }}
            >
              <div className="flex flex-col items-center justify-center h-full text-white">
                {alertStatus === 'inactive' && (
                  <>
                    <FiAlertTriangle className="w-16 h-16 mb-2" />
                    <span className="text-2xl font-bold">EMERGENCY</span>
                    <span className="text-lg">PRESS & HOLD</span>
                  </>
                )}
                {alertStatus === 'activating' && (
                  <>
                    <div className="text-6xl font-bold mb-2">{countdown}</div>
                    <span className="text-lg">ACTIVATING...</span>
                    <span className="text-sm mt-1">Release to Cancel</span>
                  </>
                )}
                {alertStatus === 'active' && (
                  <>
                    <FiRadio className="w-16 h-16 mb-2 animate-pulse" />
                    <span className="text-xl font-bold">SENDING</span>
                    <span className="text-lg">ALERT...</span>
                  </>
                )}
                {alertStatus === 'sent' && (
                  <>
                    <FiCheck className="w-16 h-16 mb-2" />
                    <span className="text-xl font-bold">ALERT SENT</span>
                    <span className="text-lg">Help Coming!</span>
                  </>
                )}
              </div>
            </button>

            {/* Countdown Display */}
            {alertStatus === 'activating' && (
              <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                <div className="bg-black/80 backdrop-blur-md rounded-full px-6 py-2 border border-yellow-400">
                  <span className="text-yellow-400 font-bold text-lg">
                    Canceling in {countdown}s
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Control Buttons */}
        {alertStatus !== 'inactive' && (
          <div className="flex justify-center space-x-4 mb-12">
            {alertStatus === 'activating' && (
              <button
                onClick={handleCancelAlert}
                className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl border border-gray-600 transition-all duration-300"
              >
                Cancel Alert
              </button>
            )}
            {(alertStatus === 'sent' || alertStatus === 'active') && (
              <button
                onClick={handleResetAlert}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all duration-300"
              >
                Reset System
              </button>
            )}
          </div>
        )}

        {/* Emergency Contacts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {emergencyContacts.map((contact, index) => {
            const IconComponent = contact.icon;
            return (
              <div
                key={index}
                className="bg-black/40 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-6 hover:border-red-500/50 transition-all duration-300 group"
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${contact.color} group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-semibold">{contact.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        contact.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                        contact.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {contact.priority}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{contact.description}</p>
                    <div className="flex items-center space-x-2">
                      <FiPhone className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 font-mono text-sm">{contact.number}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Instructions Panel */}
        <div className="mt-12 bg-gradient-to-r from-red-900/20 to-transparent rounded-2xl border border-red-500/30 p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <FiAlertTriangle className="w-6 h-6 text-red-400 mr-3" />
            Emergency Instructions
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-red-400 mb-3">How to Use</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start space-x-2">
                  <span className="text-red-400 mt-1">•</span>
                  <span>Press and hold the emergency button for 5 seconds</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-400 mt-1">•</span>
                  <span>Release the button to cancel during countdown</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-400 mt-1">•</span>
                  <span>Your location will be automatically shared</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-400 mt-1">•</span>
                  <span>Emergency services will be notified immediately</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-400 mb-3">When to Use</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start space-x-2">
                  <span className="text-red-400 mt-1">•</span>
                  <span>Medical emergencies or accidents</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-400 mt-1">•</span>
                  <span>Security threats or dangerous situations</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-400 mt-1">•</span>
                  <span>Lost or stranded in unfamiliar areas</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-400 mt-1">•</span>
                  <span>Any situation requiring immediate help</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyAlerts;