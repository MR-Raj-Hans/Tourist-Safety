import React, { useState, useEffect } from 'react';
import { FiAlertTriangle, FiPhone, FiMapPin, FiClock } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { panicAPI } from '../services/api';
import socketService from '../services/socket';
import { toast } from 'react-toastify';

const PanicButton = ({ userLocation }) => {
  const [isPressed, setIsPressed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [holdTimer, setHoldTimer] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [alertType, setAlertType] = useState('panic');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { t } = useTranslation();

  const alertTypes = [
    { value: 'panic', label: t('panic.types.panic', 'Panic Alert'), color: 'danger' },
    { value: 'medical', label: t('panic.types.medical', 'Medical Emergency'), color: 'danger' },
    { value: 'crime', label: t('panic.types.crime', 'Crime Report'), color: 'warning' },
    { value: 'lost', label: t('panic.types.lost', 'Lost/Need Help'), color: 'info' },
  ];

  useEffect(() => {
    return () => {
      if (holdTimer) {
        clearTimeout(holdTimer);
      }
    };
  }, [holdTimer]);

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

      const response = await panicAPI.createAlert(alertData);
      
      // Send real-time alert via socket
      socketService.sendPanicAlert(response.data.data);
      
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
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {t('panic.title', 'Emergency Alert')}
        </h2>
        <p className="text-gray-600">
          {t('panic.description', 'Hold the button for 3 seconds to send an emergency alert')}
        </p>
      </div>

      {/* Alert Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {t('panic.selectType', 'Select Alert Type:')}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {alertTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setAlertType(type.value)}
              className={`p-3 text-sm font-medium rounded-lg border transition-all ${
                alertType === type.value
                  ? `border-${type.color}-500 bg-${type.color}-50 text-${type.color}-700`
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Panic Button */}
      <div className="flex flex-col items-center space-y-4">
        <button
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          disabled={isLoading}
          className={`relative w-32 h-32 rounded-full text-white font-bold text-lg transition-all duration-200 select-none ${
            isPressed 
              ? `bg-${selectedAlertType.color}-700 scale-95 shadow-inner` 
              : `bg-${selectedAlertType.color}-600 hover:bg-${selectedAlertType.color}-700 shadow-lg hover:shadow-xl`
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${
            countdown > 0 ? 'animate-pulse-danger' : ''
          }`}
        >
          <div className="flex flex-col items-center justify-center h-full">
            <FiAlertTriangle className="h-8 w-8 mb-1" />
            {countdown > 0 ? (
              <span className="text-2xl font-bold">{countdown}</span>
            ) : isLoading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span>{t('panic.button', 'PANIC')}</span>
            )}
          </div>
        </button>

        {/* Quick Alert Button */}
        <button
          onClick={handleQuickAlert}
          disabled={isLoading}
          className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {t('panic.quickAlert', 'Quick Alert')}
        </button>

        {/* Instructions */}
        <div className="text-center text-sm text-gray-600 max-w-md">
          <p className="mb-2">
            <strong>{t('panic.instructions.hold', 'Hold to activate:')}</strong> {t('panic.instructions.holdDesc', 'Press and hold the panic button for 3 seconds')}
          </p>
          <p>
            <strong>{t('panic.instructions.quick', 'Quick alert:')}</strong> {t('panic.instructions.quickDesc', 'Click "Quick Alert" for immediate activation')}
          </p>
        </div>
      </div>

      {/* Location Status */}
      {userLocation && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center text-green-800">
            <FiMapPin className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">
              {t('panic.locationEnabled', 'Location services enabled')}
            </span>
          </div>
          <div className="text-xs text-green-600 mt-1">
            {t('panic.coordinates', 'Coordinates')}: {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}
          </div>
        </div>
      )}

      {!userLocation && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center text-yellow-800">
            <FiMapPin className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">
              {t('panic.locationDisabled', 'Location services disabled')}
            </span>
          </div>
          <div className="text-xs text-yellow-600 mt-1">
            {t('panic.enableLocation', 'Please enable location services for emergency alerts')}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiPhone className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {t('panic.confirmation.title', 'Alert Sent Successfully!')}
              </h3>
              <p className="text-gray-600 mb-4">
                {t('panic.confirmation.message', 'Emergency services have been notified and will respond shortly.')}
              </p>
              <button
                onClick={() => setShowConfirmation(false)}
                className="btn-primary"
              >
                {t('panic.confirmation.ok', 'OK')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PanicButton;