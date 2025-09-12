import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthToken, getUserData, clearAuth, getTourists } from '../services/api';
import { panicAPI } from '../services/api';

const PoliceDashboard = () => {
  const navigate = useNavigate();
  const [tourists, setTourists] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-gray-600">Overview of tourists and active alerts</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => { clearAuth(); navigate('/login-selection'); }} className="text-sm text-gray-600">Logout</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="font-semibold text-lg mb-4">Registered Tourists</h2>
            {loading ? <div>Loading...</div> : (
              <div className="space-y-3">
                {tourists.length === 0 && <div className="text-sm text-gray-500">No tourists found</div>}
                {tourists.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">{t.name || t.email}</div>
                      <div className="text-xs text-gray-500">{t.email} • {t.nationality || '-'}</div>
                    </div>
                    <div className="text-xs text-gray-500">Joined: {new Date(t.created_at).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="font-semibold text-lg mb-4">Active Alerts</h2>
            {loading ? <div>Loading...</div> : (
              <div className="space-y-3">
                {alerts.length === 0 && <div className="text-sm text-gray-500">No active alerts</div>}
                {alerts.map(a => (
                  <div key={a.id} className="p-3 border rounded flex items-start justify-between">
                    <div>
                      <div className="font-medium">{a.alert_type.toUpperCase()} • {a.priority}</div>
                      <div className="text-xs text-gray-600">{a.location} • {a.tourist_name} ({a.tourist_phone})</div>
                      <div className="text-xs text-gray-500 mt-2">{a.description}</div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button onClick={() => resolveAlert(a.id)} className="px-3 py-1 bg-green-600 text-white rounded text-sm">Resolve</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoliceDashboard;