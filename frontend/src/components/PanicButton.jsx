import React, { useState, useEffect } from 'react';
import { FiAlertTriangle, FiPhone, FiMapPin, FiClock, FiShield, FiTarget } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { panicAPI, devCreateAlert } from '../services/api';
import socketService from '../services/socket';
import { toast } from 'react-toastify';

const PanicButton = ({ userLocation }) => {
  const [isPressed, setIsPressed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [holdTimer, setHoldTimer] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [alertType, setAlertType] = useState('panic');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pulseIntensity, setPulseIntensity] = useState(1);
  const { t } = useTranslation();

  const alertTypes = [
    { 
      value: 'panic', 
      label: t('panic.types.panic', 'Panic Alert'), 
      color: 'red',
      icon: FiAlertTriangle,
      gradient: 'from-red-600 to-red-800'
    },
    { 
      value: 'medical', 
      label: t('panic.types.medical', 'Medical Emergency'), 
      color: 'red',
      icon: FiPhone,
      gradient: 'from-red-600 to-red-800'
    },
    { 
      value: 'crime', 
      label: t('panic.types.crime', 'Crime Report'), 
      color: 'orange',
      icon: FiShield,
      gradient: 'from-orange-600 to-red-700'
    },
    { 
      value: 'lost', 
      label: t('panic.types.lost', 'Lost/Need Help'), 
      color: 'blue',
      icon: FiTarget,
      gradient: 'from-blue-600 to-blue-800'
    },
  ];

  useEffect(() => {
    return () => {
      if (holdTimer) {
        clearTimeout(holdTimer);
      }
    };
  }, [holdTimer]);

  useEffect(() => {
    let pulseInterval;
    if (isPressed && countdown > 0) {
      pulseInterval = setInterval(() => {
        setPulseIntensity(prev => prev === 1 ? 1.1 : 1);
      }, 200);
    } else {
      setPulseIntensity(1);
    }
    return () => clearInterval(pulseInterval);
  }, [isPressed, countdown]);

  const handleMouseDown = () => {
    setIsPressed(true);
    setCountdown(3);
    
    const timer = setTimeout(() => {
      triggerAlert();
    }, 3000);
    
    setHoldTimer(timer);
    
    // Start countdown
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
    setCountdown(0);
    
    if (holdTimer) {
      clearTimeout(holdTimer);
      setHoldTimer(null);
    }
  };

  const triggerAlert = async () => {
    if (!userLocation) {
      toast.error(t('panic.errors.noLocation', 'Location not available. Please enable location services.'));
      return;
    }

    setIsLoading(true);
    
    try {
      const alertData = {
        alert_type: alertType,
        location: `${userLocation.latitude}, ${userLocation.longitude}`,
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        description: `${alertTypes.find(type => type.value === alertType)?.label} triggered by user`,
      };

      let response;
      try {
        response = await panicAPI.createAlert(alertData);
      } catch (err) {
        // If unauthenticated or in development, fallback to devCreateAlert
        if (process.env.NODE_ENV === 'development') {
          const devResp = await devCreateAlert({ tourist_id: 1, ...alertData });
          response = { data: { data: devResp.data } };
        } else {
          throw err;
        }
      }

      // Send real-time alert via socket (if payload available)
      if (response?.data?.data) {
        socketService.sendPanicAlert(response.data.data);
      }

      toast.success(t('panic.success', 'Emergency alert sent successfully!'));
      setShowConfirmation(true);
      
      // Auto-hide confirmation after 5 seconds
      setTimeout(() => {
        setShowConfirmation(false);
      }, 5000);
      
    } catch (error) {
      console.error('Error sending panic alert:', error);
      toast.error(
        error.response?.data?.message || 
        t('panic.errors.failed', 'Failed to send alert. Please try again.')
      );
    } finally {
      setIsLoading(false);
      setIsPressed(false);
      setCountdown(0);
      if (holdTimer) {
        clearTimeout(holdTimer);
        setHoldTimer(null);
      }
    }
  };

  const handleQuickAlert = () => {
    if (!userLocation) {
      toast.error(t('panic.errors.noLocation', 'Location not available. Please enable location services.'));
      return;
    }
    triggerAlert();
  };

  const selectedAlertType = alertTypes.find(type => type.value === alertType);

  return (
    <div className="min-h-screen aurora-bg p-4">
      {/* Floating particles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-gradient-to-r from-red-400/20 to-pink-400/20 rounded-full blur-3xl animate-float-slow -top-48 -left-48"></div>
        <div className="absolute w-80 h-80 bg-gradient-to-r from-orange-400/15 to-red-400/15 rounded-full blur-3xl animate-float-slower top-1/3 -right-40"></div>
        <div className="absolute w-64 h-64 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-float -bottom-32 left-1/4"></div>
      </div>

      <div className="relative max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-in">
          <h1 className="text-4xl font-bold text-white mb-2 glow-text-sapphire">
            {t('panic.title', 'Emergency Alert System')}
          </h1>
          <p className="text-white/70 text-lg">
            {t('panic.description', 'Immediate emergency response at your fingertips')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Main Panic Button Section */}
          <div className="flex flex-col items-center justify-center animate-slide-in animate-delay-200">
            {/* Alert Type Selection */}
            <div className="glass-card p-6 mb-8 w-full max-w-md">
              <h3 className="text-white font-bold text-lg mb-4 glow-text">
                {t('panic.selectType', 'Select Alert Type')}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {alertTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <button
                      key={type.value}
                      onClick={() => setAlertType(type.value)}
                      className={`p-4 rounded-xl transition-all duration-300 border ${
                        alertType === type.value
                          ? 'bg-white/20 border-white/40 backdrop-blur-md shadow-xl'
                          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${type.gradient} flex items-center justify-center`}>
                          <IconComponent className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-white text-sm font-medium text-center">{type.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Panic Button */}
            <div className="relative mb-8">
              {/* Pulse Rings */}
              {(isPressed && countdown > 0) && (
                <>
                  <div className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" 
                       style={{ transform: `scale(${pulseIntensity})` }}></div>
                  <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping animation-delay-200" 
                       style={{ transform: `scale(${pulseIntensity * 1.2})` }}></div>
                  <div className="absolute inset-0 rounded-full bg-red-500/10 animate-ping animation-delay-400" 
                       style={{ transform: `scale(${pulseIntensity * 1.4})` }}></div>
                </>
              )}
              
              <button
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onTouchStart={handleMouseDown}
                onTouchEnd={handleMouseUp}
                disabled={isLoading}
                className={`relative w-48 h-48 rounded-full border-4 transition-all duration-300 transform active:scale-95 ${
                  isPressed && countdown > 0
                    ? 'bg-gradient-to-br from-red-500 to-red-700 border-red-400 shadow-2xl shadow-red-500/50'
                    : `bg-gradient-to-br ${selectedAlertType.gradient} border-white/30 shadow-xl hover:shadow-2xl hover:scale-105`
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                style={{ 
                  transform: `scale(${isPressed && countdown > 0 ? pulseIntensity : 1})`,
                  boxShadow: isPressed && countdown > 0 
                    ? `0 0 ${60 * pulseIntensity}px rgba(239, 68, 68, 0.8)` 
                    : undefined 
                }}
              >
                <div className="flex flex-col items-center justify-center h-full text-white">
                  {countdown > 0 ? (
                    <>
                      <div className="text-6xl font-bold mb-2">{countdown}</div>
                      <div className="text-sm font-medium opacity-80">RELEASE TO CANCEL</div>
                    </>
                  ) : isLoading ? (
                    <>
                      <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-2"></div>
                      <div className="text-sm font-medium">SENDING...</div>
                    </>
                  ) : (
                    <>
                      <selectedAlertType.icon className="w-16 h-16 mb-2" />
                      <div className="text-xl font-bold">PANIC</div>
                      <div className="text-sm opacity-80">HOLD TO ACTIVATE</div>
                    </>
                  )}
                </div>
              </button>
            </div>

            {/* Quick Alert Button */}
            <button
              onClick={handleQuickAlert}
              disabled={isLoading}
              className="glass-card px-8 py-4 bg-gradient-to-r from-orange-600/80 to-red-600/80 hover:from-orange-500/90 hover:to-red-500/90 text-white font-medium text-lg rounded-xl transition-all duration-300 disabled:opacity-50 hover:scale-105 shadow-xl"
            >
              {t('panic.quickAlert', 'Quick Alert')}
            </button>

            {/* Instructions */}
            <div className="glass-card p-6 mt-6 max-w-md text-center">
              <h4 className="text-white font-bold mb-3 glow-text">Instructions</h4>
              <div className="space-y-2 text-white/80 text-sm">
                <p><strong>Hold Button:</strong> Press and hold for 3 seconds</p>
                <p><strong>Quick Alert:</strong> Instant emergency activation</p>
                <p><strong>Cancel:</strong> Release button during countdown</p>
              </div>
            </div>
          </div>

          {/* Status & Information Panel */}
          <div className="space-y-6 animate-slide-in animate-delay-400">
            {/* Location Status */}
            {userLocation ? (
              <div className="glass-card p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                  <h3 className="text-white font-bold text-lg glow-text">Location Active</h3>
                </div>
                <div className="space-y-3 text-white/80">
                  <div className="flex items-center space-x-2">
                    <FiMapPin className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm">GPS coordinates available</span>
                  </div>
                  <div className="text-xs text-white/60 font-mono bg-black/20 p-2 rounded">
                    {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card p-6 border-l-4 border-gold-400">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-3 h-3 bg-gold-400 rounded-full animate-pulse"></div>
                  <h3 className="text-white font-bold text-lg glow-text">Location Required</h3>
                </div>
                <p className="text-white/80 text-sm">
                  Please enable location services for emergency alerts to work properly.
                </p>
              </div>
            )}

            {/* Emergency Response Info */}
            <div className="glass-card p-6">
              <h3 className="text-white font-bold text-lg mb-4 glow-text flex items-center">
                <FiShield className="mr-2 text-sapphire-300" />
                Emergency Response
              </h3>
              <div className="space-y-3 text-white/80 text-sm">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2"></div>
                  <p>Alerts are sent to local emergency services immediately</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-sapphire-400 rounded-full mt-2"></div>
                  <p>Your location and alert type are transmitted automatically</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-gold-400 rounded-full mt-2"></div>
                  <p>Response teams are dispatched based on alert priority</p>
                </div>
              </div>
            </div>

            {/* Alert Types Info */}
            <div className="glass-card p-6">
              <h3 className="text-white font-bold text-lg mb-4 glow-text">Alert Types</h3>
              <div className="space-y-3">
                {alertTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <div key={type.value} className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${type.gradient} flex items-center justify-center`}>
                        <IconComponent className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-medium text-sm">{type.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card p-8 max-w-md w-full mx-4 animate-slide-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiPhone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 glow-text">
                {t('panic.confirmation.title', 'Alert Sent Successfully!')}
              </h3>
              <p className="text-white/80 mb-6">
                {t('panic.confirmation.message', 'Emergency services have been notified and will respond shortly.')}
              </p>
              <button
                onClick={() => setShowConfirmation(false)}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-medium rounded-xl transition-all duration-300"
              >
                {t('panic.confirmation.ok', 'OK')}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(1deg); }
          66% { transform: translateY(-10px) rotate(-1deg); }
        }
        @keyframes float-slower {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(0.5deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        .animate-float-slower {
          animation: float-slower 10s ease-in-out infinite;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
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

export default PanicButton;