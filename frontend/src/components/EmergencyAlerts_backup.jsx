import React, { useState, useEffect } from 'react';
import { FiAlertTriangle, FiPhone, FiMapPin, FiClock, FiShield, FiZap, FiActivity, FiRadio, FiWifi, FiCheck } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const EmergencyAlerts = () => {
  const { t } = useTranslation();
  const [alertStatus, setAlertStatus] = useState('inactive'); // inactive, activating, active, sent
  const [countdown, setCountdown] = useState(0);
  const [pulseIntensity, setPulseIntensity] = useState(1);
  const [glowPulse, setGlowPulse] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('connected');

  const emergencyContacts = [
    { 
      name: 'Emergency Services', 
      number: '911', 
      type: 'emergency', 
      icon: FiAlertTriangle,
      description: 'Police, Fire, Medical',
      color: 'from-red-500 to-red-700',
      priority: 'HIGH'
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

  const handlePanicButtonPress = () => {
    if (alertStatus === 'inactive') {
      setAlertStatus('activating');
      setCountdown(3);
    }
  };

  const handlePanicButtonRelease = () => {
    if (alertStatus === 'activating') {
      setAlertStatus('inactive');
      setCountdown(0);
    }
  };

  useEffect(() => {
    let interval;
    if (alertStatus === 'activating' && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setAlertStatus('active');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [alertStatus, countdown]);

  useEffect(() => {
    let pulseInterval;
    if (alertStatus === 'activating' || alertStatus === 'active') {
      pulseInterval = setInterval(() => {
        setPulseIntensity(prev => prev === 1 ? 1.2 : 1);
      }, 500);
    } else {
      setPulseIntensity(1);
    }
    return () => clearInterval(pulseInterval);
  }, [alertStatus]);

  const sendEmergencyAlert = () => {
    setAlertStatus('sent');
    // API call to send emergency alert
    setTimeout(() => {
      setAlertStatus('inactive');
    }, 5000);
  };

  useEffect(() => {
    if (alertStatus === 'active') {
      sendEmergencyAlert();
    }
  }, [alertStatus]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900/20 to-gray-800 p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {t('Emergency Alert System')}
          </h1>
          <p className="text-gray-300">
            {t('Press and hold the panic button for emergency assistance')}
          </p>
        </div>

        {/* Alert Status Banner */}
        <div className={`mb-8 p-4 rounded-lg border-l-4 transition-all duration-300 ${
          alertStatus === 'inactive' ? 'bg-gray-800/50 border-gray-600 text-gray-300' :
          alertStatus === 'activating' ? 'bg-yellow-900/50 border-yellow-500 text-yellow-300' :
          alertStatus === 'active' ? 'bg-red-900/50 border-red-500 text-red-300' :
          'bg-green-900/50 border-green-500 text-green-300'
        }`}>
          <div className="flex items-center space-x-3">
            <FiClock className="w-5 h-5" />
            <span className="font-medium">
              {alertStatus === 'inactive' && t('System Ready')}
              {alertStatus === 'activating' && t(`Activating in ${countdown}...`)}
              {alertStatus === 'active' && t('Emergency Alert Active')}
              {alertStatus === 'sent' && t('Alert Sent Successfully')}
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Panic Button Section */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative">
              {/* Pulse Rings */}
              {(alertStatus === 'activating' || alertStatus === 'active') && (
                <>
                  <div className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" 
                       style={{ transform: `scale(${pulseIntensity})` }}></div>
                  <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping animation-delay-200" 
                       style={{ transform: `scale(${pulseIntensity * 1.2})` }}></div>
                  <div className="absolute inset-0 rounded-full bg-red-500/10 animate-ping animation-delay-400" 
                       style={{ transform: `scale(${pulseIntensity * 1.4})` }}></div>
                </>
              )}
              
              {/* Main Panic Button */}
              <button
                onMouseDown={handlePanicButtonPress}
                onMouseUp={handlePanicButtonRelease}
                onTouchStart={handlePanicButtonPress}
                onTouchEnd={handlePanicButtonRelease}
                disabled={alertStatus === 'sent'}
                className={`relative w-64 h-64 rounded-full border-8 transition-all duration-300 transform active:scale-95 disabled:opacity-50 ${
                  alertStatus === 'inactive' 
                    ? 'bg-gradient-to-br from-red-600 to-red-800 border-red-500 hover:from-red-500 hover:to-red-700 shadow-lg hover:shadow-red-500/50'
                    : alertStatus === 'activating'
                    ? 'bg-gradient-to-br from-yellow-600 to-red-700 border-yellow-500 shadow-xl shadow-yellow-500/50'
                    : alertStatus === 'active'
                    ? 'bg-gradient-to-br from-red-500 to-red-700 border-red-400 shadow-2xl shadow-red-500/70'
                    : 'bg-gradient-to-br from-green-600 to-green-800 border-green-500 shadow-xl shadow-green-500/50'
                }`}
                style={{ 
                  transform: `scale(${pulseIntensity})`,
                  boxShadow: alertStatus === 'activating' || alertStatus === 'active' 
                    ? `0 0 ${40 * pulseIntensity}px rgba(239, 68, 68, 0.6)` 
                    : undefined 
                }}
              >
                <div className="flex flex-col items-center justify-center h-full text-white">
                  <FiAlertTriangle className="w-16 h-16 mb-2" />
                  <span className="text-2xl font-bold">
                    {alertStatus === 'activating' ? countdown :
                     alertStatus === 'sent' ? t('SENT') : t('PANIC')}
                  </span>
                  <span className="text-sm opacity-80">
                    {alertStatus === 'inactive' && t('HOLD TO ACTIVATE')}
                    {alertStatus === 'activating' && t('RELEASE TO CANCEL')}
                    {alertStatus === 'active' && t('SENDING ALERT...')}
                    {alertStatus === 'sent' && t('HELP IS COMING')}
                  </span>
                </div>
              </button>
            </div>

            {/* Instructions */}
            <div className="mt-8 text-center max-w-md">
              <p className="text-gray-300 text-sm leading-relaxed">
                {t('Hold the panic button for 3 seconds to send an emergency alert to authorities and your emergency contacts. Release to cancel during countdown.')}
              </p>
            </div>
          </div>

          {/* Emergency Contacts Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-4">
              {t('Emergency Contacts')}
            </h2>
            
            <div className="space-y-3">
              {emergencyContacts.map((contact, index) => (
                <div
                  key={index}
                  className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 hover:bg-gray-700/50 transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-full ${
                        contact.type === 'emergency' ? 'bg-red-600/20 text-red-400' :
                        contact.type === 'police' ? 'bg-blue-600/20 text-blue-400' :
                        contact.type === 'medical' ? 'bg-green-600/20 text-green-400' :
                        'bg-purple-600/20 text-purple-400'
                      }`}>
                        <contact.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{t(contact.name)}</h3>
                        <p className="text-gray-400 text-sm">{contact.number}</p>
                      </div>
                    </div>
                    <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 opacity-0 group-hover:opacity-100">
                      <FiPhone className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Current Location Display */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <FiMapPin className="w-5 h-5 text-blue-400" />
                <h3 className="font-medium text-white">{t('Current Location')}</h3>
              </div>
              <p className="text-gray-300 text-sm">
                {t('Times Square, New York, NY 10036')}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                {t('Coordinates: 40.7580° N, 73.9855° W')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Full Screen Alert Overlay */}
      {alertStatus === 'active' && (
        <div className="fixed inset-0 bg-red-900/90 backdrop-blur-sm z-50 flex items-center justify-center animate-pulse">
          <div className="text-center text-white">
            <FiAlertTriangle className="w-24 h-24 mx-auto mb-4 text-red-300" />
            <h1 className="text-4xl font-bold mb-2">{t('EMERGENCY ALERT ACTIVE')}</h1>
            <p className="text-xl">{t('Sending location and alert to emergency services...')}</p>
          </div>
        </div>
      )}

      <style jsx>{`
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
      `}</style>
    </div>
  );
};

export default EmergencyAlerts;