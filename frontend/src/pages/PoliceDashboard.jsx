import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Components
import LanguageSwitcher from '../components/LanguageSwitcher';

// Services
import { 
  getActiveAlerts, 
  getTourists, 
  getGeoFences, 
  respondToAlert, 
  scanQRCode,
  createGeoFence,
  deleteGeoFence
} from '../services/api';
import socketService from '../services/socket';

// Fix Leaflet default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const PoliceDashboard = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('alerts');
  const [alerts, setAlerts] = useState([]);
  const [tourists, setTourists] = useState([]);
  const [geoFences, setGeoFences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTourists: 0,
    activeAlerts: 0,
    resolvedToday: 0,
    averageResponseTime: 0
  });
  const [qrScanner, setQrScanner] = useState({
    active: false,
    code: '',
    result: null
  });
  const [geoFenceForm, setGeoFenceForm] = useState({
    name: '',
    latitude: '',
    longitude: '',
    radius: 1000,
    type: 'safe',
    description: ''
  });

  useEffect(() => {
    loadDashboardData();
    
    // Listen for real-time updates
    socketService.on('newAlert', handleNewAlert);
    socketService.on('alertUpdate', handleAlertUpdate);
    socketService.on('touristLocationUpdate', handleLocationUpdate);

    return () => {
      socketService.off('newAlert');
      socketService.off('alertUpdate');
      socketService.off('touristLocationUpdate');
    };
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [alertsRes, touristsRes, geoFencesRes] = await Promise.all([
        getActiveAlerts(),
        getTourists(),
        getGeoFences()
      ]);

      if (alertsRes.success) {
        setAlerts(alertsRes.data);
      }

      if (touristsRes.success) {
        setTourists(touristsRes.data);
      }

      if (geoFencesRes.success) {
        setGeoFences(geoFencesRes.data);
      }

      // Calculate stats
      const activeAlertsCount = alertsRes.data?.filter(alert => alert.status === 'active').length || 0;
      const resolvedTodayCount = alertsRes.data?.filter(alert => 
        alert.status === 'resolved' && 
        new Date(alert.resolved_at).toDateString() === new Date().toDateString()
      ).length || 0;

      setStats({
        totalTourists: touristsRes.data?.length || 0,
        activeAlerts: activeAlertsCount,
        resolvedToday: resolvedTodayCount,
        averageResponseTime: 5.2 // Mock data - would be calculated from actual response times
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error(t('error_loading_data'));
    } finally {
      setLoading(false);
    }
  };

  const handleNewAlert = (alert) => {
    setAlerts(prev => [alert, ...prev]);
    setStats(prev => ({ ...prev, activeAlerts: prev.activeAlerts + 1 }));
    toast.error(`${t('new_emergency_alert')}: ${alert.tourist_name}`);
  };

  const handleAlertUpdate = (updatedAlert) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === updatedAlert.id ? updatedAlert : alert
    ));
  };

  const handleLocationUpdate = (locationData) => {
    setTourists(prev => prev.map(tourist => 
      tourist.id === locationData.tourist_id 
        ? { ...tourist, last_location: locationData }
        : tourist
    ));
  };

  const handleRespondToAlert = async (alertId, status, notes = '') => {
    try {
      const response = await respondToAlert(alertId, { status, notes });
      
      if (response.success) {
        setAlerts(prev => prev.map(alert => 
          alert.id === alertId 
            ? { ...alert, status, notes, resolved_at: new Date().toISOString() }
            : alert
        ));
        
        if (status === 'resolved') {
          setStats(prev => ({ 
            ...prev, 
            activeAlerts: prev.activeAlerts - 1,
            resolvedToday: prev.resolvedToday + 1
          }));
        }
        
        toast.success(t('alert_updated_successfully'));
      } else {
        toast.error(response.message || t('error_updating_alert'));
      }
    } catch (error) {
      console.error('Error responding to alert:', error);
      toast.error(t('error_updating_alert'));
    }
  };

  const handleQRScan = async () => {
    if (!qrScanner.code.trim()) {
      toast.error(t('please_enter_qr_code'));
      return;
    }

    try {
      const response = await scanQRCode(qrScanner.code);
      
      if (response.success) {
        setQrScanner(prev => ({ ...prev, result: response.data }));
        toast.success(t('qr_code_scanned_successfully'));
      } else {
        toast.error(response.message || t('invalid_qr_code'));
        setQrScanner(prev => ({ ...prev, result: null }));
      }
    } catch (error) {
      console.error('Error scanning QR code:', error);
      toast.error(t('error_scanning_qr_code'));
    }
  };

  const handleCreateGeoFence = async (e) => {
    e.preventDefault();
    
    try {
      const response = await createGeoFence(geoFenceForm);
      
      if (response.success) {
        setGeoFences(prev => [...prev, response.data]);
        setGeoFenceForm({
          name: '',
          latitude: '',
          longitude: '',
          radius: 1000,
          type: 'safe',
          description: ''
        });
        toast.success(t('geo_fence_created_successfully'));
      } else {
        toast.error(response.message || t('error_creating_geo_fence'));
      }
    } catch (error) {
      console.error('Error creating geo-fence:', error);
      toast.error(t('error_creating_geo_fence'));
    }
  };

  const handleDeleteGeoFence = async (geoFenceId) => {
    if (!window.confirm(t('confirm_delete_geo_fence'))) {
      return;
    }

    try {
      const response = await deleteGeoFence(geoFenceId);
      
      if (response.success) {
        setGeoFences(prev => prev.filter(gf => gf.id !== geoFenceId));
        toast.success(t('geo_fence_deleted_successfully'));
      } else {
        toast.error(response.message || t('error_deleting_geo_fence'));
      }
    } catch (error) {
      console.error('Error deleting geo-fence:', error);
      toast.error(t('error_deleting_geo_fence'));
    }
  };

  const getAlertIcon = (severity) => {
    switch (severity) {
      case 'high':
        return '🚨';
      case 'medium':
        return '⚠️';
      case 'low':
        return 'ℹ️';
      default:
        return '📍';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-red-600 bg-red-100';
      case 'investigating':
        return 'text-yellow-600 bg-yellow-100';
      case 'resolved':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading_dashboard')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('police_dashboard')}</h1>
            <p className="text-gray-600">{t('police_dashboard_subtitle')}</p>
          </div>
          <LanguageSwitcher />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {t('total_tourists')}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalTourists}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {t('active_alerts')}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.activeAlerts}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {t('resolved_today')}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.resolvedToday}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {t('avg_response_time')}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.averageResponseTime}m
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'alerts', label: t('emergency_alerts'), icon: '🚨' },
              { id: 'map', label: t('tourist_map'), icon: '🗺️' },
              { id: 'qr-scanner', label: t('qr_scanner'), icon: '📱' },
              { id: 'geo-fences', label: t('geo_fences'), icon: '🚧' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">{t('emergency_alerts')}</h3>
              </div>
              <div className="card-body">
                {alerts.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-6xl mb-4">🎉</div>
                    <p className="text-gray-500">{t('no_active_alerts')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {alerts.map((alert) => (
                      <div key={alert.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <span className="text-2xl mr-3">{getAlertIcon(alert.severity)}</span>
                              <div>
                                <h4 className="text-lg font-semibold text-gray-900">
                                  {alert.tourist_name}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  {new Date(alert.created_at).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            
                            <p className="text-gray-700 mb-3">{alert.message}</p>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>📍 {alert.location?.latitude?.toFixed(6)}, {alert.location?.longitude?.toFixed(6)}</span>
                              <span>📱 {alert.tourist_phone}</span>
                              {alert.severity && (
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                                  alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {t(alert.severity)} {t('priority')}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col space-y-2 ml-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                              {t(alert.status)}
                            </span>
                            
                            {alert.status === 'active' && (
                              <div className="flex flex-col space-y-1">
                                <button
                                  onClick={() => handleRespondToAlert(alert.id, 'investigating')}
                                  className="btn btn-secondary btn-sm"
                                >
                                  {t('investigate')}
                                </button>
                                <button
                                  onClick={() => handleRespondToAlert(alert.id, 'resolved')}
                                  className="btn btn-primary btn-sm"
                                >
                                  {t('resolve')}
                                </button>
                              </div>
                            )}
                            
                            {alert.status === 'investigating' && (
                              <button
                                onClick={() => handleRespondToAlert(alert.id, 'resolved')}
                                className="btn btn-primary btn-sm"
                              >
                                {t('resolve')}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'map' && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">{t('tourist_map')}</h3>
            </div>
            <div className="card-body p-0">
              <div style={{ height: '600px' }}>
                <MapContainer
                  center={[19.4326, -99.1332]} // Mexico City coordinates
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  
                  {/* Tourist markers */}
                  {tourists.map((tourist) => (
                    tourist.last_location && (
                      <Marker
                        key={tourist.id}
                        position={[tourist.last_location.latitude, tourist.last_location.longitude]}
                      >
                        <Popup>
                          <div className="p-2">
                            <h4 className="font-semibold">{tourist.name}</h4>
                            <p className="text-sm text-gray-600">{tourist.nationality}</p>
                            <p className="text-sm text-gray-600">{tourist.phone}</p>
                            <p className="text-xs text-gray-500">
                              {t('last_seen')}: {new Date(tourist.last_location.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </Popup>
                      </Marker>
                    )
                  ))}
                  
                  {/* Geo-fence circles */}
                  {geoFences.map((geoFence) => (
                    <Circle
                      key={geoFence.id}
                      center={[geoFence.latitude, geoFence.longitude]}
                      radius={geoFence.radius}
                      color={geoFence.type === 'safe' ? 'green' : geoFence.type === 'restricted' ? 'red' : 'orange'}
                      fillOpacity={0.1}
                    >
                      <Popup>
                        <div className="p-2">
                          <h4 className="font-semibold">{geoFence.name}</h4>
                          <p className="text-sm text-gray-600">{geoFence.description}</p>
                          <p className="text-xs text-gray-500">
                            {t('type')}: {t(geoFence.type)} | {t('radius')}: {geoFence.radius}m
                          </p>
                        </div>
                      </Popup>
                    </Circle>
                  ))}
                </MapContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'qr-scanner' && (
          <div className="space-y-6">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">{t('qr_scanner')}</h3>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('enter_qr_code')}
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder={t('qr_code_placeholder')}
                        value={qrScanner.code}
                        onChange={(e) => setQrScanner(prev => ({ ...prev, code: e.target.value }))}
                      />
                      <button
                        onClick={handleQRScan}
                        className="btn btn-primary"
                      >
                        {t('scan')}
                      </button>
                    </div>
                  </div>

                  {qrScanner.result && (
                    <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-3">{t('tourist_information')}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">{t('name')}:</span>
                          <span className="ml-2 text-gray-900">{qrScanner.result.name}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">{t('nationality')}:</span>
                          <span className="ml-2 text-gray-900">{qrScanner.result.nationality}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">{t('phone')}:</span>
                          <span className="ml-2 text-gray-900">{qrScanner.result.phone}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">{t('passport_number')}:</span>
                          <span className="ml-2 text-gray-900">{qrScanner.result.passport}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">{t('emergency_contact')}:</span>
                          <span className="ml-2 text-gray-900">{qrScanner.result.emergency_contact}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">{t('qr_generated')}:</span>
                          <span className="ml-2 text-gray-900">
                            {new Date(qrScanner.result.generated_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'geo-fences' && (
          <div className="space-y-6">
            {/* Create Geo-fence Form */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">{t('create_geo_fence')}</h3>
              </div>
              <div className="card-body">
                <form onSubmit={handleCreateGeoFence} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('name')}
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        value={geoFenceForm.name}
                        onChange={(e) => setGeoFenceForm(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('type')}
                      </label>
                      <select
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        value={geoFenceForm.type}
                        onChange={(e) => setGeoFenceForm(prev => ({ ...prev, type: e.target.value }))}
                      >
                        <option value="safe">{t('safe_zone')}</option>
                        <option value="restricted">{t('restricted_zone')}</option>
                        <option value="warning">{t('warning_zone')}</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('latitude')}
                      </label>
                      <input
                        type="number"
                        step="any"
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        value={geoFenceForm.latitude}
                        onChange={(e) => setGeoFenceForm(prev => ({ ...prev, latitude: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('longitude')}
                      </label>
                      <input
                        type="number"
                        step="any"
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        value={geoFenceForm.longitude}
                        onChange={(e) => setGeoFenceForm(prev => ({ ...prev, longitude: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('radius')} (m)
                      </label>
                      <input
                        type="number"
                        min="100"
                        max="10000"
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        value={geoFenceForm.radius}
                        onChange={(e) => setGeoFenceForm(prev => ({ ...prev, radius: parseInt(e.target.value) }))}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('description')}
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        value={geoFenceForm.description}
                        onChange={(e) => setGeoFenceForm(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <button type="submit" className="btn btn-primary">
                    {t('create_geo_fence')}
                  </button>
                </form>
              </div>
            </div>

            {/* Existing Geo-fences */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">{t('existing_geo_fences')}</h3>
              </div>
              <div className="card-body">
                {geoFences.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-6xl mb-4">🚧</div>
                    <p className="text-gray-500">{t('no_geo_fences_created')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {geoFences.map((geoFence) => (
                      <div key={geoFence.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="text-lg font-semibold text-gray-900">{geoFence.name}</h4>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                geoFence.type === 'safe' ? 'bg-green-100 text-green-800' :
                                geoFence.type === 'restricted' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {t(geoFence.type)}
                              </span>
                            </div>
                            
                            {geoFence.description && (
                              <p className="text-gray-600 mb-2">{geoFence.description}</p>
                            )}
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>📍 {geoFence.latitude}, {geoFence.longitude}</span>
                              <span>📏 {geoFence.radius}m {t('radius')}</span>
                              <span>📅 {new Date(geoFence.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleDeleteGeoFence(geoFence.id)}
                            className="btn btn-danger btn-sm"
                          >
                            {t('delete')}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PoliceDashboard;