import React, { useState, useEffect } from 'react';
import { FiBarChart3, FiTrendingUp, FiUsers, FiMapPin, FiAlertTriangle, FiShield, FiClock, FiActivity } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const AnalyticsDashboard = () => {
  const { t } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState('24h');
  const [activeCard, setActiveCard] = useState(null);
  const [chartData, setChartData] = useState([]);

  // Mock analytics data
  const stats = {
    totalTourists: 2847,
    activeAlerts: 3,
    safeZoneOccupancy: 87,
    riskLevel: 'Low',
    responseTime: '2.3 min',
    incidentsPrevented: 12
  };

  const safetyTrends = [
    { time: '00:00', incidents: 1, tourists: 450, riskLevel: 20 },
    { time: '04:00', incidents: 0, tourists: 280, riskLevel: 15 },
    { time: '08:00', incidents: 2, tourists: 890, riskLevel: 35 },
    { time: '12:00', incidents: 4, tourists: 1200, riskLevel: 45 },
    { time: '16:00', incidents: 3, tourists: 1450, riskLevel: 40 },
    { time: '20:00', incidents: 5, tourists: 1680, riskLevel: 55 },
    { time: '24:00', incidents: 2, tourists: 1200, riskLevel: 30 }
  ];

  const hotspots = [
    { name: 'Times Square', risk: 'High', tourists: 456, incidents: 8, coordinates: [40.7580, -73.9855] },
    { name: 'Central Park', risk: 'Low', tourists: 324, incidents: 1, coordinates: [40.7812, -73.9665] },
    { name: 'Brooklyn Bridge', risk: 'Medium', tourists: 234, incidents: 3, coordinates: [40.7061, -73.9969] },
    { name: 'Statue of Liberty', risk: 'Low', tourists: 189, incidents: 0, coordinates: [40.6892, -74.0445] }
  ];

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setChartData(prev => {
        const newData = [...prev];
        if (newData.length > 20) {
          newData.shift();
        }
        newData.push({
          time: new Date().toLocaleTimeString(),
          value: Math.random() * 100,
          incidents: Math.floor(Math.random() * 5)
        });
        return newData;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, trend, subtitle }) => (
    <div 
      className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 cursor-pointer transform hover:scale-105 ${
        activeCard === title ? 'ring-2 ring-purple-400' : ''
      }`}
      onClick={() => setActiveCard(activeCard === title ? null : title)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color} shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 text-sm ${
            trend > 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            <FiTrendingUp className={`w-4 h-4 ${trend < 0 ? 'rotate-180' : ''}`} />
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <h3 className="text-gray-400 text-sm mb-2">{title}</h3>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      {subtitle && <p className="text-gray-300 text-xs">{subtitle}</p>}
    </div>
  );

  const LineChart = ({ data, height = 200 }) => {
    const maxValue = Math.max(...data.map(d => d.value || d.incidents || d.tourists));
    
    return (
      <div className="relative" style={{ height }}>
        <svg className="w-full h-full">
          {/* Grid lines */}
          {[...Array(5)].map((_, i) => (
            <line
              key={i}
              x1="0"
              y1={`${(i / 4) * 100}%`}
              x2="100%"
              y2={`${(i / 4) * 100}%`}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />
          ))}
          
          {/* Data line */}
          <polyline
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={data.map((point, index) => 
              `${(index / (data.length - 1)) * 100},${100 - (point.value || point.incidents || point.tourists) / maxValue * 100}`
            ).join(' ')}
          />
          
          {/* Data points */}
          {data.map((point, index) => (
            <circle
              key={index}
              cx={`${(index / (data.length - 1)) * 100}%`}
              cy={`${100 - (point.value || point.incidents || point.tourists) / maxValue * 100}%`}
              r="4"
              fill="#8B5CF6"
              className="drop-shadow-lg"
            />
          ))}
          
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="50%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  };

  const HeatMap = ({ data }) => (
    <div className="grid grid-cols-8 gap-1">
      {[...Array(64)].map((_, index) => {
        const intensity = Math.random();
        return (
          <div
            key={index}
            className="aspect-square rounded-sm"
            style={{
              backgroundColor: `rgba(139, 92, 246, ${intensity})`,
              boxShadow: intensity > 0.7 ? '0 0 10px rgba(139, 92, 246, 0.5)' : 'none'
            }}
          />
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/30 via-blue-900/20 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {t('Analytics Dashboard')}
            </h1>
            <p className="text-gray-300">
              {t('Real-time monitoring and safety analytics')}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-gray-800/50 border border-gray-600/50 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="1h">{t('Last Hour')}</option>
              <option value="24h">{t('Last 24 Hours')}</option>
              <option value="7d">{t('Last Week')}</option>
              <option value="30d">{t('Last Month')}</option>
            </select>
            
            <div className="flex items-center space-x-2 bg-green-500/20 text-green-400 px-3 py-2 rounded-xl">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">{t('Live')}</span>
            </div>
          </div>
        </div>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <StatCard
            title={t('Total Tourists')}
            value={stats.totalTourists.toLocaleString()}
            icon={FiUsers}
            color="bg-gradient-to-br from-blue-500 to-blue-700"
            trend={12}
            subtitle={t('Currently active')}
          />
          <StatCard
            title={t('Active Alerts')}
            value={stats.activeAlerts}
            icon={FiAlertTriangle}
            color="bg-gradient-to-br from-red-500 to-red-700"
            trend={-25}
            subtitle={t('Requiring attention')}
          />
          <StatCard
            title={t('Safe Zone Occupancy')}
            value={`${stats.safeZoneOccupancy}%`}
            icon={FiShield}
            color="bg-gradient-to-br from-green-500 to-green-700"
            trend={8}
            subtitle={t('Of total capacity')}
          />
          <StatCard
            title={t('Risk Level')}
            value={stats.riskLevel}
            icon={FiBarChart3}
            color="bg-gradient-to-br from-yellow-500 to-yellow-700"
            subtitle={t('Current assessment')}
          />
          <StatCard
            title={t('Avg Response Time')}
            value={stats.responseTime}
            icon={FiClock}
            color="bg-gradient-to-br from-purple-500 to-purple-700"
            trend={-15}
            subtitle={t('Emergency response')}
          />
          <StatCard
            title={t('Incidents Prevented')}
            value={stats.incidentsPrevented}
            icon={FiActivity}
            color="bg-gradient-to-br from-cyan-500 to-cyan-700"
            trend={33}
            subtitle={t('This period')}
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Safety Trends Chart */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-3">
              <FiTrendingUp className="w-6 h-6 text-purple-400" />
              <span>{t('Safety Trends')}</span>
            </h2>
            
            <div className="mb-4">
              <div className="flex space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-300">{t('Risk Level')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                  <span className="text-gray-300">{t('Incidents')}</span>
                </div>
              </div>
            </div>
            
            <LineChart data={safetyTrends} />
            
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              {safetyTrends.map((point, index) => (
                <span key={index}>{point.time}</span>
              ))}
            </div>
          </div>

          {/* Risk Heat Map */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-3">
              <FiMapPin className="w-6 h-6 text-cyan-400" />
              <span>{t('Risk Heat Map')}</span>
            </h2>
            
            <HeatMap data={[]} />
            
            <div className="flex justify-between items-center mt-4">
              <span className="text-gray-400 text-sm">{t('Risk Distribution')}</span>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-400">{t('Low')}</span>
                <div className="w-20 h-2 bg-gradient-to-r from-purple-200 to-purple-600 rounded-full"></div>
                <span className="text-xs text-gray-400">{t('High')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hotspots and Real-time Activity */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Hotspots */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-3">
                <FiMapPin className="w-6 h-6 text-red-400" />
                <span>{t('High Activity Zones')}</span>
              </h2>
              
              <div className="space-y-4">
                {hotspots.map((spot, index) => (
                  <div
                    key={index}
                    className="bg-gray-800/50 border border-gray-600/30 rounded-xl p-4 hover:bg-gray-700/50 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          spot.risk === 'High' ? 'bg-red-500' :
                          spot.risk === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                        } animate-pulse`}></div>
                        <h3 className="font-medium text-white">{spot.name}</h3>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        spot.risk === 'High' ? 'bg-red-500/20 text-red-400' :
                        spot.risk === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'
                      }`}>
                        {spot.risk}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">{t('Tourists')}</span>
                        <p className="text-white font-medium">{spot.tourists}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">{t('Incidents')}</span>
                        <p className="text-white font-medium">{spot.incidents}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">{t('Status')}</span>
                        <p className={`font-medium ${
                          spot.risk === 'High' ? 'text-red-400' :
                          spot.risk === 'Medium' ? 'text-yellow-400' : 'text-green-400'
                        }`}>
                          {spot.risk === 'High' ? t('Monitoring') :
                           spot.risk === 'Medium' ? t('Watching') : t('Normal')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Real-time Activity Feed */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-3">
              <FiActivity className="w-6 h-6 text-green-400" />
              <span>{t('Live Activity')}</span>
            </h2>
            
            <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
              {[
                { time: '2 min ago', event: 'Tourist checked into safe zone', type: 'safe' },
                { time: '5 min ago', event: 'Alert resolved in Times Square', type: 'resolved' },
                { time: '8 min ago', event: 'New tourist registered', type: 'info' },
                { time: '12 min ago', event: 'Emergency contact activated', type: 'alert' },
                { time: '15 min ago', event: 'Safe zone capacity at 90%', type: 'warning' },
                { time: '18 min ago', event: 'Tourist left monitored area', type: 'info' }
              ].map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'safe' ? 'bg-green-400' :
                    activity.type === 'resolved' ? 'bg-blue-400' :
                    activity.type === 'alert' ? 'bg-red-400' :
                    activity.type === 'warning' ? 'bg-yellow-400' : 'bg-gray-400'
                  } animate-pulse`}></div>
                  <div className="flex-1">
                    <p className="text-white text-sm">{activity.event}</p>
                    <p className="text-gray-400 text-xs">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
};

export default AnalyticsDashboard;