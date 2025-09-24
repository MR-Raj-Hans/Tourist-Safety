import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthToken, getUserData, clearAuth, getTourists } from '../services/api';
import { panicAPI } from '../services/api';

import Navbar from '../components/Navbar';
import { FiMap, FiUsers, FiActivity, FiShield, FiAlertTriangle, FiClock, FiNavigation, FiRadio, FiFileText, FiPhone, FiMapPin, FiZap, FiEye, FiCamera, FiMic } from 'react-icons/fi';

const PoliceDashboard = () => {
  const navigate = useNavigate();
  const [tourists, setTourists] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [heatmapVisible, setHeatmapVisible] = useState(true);
  const [liveTracking, setLiveTracking] = useState(false);
  const [firReports, setFirReports] = useState([]);
  const [newFir, setNewFir] = useState({ title: '', description: '', location: '', priority: 'medium' });
  const [showFirModal, setShowFirModal] = useState(false);
  const [policeUnits, setPoliceUnits] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [incidentHeatmap, setIncidentHeatmap] = useState([]);
  const [realTimeStats, setRealTimeStats] = useState({
    activeTourists: 0,
    activeAlerts: 0,
    responseTime: '4.2 min',
    safetyScore: 85,
    patrolUnits: 12,
    resolvedToday: 23
  });
  const mapRef = useRef(null);

  useEffect(() => {
    const token = getAuthToken();
    const user = getUserData();

    const isDev = process.env.NODE_ENV === 'development';

    // If in development and dev DB is enabled, fetch dev snapshot first to avoid 403 logs
    if (isDev && process.env.REACT_APP_USE_DEV_DB !== 'false') {
      loadData();
      return;
    }

    // Otherwise require auth as usual
    if (!token || !user || user.userType !== 'police') {
      navigate('/login?type=admin');
      return;
    }

    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // If in development and dev DB is enabled, fetch dev snapshot directly
      if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_DEV_DB !== 'false') {
        try {
          const devResp = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:5001') + '/api/dev/db');
          if (devResp.ok) {
            const json = await devResp.json();
            if (json.success && json.data) {
              setTourists(json.data.tourists || []);
              setAlerts(json.data.alerts.filter(a => a.status === 'active') || []);
              return;
            }
          }
        } catch (devErr) {
          console.warn('Dev DB fallback failed', devErr.message);
        }
      }

      // Try authenticated endpoints (production / authenticated testing)
      let res, alertsRes;
      try {
        res = await getTourists();
        if (res && res.success) setTourists(res.data || []);

        alertsRes = await panicAPI.getActiveAlerts();
        if (alertsRes && alertsRes.data && alertsRes.data.data) setAlerts(alertsRes.data.data);
      } catch (authErr) {
        console.warn('Authenticated API failed', authErr.message);
      }
    } catch (err) {
      console.error('Error loading admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const resolveAlert = async (alertId) => {
    try {
      await panicAPI.updateAlertStatus(alertId, 'resolved');
      loadData();
    } catch (err) {
      console.error('Error resolving alert', err);
    }
  };

  // Initialize live features and mock data
  useEffect(() => {
    // Initialize police units
    setPoliceUnits([
      { id: 1, name: 'Unit Alpha', status: 'active', location: { lat: 12.9716, lng: 77.5946 }, officers: 2 },
      { id: 2, name: 'Unit Beta', status: 'patrol', location: { lat: 12.9716, lng: 77.6000 }, officers: 3 },
      { id: 3, name: 'Unit Gamma', status: 'responding', location: { lat: 12.9800, lng: 77.5946 }, officers: 2 },
      { id: 4, name: 'Unit Delta', status: 'active', location: { lat: 12.9700, lng: 77.6100 }, officers: 4 }
    ]);

    // Initialize emergency contacts
    setEmergencyContacts([
      { id: 1, name: 'Fire Department', number: '101', status: 'available' },
      { id: 2, name: 'Medical Emergency', number: '108', status: 'available' },
      { id: 3, name: 'Tourist Helpline', number: '1363', status: 'busy' },
      { id: 4, name: 'Women Helpline', number: '1091', status: 'available' }
    ]);

    // Initialize sample FIR reports
    setFirReports([
      { 
        id: 1, 
        title: 'Tourist Harassment Case', 
        description: 'Foreign tourist reported harassment at popular tourist spot',
        location: 'Palace Road, Bangalore',
        priority: 'high',
        status: 'investigating',
        reportedAt: '2024-01-15 14:30',
        officer: 'Inspector Raj Kumar'
      },
      { 
        id: 2, 
        title: 'Lost Documents', 
        description: 'Tourist lost passport and documents near bus station',
        location: 'Majestic Bus Station',
        priority: 'medium',
        status: 'open',
        reportedAt: '2024-01-15 12:15',
        officer: 'SI Priya Sharma'
      }
    ]);

    // Initialize heatmap data
    setIncidentHeatmap([
      { lat: 12.9716, lng: 77.5946, intensity: 0.8, incidents: 5 },
      { lat: 12.9800, lng: 77.6000, intensity: 0.6, incidents: 3 },
      { lat: 12.9650, lng: 77.6050, intensity: 0.9, incidents: 7 },
      { lat: 12.9750, lng: 77.5900, intensity: 0.4, incidents: 2 }
    ]);

    // Update real-time stats
    setRealTimeStats(prev => ({
      ...prev,
      activeTourists: tourists.length,
      activeAlerts: alerts.length
    }));
  }, [tourists, alerts]);

  // Live tracking toggle
  const toggleLiveTracking = () => {
    setLiveTracking(!liveTracking);
    if (!liveTracking) {
      // Start live tracking simulation
      console.log('Live tracking activated');
    } else {
      console.log('Live tracking deactivated');
    }
  };

  // Create new FIR
  const createFir = () => {
    if (!newFir.title || !newFir.description) return;
    
    const fir = {
      id: firReports.length + 1,
      ...newFir,
      status: 'open',
      reportedAt: new Date().toLocaleString(),
      officer: 'Current Officer'
    };
    
    setFirReports([fir, ...firReports]);
    setNewFir({ title: '', description: '', location: '', priority: 'medium' });
    setShowFirModal(false);
  };

  // Get priority color for badges
  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-400/10';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'low': return 'text-green-400 bg-green-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  // Get unit status color
  const getUnitStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/10';
      case 'patrol': return 'text-blue-400 bg-blue-400/10';
      case 'responding': return 'text-red-400 bg-red-400/10';
      case 'offline': return 'text-gray-400 bg-gray-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  // Get priority gradient color for alerts
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'from-red-500 to-orange-500';
      case 'medium': return 'from-yellow-500 to-orange-400';
      case 'low': return 'from-green-500 to-emerald-500';
      default: return 'from-blue-500 to-indigo-500';
    }
  };

  const getAlertTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'panic': return '🚨';
      case 'medical': return '🏥';
      case 'theft': return '⚠️';
      case 'harassment': return '🛡️';
      default: return '📍';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-aurora text-white relative overflow-hidden">
      <Navbar />
      
      {/* Dashboard Grid with Navbar */}
      <div className="relative z-10 w-full px-2 sm:px-4 lg:px-6 py-6">
        <div className="grid grid-cols-12 gap-6 lg:gap-8 min-h-[calc(100vh-140px)] max-w-full">
          
          {/* Left Sidebar - Live Alerts */}
          <div className="col-span-12 lg:col-span-3 space-y-6 overflow-y-auto custom-scrollbar max-h-[calc(100vh-160px)]">
            <div className="premium-glass-enhanced backdrop-blur-xl border-2 border-white/40 p-4 sticky top-0 z-20 rounded-3xl shadow-xl mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold premium-text-bold flex items-center gap-2">
                  🚨 Live Alerts
                  {alerts.length > 0 && (
                    <span className="bg-gradient-to-r from-red-500 to-orange-500 px-2 py-0.5 rounded-full text-xs animate-pulse text-white">
                      {alerts.length}
                    </span>
                  )}
                </h2>
                <div className="flex gap-1">
                  <button className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs">
                    🔄
                  </button>
                  <button className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs">
                    ⚙️
                  </button>
                </div>
              </div>

              {/* Alert Filter and Control Panel */}
              <div className="mb-4 space-y-2">
                <div className="flex gap-2 text-xs">
                  <button className="px-2 py-1 rounded-lg bg-red-500/20 text-red-300 border border-red-400/30">
                    High Priority ({alerts.filter(a => a.priority === 'high').length})
                  </button>
                  <button className="px-2 py-1 rounded-lg bg-white/10 text-white/70 hover:bg-white/20">
                    All ({alerts.length})
                  </button>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center p-2 rounded-lg bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-400/30">
                    <div className="font-bold text-red-300">{alerts.filter(a => a.priority === 'high').length}</div>
                    <div className="text-red-400/70">Critical</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30">
                    <div className="font-bold text-yellow-300">{alerts.filter(a => a.priority === 'medium').length}</div>
                    <div className="text-yellow-400/70">Medium</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30">
                    <div className="font-bold text-green-300">{alerts.filter(a => a.priority === 'low').length}</div>
                    <div className="text-green-400/70">Low</div>
                  </div>
                </div>
              </div>
              
              {loading ? (
                <div className="animate-pulse space-y-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="premium-glass-enhanced h-16 rounded-2xl border border-white/20"></div>
                  ))}
                </div>
              ) : alerts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">✅</div>
                  <p className="premium-text-secondary">All Clear - No Active Alerts</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map(alert => (
                    <div 
                      key={alert.id}
                      className={`premium-glass-enhanced p-4 cursor-pointer transition-all duration-300 rounded-2xl border-l-4 ${
                        selectedAlert?.id === alert.id ? 'border-blue-500 bg-blue-500/20' : 'border-red-500'
                      }`}
                      onClick={() => setSelectedAlert(alert)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{getAlertTypeIcon(alert.alert_type)}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${getPriorityColor(alert.priority)}`}>
                            {alert.priority?.toUpperCase()}
                          </span>
                        </div>
                        <span className="text-xs premium-text-secondary">
                          {new Date(alert.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      <h3 className="font-bold text-white mb-1">
                        {alert.alert_type?.toUpperCase()} ALERT
                      </h3>
                      <p className="text-sm text-white/80 mb-2">{alert.tourist_name}</p>
                      <p className="text-xs text-white/60 mb-3 line-clamp-2">{alert.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/60">📍 {alert.location}</span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            resolveAlert(alert.id);
                          }}
                          className="btn-glass px-3 py-1 text-xs bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                        >
                          Resolve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions Panel */}
            <div className="premium-glass-enhanced backdrop-blur-xl border-2 border-blue-400/30 p-5 rounded-3xl shadow-xl">
              <h3 className="text-lg font-bold premium-text-bold mb-4 flex items-center gap-2">
                <FiZap className="text-yellow-400" /> Quick Actions
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <button className="p-3 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 text-blue-300 hover:from-blue-500/30 hover:to-purple-500/30 transition-all">
                  <FiRadio className="mx-auto mb-2 text-lg" />
                  <div className="text-xs font-medium">Dispatch</div>
                </button>
                
                <button className="p-3 rounded-2xl bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-400/30 text-red-300 hover:from-red-500/30 hover:to-orange-500/30 transition-all">
                  <FiAlertTriangle className="mx-auto mb-2 text-lg" />
                  <div className="text-xs font-medium">Emergency</div>
                </button>
                
                <button className="p-3 rounded-2xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 text-green-300 hover:from-green-500/30 hover:to-emerald-500/30 transition-all">
                  <FiUsers className="mx-auto mb-2 text-lg" />
                  <div className="text-xs font-medium">Tourist List</div>
                </button>
                
                <button 
                  onClick={() => setShowFirModal(true)}
                  className="p-3 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 text-purple-300 hover:from-purple-500/30 hover:to-pink-500/30 transition-all"
                >
                  <FiFileText className="mx-auto mb-2 text-lg" />
                  <div className="text-xs font-medium">New FIR</div>
                </button>
              </div>
            </div>

            {/* Live Statistics Monitor */}
            <div className="premium-glass-enhanced backdrop-blur-xl border-2 border-green-400/30 p-5 rounded-3xl shadow-xl">
              <h3 className="text-lg font-bold premium-text-bold mb-4 flex items-center gap-2">
                <FiActivity className="text-green-400" /> Live Monitor
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-white/80">Command Center</span>
                  </div>
                  <span className="text-xs text-green-400 font-medium">Online</span>
                </div>
                
                <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-white/80">GPS Network</span>
                  </div>
                  <span className="text-xs text-blue-400 font-medium">Active</span>
                </div>
                
                <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-white/80">Alert System</span>
                  </div>
                  <span className="text-xs text-yellow-400 font-medium">Monitoring</span>
                </div>
                
                <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-white/80">Communication</span>
                  </div>
                  <span className="text-xs text-purple-400 font-medium">Clear</span>
                </div>
              </div>
            </div>

            {/* Emergency Quick Dial */}
            <div className="premium-glass-enhanced backdrop-blur-xl border-2 border-red-400/30 p-5 rounded-3xl shadow-xl">
              <h3 className="text-lg font-bold premium-text-bold mb-4 flex items-center gap-2">
                <FiPhone className="text-red-400" /> Emergency Dial
              </h3>
              
              <div className="grid grid-cols-2 gap-2">
                <button className="p-2 rounded-xl bg-red-500/20 border border-red-400/30 text-red-300 hover:bg-red-500/30 transition-all text-xs font-medium">
                  🚨 Police
                  <div className="text-xs opacity-70">100</div>
                </button>
                
                <button className="p-2 rounded-xl bg-orange-500/20 border border-orange-400/30 text-orange-300 hover:bg-orange-500/30 transition-all text-xs font-medium">
                  🔥 Fire
                  <div className="text-xs opacity-70">101</div>
                </button>
                
                <button className="p-2 rounded-xl bg-green-500/20 border border-green-400/30 text-green-300 hover:bg-green-500/30 transition-all text-xs font-medium">
                  🏥 Medical
                  <div className="text-xs opacity-70">108</div>
                </button>
                
                <button className="p-2 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-300 hover:bg-blue-500/30 transition-all text-xs font-medium">
                  ℹ️ Tourist
                  <div className="text-xs opacity-70">1363</div>
                </button>
              </div>
            </div>
          </div>

          {/* Center - Command Map */}
          <div className="col-span-12 lg:col-span-5">
            <div className="premium-glass-enhanced backdrop-blur-xl border border-white/30 h-[calc(100vh-160px)] p-6 relative overflow-hidden rounded-3xl shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  🗺️ Command Map
                  <span className="text-xs bg-green-500/20 px-2 py-1 rounded-full text-green-300">
                    {liveTracking ? 'LIVE' : 'STATIC'}
                  </span>
                </h2>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setHeatmapVisible(!heatmapVisible)}
                    className={`px-3 py-1 text-xs rounded-lg transition-all ${
                      heatmapVisible 
                        ? 'bg-red-500/20 text-red-300 border border-red-400/30' 
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    Heat
                  </button>
                  <button 
                    onClick={toggleLiveTracking}
                    className={`px-3 py-1 text-xs rounded-lg transition-all ${
                      liveTracking 
                        ? 'bg-green-500/20 text-green-300 border border-green-400/30' 
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    GPS
                  </button>
                  <button className="px-3 py-1 text-xs rounded-lg bg-white/10 text-white/70 hover:bg-white/20">3D</button>
                </div>
              </div>
              
              {/* Enhanced Interactive Map */}
              <div className="relative h-full min-h-[500px] lg:min-h-[600px] bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-2xl overflow-hidden shadow-2xl">
                {/* Enhanced Heatmap Overlay */}
                {heatmapVisible && (
                  <div className="absolute inset-0 rounded-lg">
                    {incidentHeatmap.map((point, index) => (
                      <div 
                        key={index}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2"
                        style={{
                          top: `${(point.lat - 12.9500) * 2000 + 200}px`,
                          left: `${(point.lng - 77.5800) * 2000 + 200}px`,
                          width: `${point.intensity * 60}px`,
                          height: `${point.intensity * 60}px`,
                        }}
                      >
                        <div 
                          className={`w-full h-full rounded-full blur-xl animate-pulse-slow ${
                            point.intensity > 0.7 ? 'bg-red-500/40' : 
                            point.intensity > 0.5 ? 'bg-orange-500/30' : 'bg-yellow-500/20'
                          }`}
                        ></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-bold text-white bg-black/50 px-2 py-1 rounded-full">
                            {point.incidents}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Live Alert Markers */}
                {alerts.map((alert, index) => (
                  <div 
                    key={alert.id}
                    className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      top: `${20 + (index * 15) % 60}%`,
                      left: `${25 + (index * 20) % 50}%`
                    }}
                    onClick={() => setSelectedAlert(alert)}
                  >
                    <div className="relative">
                      <div className="w-6 h-6 bg-red-500 rounded-full shadow-lg ring-4 ring-red-500/30 animate-ping"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <FiAlertTriangle className="text-white text-xs" />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Police Unit Markers */}
                {liveTracking && policeUnits.map((unit, index) => (
                  <div 
                    key={unit.id}
                    className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      top: `${30 + (index * 20) % 40}%`,
                      left: `${60 + (index * 15) % 30}%`
                    }}
                  >
                    <div className="relative">
                      <div className={`w-5 h-5 rounded-full shadow-lg ring-2 transition-all ${
                        unit.status === 'active' ? 'bg-green-500 ring-green-500/30' :
                        unit.status === 'patrol' ? 'bg-blue-500 ring-blue-500/30' :
                        unit.status === 'responding' ? 'bg-red-500 ring-red-500/30 animate-pulse' :
                        'bg-gray-500 ring-gray-500/30'
                      }`}></div>
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity">
                        {unit.name}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Tourist Location Markers */}
                {liveTracking && tourists.slice(0, 8).map((tourist, index) => (
                  <div 
                    key={tourist.id}
                    className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      top: `${40 + (index * 12) % 50}%`,
                      left: `${15 + (index * 18) % 70}%`
                    }}
                  >
                    <div className="relative">
                      <div className="w-3 h-3 bg-blue-400 rounded-full shadow-lg ring-2 ring-blue-400/30 animate-pulse-slow"></div>
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity">
                        {tourist.name || 'Tourist'}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Enhanced Map Controls */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <button className="w-10 h-10 premium-glass-enhanced rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all">
                    <span className="text-white font-bold">+</span>
                  </button>
                  <button className="w-10 h-10 premium-glass-enhanced rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all">
                    <span className="text-white font-bold">−</span>
                  </button>
                  <button className="w-10 h-10 premium-glass-enhanced rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all">
                    <FiNavigation className="text-white" />
                  </button>
                  <button className="w-10 h-10 premium-glass-enhanced rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all">
                    <FiActivity className="text-white" />
                  </button>
                </div>

                {/* Live Status Indicator */}
                <div className="absolute top-3 left-3 premium-glass-enhanced p-2 rounded-xl flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-white font-medium">LIVE</span>
                </div>
                
                {/* Map Legend - Compact */}
                <div className="absolute bottom-3 left-3 premium-glass-enhanced p-2 rounded-xl">
                  <div className="text-xs text-white/80 flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>Alerts</span>
                    </div>
                    {liveTracking && (
                      <>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Units</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <span>Tourists</span>
                        </div>
                      </>
                    )}
                    {heatmapVisible && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-gradient-to-r from-yellow-500 to-red-500 rounded-full"></div>
                        <span>Zones</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Live Data Stream Indicator */}
                <div className="absolute bottom-3 right-3 premium-glass-enhanced p-2 rounded-xl flex items-center gap-1">
                  <FiZap className="text-green-400 animate-pulse text-sm" />
                  <span className="text-xs text-white">Live</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Enhanced Police Operations */}
          <div className="col-span-12 lg:col-span-4 space-y-6 overflow-y-auto custom-scrollbar max-h-[calc(100vh-160px)]">
            
            {/* Live Control Panel */}
            <div className="premium-glass-enhanced backdrop-blur-xl border-2 border-purple-400/30 p-5 rounded-3xl shadow-xl">
              <h3 className="text-lg font-bold premium-text-bold mb-4 flex items-center gap-2">
                <FiRadio className="text-blue-400" /> Live Controls
              </h3>
              
              <div className="space-y-3">
                <button 
                  onClick={() => setHeatmapVisible(!heatmapVisible)}
                  className={`w-full p-3 rounded-2xl border transition-all duration-300 flex items-center gap-3 ${
                    heatmapVisible 
                      ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-400/50 text-red-300' 
                      : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <FiMap className="text-xl" />
                  <div className="text-left">
                    <div className="font-medium text-sm">Incident Heatmap</div>
                    <div className="text-xs opacity-70">{heatmapVisible ? 'Active' : 'Inactive'}</div>
                  </div>
                  {heatmapVisible && <div className="ml-auto w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>}
                </button>

                <button 
                  onClick={toggleLiveTracking}
                  className={`w-full p-3 rounded-2xl border transition-all duration-300 flex items-center gap-3 ${
                    liveTracking 
                      ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-400/50 text-green-300' 
                      : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <FiNavigation className="text-xl" />
                  <div className="text-left">
                    <div className="font-medium text-sm">Live GPS Tracking</div>
                    <div className="text-xs opacity-70">{liveTracking ? 'Monitoring' : 'Standby'}</div>
                  </div>
                  {liveTracking && <div className="ml-auto w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>}
                </button>

                <button 
                  onClick={() => setShowFirModal(true)}
                  className="w-full p-3 rounded-2xl border bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-400/50 text-blue-300 transition-all duration-300 hover:from-blue-500/30 hover:to-purple-500/30 flex items-center gap-3"
                >
                  <FiFileText className="text-xl" />
                  <div className="text-left">
                    <div className="font-medium text-sm">Create FIR Report</div>
                    <div className="text-xs opacity-70">File new incident</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Real-time Stats Grid */}
            <div className="grid grid-cols-2 gap-6">
              <div className="premium-glass-enhanced p-5 rounded-2xl border-2 border-emerald-400/40 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-emerald-300/70">Active Tourists</p>
                    <p className="text-2xl font-bold text-emerald-300">{realTimeStats.activeTourists}</p>
                  </div>
                  <FiUsers className="text-2xl text-emerald-400" />
                </div>
              </div>
              
              <div className="premium-glass-enhanced p-5 rounded-2xl border-2 border-red-400/40 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-red-300/70">Active Alerts</p>
                    <p className="text-2xl font-bold text-red-300">{realTimeStats.activeAlerts}</p>
                  </div>
                  <FiAlertTriangle className="text-2xl text-red-400" />
                </div>
              </div>
              
              <div className="premium-glass-enhanced p-5 rounded-2xl border-2 border-blue-400/40 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-blue-300/70">Response Time</p>
                    <p className="text-lg font-bold text-blue-300">{realTimeStats.responseTime}</p>
                  </div>
                  <FiClock className="text-2xl text-blue-400" />
                </div>
              </div>
              
              <div className="premium-glass-enhanced p-5 rounded-2xl border-2 border-green-400/40 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-green-300/70">Safety Score</p>
                    <p className="text-lg font-bold text-green-300">{realTimeStats.safetyScore}%</p>
                  </div>
                  <FiShield className="text-2xl text-green-400" />
                </div>
              </div>
            </div>

            {/* Police Units Status */}
            <div className="premium-glass-enhanced backdrop-blur-xl border-2 border-blue-400/30 p-5 rounded-3xl shadow-xl">
              <h3 className="text-lg font-bold premium-text-bold mb-4 flex items-center gap-2">
                <FiRadio className="text-blue-400" /> Police Units
                <span className="ml-auto text-xs bg-blue-500/20 px-2 py-1 rounded-full">
                  {policeUnits.length}
                </span>
              </h3>
              
              <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar">
                {policeUnits.map(unit => (
                  <div key={unit.id} className="premium-glass-enhanced p-3 rounded-2xl border border-white/20">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-white text-sm">{unit.name}</div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUnitStatusColor(unit.status)}`}>
                        {unit.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-white/70">
                      <span>{unit.officers} officers</span>
                      <span className="flex items-center gap-1">
                        <FiMapPin className="text-xs" />
                        Live GPS
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="premium-glass-enhanced backdrop-blur-xl border-2 border-red-400/30 p-5 rounded-3xl shadow-xl">
              <h3 className="text-lg font-bold premium-text-bold mb-4 flex items-center gap-2">
                <FiPhone className="text-red-400" /> Emergency Contacts
              </h3>
              
              <div className="space-y-2">
                {emergencyContacts.map(contact => (
                  <div key={contact.id} className="flex items-center justify-between p-2 premium-glass-enhanced rounded-xl">
                    <div>
                      <div className="font-medium text-white text-sm">{contact.name}</div>
                      <div className="text-xs text-white/70">{contact.number}</div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${
                      contact.status === 'available' ? 'bg-green-400' : 
                      contact.status === 'busy' ? 'bg-red-400' : 'bg-gray-400'
                    }`}></div>
                  </div>
                ))}
              </div>
            </div>

            {/* FIR Reports Summary */}
            <div className="premium-glass-enhanced backdrop-blur-xl border-2 border-purple-400/30 p-5 rounded-3xl shadow-xl">
              <h3 className="text-lg font-bold premium-text-bold mb-4 flex items-center gap-2">
                <FiFileText className="text-purple-400" /> FIR Reports
                <span className="ml-auto text-xs bg-purple-500/20 px-2 py-1 rounded-full">
                  {firReports.length}
                </span>
              </h3>
              
              <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                {firReports.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-white/50 text-sm">No FIR reports yet</p>
                  </div>
                ) : (
                  firReports.slice(0, 4).map(fir => (
                    <div key={fir.id} className="premium-glass-enhanced p-3 rounded-2xl border border-white/20 hover:border-white/40 transition-all cursor-pointer">
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium text-white text-sm truncate pr-2">{fir.title}</div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadgeColor(fir.priority)} whitespace-nowrap`}>
                          {fir.priority}
                        </span>
                      </div>
                      <div className="text-xs text-white/70 mb-2 line-clamp-2">{fir.description}</div>
                      <div className="flex items-center justify-between text-xs text-white/50">
                        <span className="flex items-center gap-1 truncate">
                          <FiMapPin className="text-xs flex-shrink-0" />
                          {fir.location}
                        </span>
                        <span className="whitespace-nowrap">{new Date(fir.reportedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Tourist Registry */}
            <div className="premium-glass-enhanced backdrop-blur-xl border-2 border-green-400/30 p-5 rounded-3xl shadow-xl">
              <h3 className="text-lg font-bold premium-text-bold mb-4 flex items-center gap-2">
                <FiUsers className="text-green-400" /> Tourist Registry
                <span className="ml-auto text-xs bg-green-500/20 px-2 py-1 rounded-full">
                  {tourists.length}
                </span>
              </h3>
              
              {loading ? (
                <div className="animate-pulse space-y-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="bg-white/10 h-12 rounded-lg"></div>
                  ))}
                </div>
              ) : tourists.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-white/70 text-sm">No registered tourists</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                  {tourists.slice(0, 6).map(tourist => (
                    <div key={tourist.id} className="premium-glass-enhanced p-3 rounded-2xl border border-white/10 hover:border-white/30 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sapphire to-emerald flex items-center justify-center text-white font-bold text-sm">
                          {tourist.name?.charAt(0) || tourist.email?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white text-sm truncate">
                            {tourist.name || tourist.email}
                          </p>
                          <p className="text-xs text-white/60 truncate">
                            {tourist.nationality || 'Unknown'} • {tourist.email}
                          </p>
                          <p className="text-xs text-white/50">
                            Joined: {new Date(tourist.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-xs text-green-400">Active</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activities */}
            <div className="premium-glass-enhanced backdrop-blur-xl border-2 border-yellow-400/30 p-5 rounded-3xl shadow-xl">
              <h3 className="text-lg font-bold premium-text-bold mb-4 flex items-center gap-2">
                <FiActivity className="text-yellow-400" /> Recent Activities
              </h3>
              
              <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar">
                <div className="flex items-start gap-3 p-2 premium-glass-enhanced rounded-xl">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-white">Alert resolved by Unit Alpha</p>
                    <p className="text-xs text-white/60">Palace Road • 2 min ago</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-2 premium-glass-enhanced rounded-xl">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-white">New tourist registered</p>
                    <p className="text-xs text-white/60">John Smith • 5 min ago</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-2 premium-glass-enhanced rounded-xl">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-white">FIR report filed</p>
                    <p className="text-xs text-white/60">MG Road • 8 min ago</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-2 premium-glass-enhanced rounded-xl">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-white">Unit Beta responding</p>
                    <p className="text-xs text-white/60">Brigade Road • 12 min ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full p-6 scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                {getAlertTypeIcon(selectedAlert.alert_type)} Alert Details
              </h3>
              <button 
                onClick={() => setSelectedAlert(null)}
                className="w-8 h-8 glass-card flex items-center justify-center hover:bg-white/20"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-white/70">Type</p>
                  <p className="font-bold text-white">{selectedAlert.alert_type?.toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-sm text-white/70">Priority</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${getPriorityColor(selectedAlert.priority)}`}>
                    {selectedAlert.priority?.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-white/70">Tourist</p>
                <p className="font-medium text-white">{selectedAlert.tourist_name}</p>
                <p className="text-sm text-white/60">{selectedAlert.tourist_phone}</p>
              </div>
              
              <div>
                <p className="text-sm text-white/70">Location</p>
                <p className="font-medium text-white">{selectedAlert.location}</p>
              </div>
              
              <div>
                <p className="text-sm text-white/70">Description</p>
                <p className="text-white">{selectedAlert.description}</p>
              </div>
              
              <div>
                <p className="text-sm text-white/70">Time</p>
                <p className="text-white">{new Date(selectedAlert.created_at).toLocaleString()}</p>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => {
                    resolveAlert(selectedAlert.id);
                    setSelectedAlert(null);
                  }}
                  className="btn-premium bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 flex-1"
                >
                  ✓ Resolve Alert
                </button>
                <button 
                  onClick={() => setSelectedAlert(null)}
                  className="btn-glass px-6"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FIR Creation Modal */}
      {showFirModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="premium-glass-enhanced backdrop-blur-xl border border-white/30 max-w-2xl w-full p-6 rounded-3xl scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold premium-text-bold flex items-center gap-3">
                <FiFileText className="text-blue-400" />
                Create FIR Report
              </h3>
              <button 
                onClick={() => setShowFirModal(false)}
                className="w-10 h-10 premium-glass-enhanced rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Incident Title *</label>
                <input
                  type="text"
                  value={newFir.title}
                  onChange={(e) => setNewFir({...newFir, title: e.target.value})}
                  className="w-full p-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-blue-400/50 focus:bg-white/20 transition-all"
                  placeholder="Brief description of the incident"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Location</label>
                  <input
                    type="text"
                    value={newFir.location}
                    onChange={(e) => setNewFir({...newFir, location: e.target.value})}
                    className="w-full p-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-blue-400/50 focus:bg-white/20 transition-all"
                    placeholder="Incident location"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Priority Level</label>
                  <select
                    value={newFir.priority}
                    onChange={(e) => setNewFir({...newFir, priority: e.target.value})}
                    className="w-full p-3 rounded-2xl bg-white/10 border border-white/20 text-white focus:border-blue-400/50 focus:bg-white/20 transition-all"
                  >
                    <option value="low" className="bg-slate-800">Low Priority</option>
                    <option value="medium" className="bg-slate-800">Medium Priority</option>
                    <option value="high" className="bg-slate-800">High Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Detailed Description *</label>
                <textarea
                  value={newFir.description}
                  onChange={(e) => setNewFir({...newFir, description: e.target.value})}
                  rows={4}
                  className="w-full p-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-blue-400/50 focus:bg-white/20 transition-all resize-none custom-scrollbar"
                  placeholder="Detailed description of the incident, involved parties, evidence, etc."
                />
              </div>

              <div className="bg-blue-500/10 border border-blue-400/30 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <FiEye className="text-blue-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-300 mb-1">Additional Evidence Options</h4>
                    <div className="flex gap-4 text-sm">
                      <button className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                        <FiCamera /> Add Photos
                      </button>
                      <button className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                        <FiMic /> Voice Recording
                      </button>
                      <button className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                        <FiMapPin /> GPS Location
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={createFir}
                  disabled={!newFir.title || !newFir.description}
                  className="btn-premium bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <FiZap className="text-lg" />
                  Create FIR Report
                </button>
                <button 
                  onClick={() => setShowFirModal(false)}
                  className="btn-glass px-8"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Footer */}
      <footer className="relative z-10 w-full px-2 sm:px-4 lg:px-6 py-8 mt-12">
        <div className="premium-glass-enhanced backdrop-blur-xl border border-white/30 rounded-3xl p-8 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* System Status */}
            <div className="space-y-3">
              <h4 className="text-lg font-bold premium-text-bold flex items-center gap-2">
                <FiActivity className="text-green-400" />
                System Status
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70">Command Center</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 font-medium">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70">GPS Tracking</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 font-medium">{liveTracking ? 'Active' : 'Standby'}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70">Alert System</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 font-medium">Operational</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70">Database</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 font-medium">Connected</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-3">
              <h4 className="text-lg font-bold premium-text-bold flex items-center gap-2">
                <FiShield className="text-blue-400" />
                Today's Summary
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70">Alerts Resolved</span>
                  <span className="text-blue-400 font-bold">{realTimeStats.resolvedToday}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70">Active Patrols</span>
                  <span className="text-blue-400 font-bold">{realTimeStats.patrolUnits}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70">Response Time</span>
                  <span className="text-blue-400 font-bold">{realTimeStats.responseTime}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70">Safety Score</span>
                  <span className="text-blue-400 font-bold">{realTimeStats.safetyScore}%</span>
                </div>
              </div>
            </div>

            {/* Support & Resources */}
            <div className="space-y-3">
              <h4 className="text-lg font-bold premium-text-bold flex items-center gap-2">
                <FiPhone className="text-purple-400" />
                Support Center
              </h4>
              <div className="space-y-2">
                <button className="w-full text-left p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-sm text-white/80 hover:text-white">
                  📞 Emergency Dispatch
                </button>
                <button className="w-full text-left p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-sm text-white/80 hover:text-white">
                  🏥 Medical Support
                </button>
                <button className="w-full text-left p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-sm text-white/80 hover:text-white">
                  🚔 Backup Units
                </button>
                <button className="w-full text-left p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-sm text-white/80 hover:text-white">
                  📋 Incident Reports
                </button>
              </div>
            </div>

            {/* System Information */}
            <div className="space-y-3">
              <h4 className="text-lg font-bold premium-text-bold flex items-center gap-2">
                <FiZap className="text-yellow-400" />
                System Info
              </h4>
              <div className="space-y-2 text-sm">
                <div className="text-white/70">
                  <div className="font-medium text-yellow-400">Trāṇa Tourist Safety</div>
                  <div>Police Command Dashboard</div>
                </div>
                <div className="text-white/50 text-xs">
                  <div>Version 2.1.0 • Build 2025.1</div>
                  <div>Last Updated: {new Date().toLocaleDateString()}</div>
                </div>
                <div className="text-white/50 text-xs">
                  <div>Server: {process.env.NODE_ENV === 'development' ? 'Development' : 'Production'}</div>
                  <div>Uptime: 99.8%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Bottom Bar */}
          <div className="border-t border-white/20 mt-6 pt-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-sm text-white/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-sapphire to-purple-500 flex items-center justify-center">
                  <FiShield className="text-white text-sm" />
                </div>
                <span className="font-medium">Karnataka Police • Tourist Safety Division</span>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-white/60">
              <div className="flex items-center gap-1">
                <FiClock className="text-xs" />
                <span>Last Sync: {new Date().toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>All Systems Operational</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PoliceDashboard;