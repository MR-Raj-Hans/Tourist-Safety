import React, { useState, useEffect } from 'react';
import { FiUser, FiMapPin, FiClock, FiAlertTriangle, FiShield } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import PanicButton from '../components/PanicButton';
import QRGenerator from '../components/QRGenerator';
import MapView from '../components/MapView';
import { panicAPI, geoAPI, mlAPI } from '../services/api';
import socketService from '../services/socket';
import { toast } from 'react-toastify';

const TouristDashboard = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [geoFences, setGeoFences] = useState([]);
  const [riskAssessment, setRiskAssessment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    initializeDashboard();
  }, []);

  useEffect(() => {
    if (userLocation) {
      checkLocationSafety();
      updateLocationOnServer();
    }
  }, [userLocation]);

  const initializeDashboard = async () => {
    try {
      await Promise.all([
        getCurrentLocation(),
        loadRecentAlerts(),
        loadGeoFences()
      ]);
    } catch (error) {
      console.error('Error initializing dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(t('location.notSupported', 'Geolocation is not supported by this browser.'));
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          };
          setUserLocation(location);
          setLocationError(null);
          resolve();
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLocationError(t('location.error', 'Unable to retrieve your location. Please enable location services.'));
          resolve();
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  };

  const loadRecentAlerts = async () => {
    try {
      const response = await panicAPI.getMyAlerts();
      setRecentAlerts(response.data.data.slice(0, 5)); // Show only recent 5
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  };

  const loadGeoFences = async () => {
    try {
      const response = await geoAPI.getFences({ is_active: true });
      setGeoFences(response.data.data);
    } catch (error) {
      console.error('Error loading geo-fences:', error);
    }
  };

  const checkLocationSafety = async () => {
    if (!userLocation) return;

    try {
      // Check geo-fences
      const geoResponse = await geoAPI.checkLocation({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude
      });

      const geoResults = geoResponse.data.data;

      // Get ML risk assessment
      try {
        const mlResponse = await mlAPI.predictRisk({
          location: userLocation,
          tourist_data: { id: 1 }, // Should get from user context
          historical_alerts: recentAlerts,
          time_of_day: new Date().getHours(),
          day_of_week: new Date().getDay()
        });

        setRiskAssessment(mlResponse.data);

        // Show warnings if needed
        if (geoResults.in_restricted_zone) {
          toast.warning(t('safety.restrictedZone', 'You are in a restricted area. Please exercise caution.'));
        }

        if (mlResponse.data.risk_level === 'high' || mlResponse.data.risk_level === 'critical') {
          toast.warning(t('safety.highRisk', 'High risk area detected. Stay alert and consider alternative routes.'));
        }

      } catch (mlError) {
        console.error('ML service error:', mlError);
      }

    } catch (error) {
      console.error('Error checking location safety:', error);
    }
  };

  const updateLocationOnServer = async () => {
    if (!userLocation) return;

    try {
      await geoAPI.checkLocation({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude
      });

      // Send location update via socket
      socketService.updateLocation({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        timestamp: userLocation.timestamp
      });

    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const refreshLocation = () => {
    getCurrentLocation();
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskBadgeColor = (riskLevel) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading', 'Loading...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('dashboard.welcome', 'Welcome to SafeTravel')}
          </h1>
          <p className="mt-2 text-gray-600">
            {t('dashboard.subtitle', 'Your safety is our priority. Monitor your location and stay connected.')}
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Location Status */}
          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${userLocation ? 'bg-green-100' : 'bg-red-100'}`}>
                  <FiMapPin className={`h-6 w-6 ${userLocation ? 'text-green-600' : 'text-red-600'}`} />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">
                    {t('dashboard.location', 'Location')}
                  </h3>
                  <p className={`text-lg font-semibold ${userLocation ? 'text-green-600' : 'text-red-600'}`}>
                    {userLocation ? t('dashboard.enabled', 'Enabled') : t('dashboard.disabled', 'Disabled')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Level */}
          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-blue-100">
                  <FiShield className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">
                    {t('dashboard.riskLevel', 'Risk Level')}
                  </h3>
                  <p className={`text-lg font-semibold ${getRiskColor(riskAssessment?.risk_level)}`}>
                    {riskAssessment?.risk_level?.toUpperCase() || t('dashboard.unknown', 'Unknown')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Active Alerts */}
          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-orange-100">
                  <FiAlertTriangle className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">
                    {t('dashboard.activeAlerts', 'Active Alerts')}
                  </h3>
                  <p className="text-lg font-semibold text-orange-600">
                    {recentAlerts.filter(alert => alert.status === 'active').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Last Update */}
          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-purple-100">
                  <FiClock className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">
                    {t('dashboard.lastUpdate', 'Last Update')}
                  </h3>
                  <p className="text-sm font-medium text-purple-600">
                    {userLocation ? new Date(userLocation.timestamp).toLocaleTimeString() : '--:--'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Assessment */}
        {riskAssessment && (
          <div className="card mb-8">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-800">
                {t('dashboard.safetyAssessment', 'Safety Assessment')}
              </h2>
            </div>
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-sm text-gray-500">{t('dashboard.currentRisk', 'Current Risk Level')}</span>
                  <div className="flex items-center mt-1">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskBadgeColor(riskAssessment.risk_level)}`}>
                      {riskAssessment.risk_level.toUpperCase()}
                    </span>
                    <span className="ml-2 text-sm text-gray-600">
                      ({Math.round(riskAssessment.risk_score * 100)}% risk score)
                    </span>
                  </div>
                </div>
                <button
                  onClick={refreshLocation}
                  className="btn-secondary text-sm"
                >
                  {t('dashboard.refresh', 'Refresh')}
                </button>
              </div>

              {riskAssessment.risk_factors.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    {t('dashboard.riskFactors', 'Risk Factors:')}
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {riskAssessment.risk_factors.map((factor, index) => (
                      <li key={index}>• {factor}</li>
                    ))}
                  </ul>
                </div>
              )}

              {riskAssessment.recommendations.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    {t('dashboard.recommendations', 'Recommendations:')}
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {riskAssessment.recommendations.map((recommendation, index) => (
                      <li key={index}>• {recommendation}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Emergency Alert Section */}
          <div>
            <PanicButton userLocation={userLocation} />
          </div>

          {/* QR Code Section */}
          <div>
            <QRGenerator userLocation={userLocation} />
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-8">
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-800">
                {t('dashboard.yourLocation', 'Your Location')}
              </h2>
            </div>
            <div className="card-body p-0">
              <MapView
                center={userLocation ? [userLocation.latitude, userLocation.longitude] : undefined}
                userLocation={userLocation}
                geoFences={geoFences}
                alerts={recentAlerts}
                height="400px"
                showTourists={false}
                showPolice={false}
              />
            </div>
          </div>
        </div>

        {/* Recent Alerts */}
        {recentAlerts.length > 0 && (
          <div className="mt-8">
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold text-gray-800">
                  {t('dashboard.recentAlerts', 'Recent Alerts')}
                </h2>
              </div>
              <div className="card-body">
                <div className="space-y-3">
                  {recentAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center">
                        <div className={`p-2 rounded-full ${
                          alert.priority === 'critical' ? 'bg-red-100' :
                          alert.priority === 'high' ? 'bg-orange-100' :
                          'bg-yellow-100'
                        }`}>
                          <FiAlertTriangle className={`h-4 w-4 ${
                            alert.priority === 'critical' ? 'text-red-600' :
                            alert.priority === 'high' ? 'text-orange-600' :
                            'text-yellow-600'
                          }`} />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-800">
                            {t(`alertTypes.${alert.alert_type}`, alert.alert_type.toUpperCase())}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(alert.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        alert.status === 'active' ? 'bg-red-100 text-red-800' :
                        alert.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {alert.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TouristDashboard;