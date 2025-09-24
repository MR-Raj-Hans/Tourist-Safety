import React, { useState, useEffect } from 'react';
import { FiAlertTriangle, FiPhone, FiMapPin, FiClock, FiShield, FiZap, FiActivity, FiRadio, FiWifi, FiCheck } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import Navbar from './Navbar';

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
      number: '112', 
      type: 'emergency', 
      icon: FiAlertTriangle,
      description: 'Police, Fire, Medical',
      color: 'from-red-500 to-red-700',
      priority: 'HIGH'
    },
    { 
      name: 'Tourist Helpline', 
      number: '1363', 
      type: 'police', 
      icon: FiShield,
      description: 'Tourist Safety Division',
      color: 'from-blue-500 to-blue-700',
      priority: 'HIGH'
    },
    { 
      name: 'Medical Emergency', 
      number: '108', 
      type: 'medical', 
      icon: FiActivity,
      description: 'Hospital & Ambulance',
      color: 'from-green-500 to-green-700',
      priority: 'CRITICAL'
    },
    { 
      name: 'Karnataka Police', 
      number: '100', 
      type: 'embassy', 
      icon: FiMapPin,
      description: 'State Police Control',
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Navbar />
      
      {/* Header */}
      <div className="relative z-10 max-w-4xl mx-auto p-4 sm:p-6">
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-3 mb-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-600 rounded-xl flex items-center justify-center">
                <FiAlertTriangle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 text-center sm:text-left">
                Emergency Alert System
              </h1>
            </div>
            <p className="text-gray-300 text-sm sm:text-base lg:text-lg px-4 sm:px-0">
              Press and hold the panic button for emergency assistance
            </p>
          </div>

        {/* Alert Status Banner */}
        <div className={`mb-8 p-4 rounded-2xl border-l-4 glass-card-light transition-all duration-300 ${
          alertStatus === 'inactive' ? 'border-sapphire-400' :
          alertStatus === 'activating' ? 'border-gold-400' :
          alertStatus === 'active' ? 'border-red-400' :
          'border-emerald-400'
        }`}>
          <div className="flex items-center space-x-3">
            <FiClock className="w-5 h-5 text-gold-300" />
            <span className="font-medium premium-text">
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
              <p className="text-white/90 text-sm leading-relaxed drop-shadow">
                {t('Hold the panic button for 3 seconds to send an emergency alert to authorities and your emergency contacts. Release to cancel during countdown.')}
              </p>
            </div>
          </div>

          {/* Emergency Contacts Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold gradient-text-primary mb-4">
              {t('Emergency Contacts')}
            </h2>
            
            <div className="space-y-3">
              {emergencyContacts.map((contact, index) => (
                <div
                  key={index}
                  className="premium-glass-enhanced rounded-2xl p-4 hover:scale-105 transition-all duration-300 group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-2xl premium-glass-enhanced ${
                        contact.type === 'emergency' ? 'bg-gradient-to-br from-red-500/20 to-red-600/20' :
                        contact.type === 'police' ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/20' :
                        contact.type === 'medical' ? 'bg-gradient-to-br from-green-500/20 to-green-600/20' :
                        'bg-gradient-to-br from-purple-500/20 to-purple-600/20'
                      }`}>
                        <contact.icon className="w-5 h-5 premium-text-gold" />
                      </div>
                      <div>
                        <h3 className="font-medium premium-text">{t(contact.name)}</h3>
                        <p className="premium-text-secondary text-sm">{contact.number}</p>
                        <p className="premium-text-secondary text-xs">{contact.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                        contact.priority === 'CRITICAL' ? 'bg-red-500/30 text-red-200' :
                        contact.priority === 'HIGH' ? 'bg-orange-500/30 text-orange-200' :
                        'bg-blue-500/30 text-blue-200'
                      }`}>
                        {contact.priority}
                      </span>
                      
                      <button className="btn-glassmorphism px-3 py-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <FiPhone className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Current Location Display */}
            <div className="premium-glass-enhanced rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <FiMapPin className="w-5 h-5 premium-text-gold" />
                <h3 className="font-medium premium-text">{t('Current Location')}</h3>
              </div>
              <p className="premium-text text-sm">
                {t('Bengaluru, Karnataka, India 560001')}
              </p>
              <p className="text-white/80 text-xs mt-1 premium-text">
                {t('Coordinates: 12.9716° N, 77.5946° E')}
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