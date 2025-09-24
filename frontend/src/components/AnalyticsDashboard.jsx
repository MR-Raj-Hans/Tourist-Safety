import React, { useState, useEffect } from 'react';
import { FiBarChart2, FiTrendingUp, FiMapPin, FiShield, FiAlertTriangle, FiUsers, FiClock, FiFilter, FiDownload, FiRefreshCw, FiEye, FiActivity } from 'react-icons/fi';
import Navbar from './Navbar';

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('safety');
  const [isLoading, setIsLoading] = useState(false);
  const [heatMapData, setHeatMapData] = useState([]);
  const [chartData, setChartData] = useState([]);

  // Animation and data simulation
  useEffect(() => {
    // Generate mock data
    generateMockData();
  }, [timeRange]);

  const generateMockData = () => {
    setIsLoading(true);
    
    // Mock chart data
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const mockChart = days.map((day, index) => ({
      day,
      safety: Math.floor(Math.random() * 40) + 60,
      incidents: Math.floor(Math.random() * 15) + 5,
      tourists: Math.floor(Math.random() * 200) + 100,
      response: Math.floor(Math.random() * 30) + 70
    }));
    
    // Mock heat map data
    const mockHeatMap = Array.from({ length: 12 }, (_, i) => 
      Array.from({ length: 8 }, (_, j) => ({
        x: j,
        y: i,
        value: Math.floor(Math.random() * 100),
        risk: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low'
      }))
    ).flat();
    
    setTimeout(() => {
      setChartData(mockChart);
      setHeatMapData(mockHeatMap);
      setIsLoading(false);
    }, 1000);
  };

  const metrics = [
    { 
      id: 'safety', 
      name: 'Safety Score', 
      value: '87%', 
      change: '+3.2%', 
      trend: 'up', 
      color: 'from-purple-500 to-purple-600',
      icon: FiShield,
      description: 'Overall tourist safety rating'
    },
    { 
      id: 'incidents', 
      name: 'Active Incidents', 
      value: '12', 
      change: '-2', 
      trend: 'down', 
      color: 'from-blue-500 to-blue-600',
      icon: FiAlertTriangle,
      description: 'Current safety incidents'
    },
    { 
      id: 'tourists', 
      name: 'Tourist Count', 
      value: '1,247', 
      change: '+156', 
      trend: 'up', 
      color: 'from-indigo-500 to-indigo-600',
      icon: FiUsers,
      description: 'Active tourists being monitored'
    },
    { 
      id: 'response', 
      name: 'Response Time', 
      value: '2.3min', 
      change: '-0.4min', 
      trend: 'down', 
      color: 'from-violet-500 to-violet-600',
      icon: FiClock,
      description: 'Average emergency response time'
    }
  ];

  const getGridColor = (risk, value) => {
    const opacity = Math.max(0.1, value / 100);
    if (risk === 'high') return `rgba(239, 68, 68, ${opacity})`;
    if (risk === 'medium') return `rgba(245, 158, 11, ${opacity})`;
    return `rgba(34, 197, 94, ${opacity})`;
  };

  const LineChart = ({ data }) => {
    if (!data.length) return <div className="animate-pulse bg-purple-100 h-48 rounded-lg"></div>;
    
    const maxValue = Math.max(...data.map(d => d[selectedMetric] || 0));
    const points = data.map((item, index) => {
      const x = (index / (data.length - 1)) * 300;
      const y = 150 - ((item[selectedMetric] || 0) / maxValue) * 120;
      return `${x},${y}`;
    }).join(' ');
    
    return (
      <div className="relative h-48">
        <svg className="w-full h-full" viewBox="0 0 320 160">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <line
              key={i}
              x1="10"
              y1={30 + i * 30}
              x2="310"
              y2={30 + i * 30}
              stroke="rgb(196, 181, 253)"
              strokeWidth="0.5"
              opacity="0.3"
            />
          ))}
          
          {/* Gradient fill */}
          <defs>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="rgb(139, 92, 246)" stopOpacity="0.05"/>
            </linearGradient>
          </defs>
          
          {/* Area fill */}
          <polygon
            points={`10,150 ${points} 310,150`}
            fill="url(#chartGradient)"
          />
          
          {/* Line */}
          <polyline
            points={points}
            fill="none"
            stroke="rgb(139, 92, 246)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Data points */}
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 300;
            const y = 150 - ((item[selectedMetric] || 0) / maxValue) * 120;
            return (
              <circle
                key={index}
                cx={x + 10}
                cy={y}
                r="4"
                fill="rgb(139, 92, 246)"
                className="hover:r-6 transition-all duration-200"
              />
            );
          })}
        </svg>
        
        {/* Labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 text-xs text-purple-600">
          {data.map((item, index) => (
            <span key={index}>{item.day}</span>
          ))}
        </div>
      </div>
    );
  };

  const HeatMap = ({ data }) => {
    if (!data.length) return <div className="animate-pulse bg-blue-100 h-64 rounded-lg"></div>;
    
    return (
      <div className="grid grid-cols-8 gap-1 h-64">
        {data.map((cell, index) => (
          <div
            key={index}
            className="rounded transition-all duration-300 hover:scale-110 cursor-pointer relative group"
            style={{
              backgroundColor: getGridColor(cell.risk, cell.value),
              minHeight: '20px'
            }}
          >
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
              Risk: {cell.risk} ({cell.value}%)
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Navbar />
      
      <div className="relative z-10">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                <FiBarChart2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                  Analytics Dashboard
                </h1>
                <p className="text-gray-300 text-sm sm:text-base">Real-time safety insights and trends</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Time Range Selector */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="premium-btn-secondary px-4 py-2 rounded-xl font-medium"
              >
                <option value="24h" className="bg-gray-800 text-white">Last 24 Hours</option>
                <option value="7d" className="bg-gray-800 text-white">Last 7 Days</option>
                <option value="30d" className="bg-gray-800 text-white">Last 30 Days</option>
                <option value="90d" className="bg-gray-800 text-white">Last 90 Days</option>
              </select>
              
              <button
                onClick={generateMockData}
                className="premium-btn-primary flex items-center space-x-2"
              >
                <FiRefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>रिफ्रेश (Refresh)</span>
              </button>
              
              <button className="premium-btn-secondary flex items-center space-x-2">
                <FiDownload className="w-4 h-4" />
                <span>निर्यात (Export)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8 px-2 sm:px-0">
          {metrics.map((metric) => {
            const IconComponent = metric.icon;
            return (
              <div
                key={metric.id}
                className="glass-card p-6 hover:glow-sapphire transition-all duration-300 cursor-pointer group"
                onClick={() => setSelectedMetric(metric.id)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${metric.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                    <IconComponent className="w-6 h-6 text-white drop-shadow-sm" />
                  </div>
                  <div className={`flex items-center space-x-1 ${
                    metric.trend === 'up' ? 'text-green-300' : 'text-red-300'
                  }`}>
                    <FiTrendingUp className={`w-4 h-4 ${metric.trend === 'down' ? 'rotate-180' : ''}`} />
                    <span className="text-sm font-medium">{metric.change}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white drop-shadow-sm">{metric.value}</h3>
                  <p className="text-sm font-medium text-white/90">{metric.name}</p>
                  <p className="text-xs text-white/70">{metric.description}</p>
                </div>
                
                {selectedMetric === metric.id && (
                  <div className="mt-4 h-1 bg-gradient-to-r from-white/60 to-white/30 rounded-full"></div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Charts Section */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          
          {/* Trend Chart */}
          <div className="lg:col-span-2 glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center drop-shadow-sm">
                  <FiActivity className="w-5 h-5 text-white/90 mr-2" />
                  Safety Trends
                </h3>
                <p className="text-white/80 text-sm">
                  {metrics.find(m => m.id === selectedMetric)?.name} over time
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <FiFilter className="w-4 h-4 text-white/70" />
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  className="text-sm border border-white/30 rounded-lg px-3 py-1 bg-white/10 backdrop-blur-sm focus:ring-2 focus:ring-white/50 text-white"
                >
                  {metrics.map(metric => (
                    <option key={metric.id} value={metric.id} className="bg-gray-800 text-white">
                      {metric.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {isLoading ? (
              <div className="h-48 bg-gradient-to-r from-white/10 to-white/5 rounded-lg animate-pulse flex items-center justify-center">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
                  <span className="text-white">Loading chart data...</span>
                </div>
              </div>
            ) : (
              <LineChart data={chartData} />
            )}
          </div>
          
          {/* Real-time Stats */}
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center glow-text-sapphire">
              <FiEye className="w-5 h-5 text-sapphire-300 mr-2" />
              लाइव मॉनिटर (Live Monitor)
            </h3>
            
            <div className="space-y-6">
              {/* Real-time counters */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Active Alerts</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                    <span className="text-lg font-bold text-red-300">3</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Safe Zones</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-lg font-bold text-green-300">18</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Response Teams</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-lg font-bold text-blue-300">7</span>
                  </div>
                </div>
              </div>
              
              {/* Activity Feed */}
              <div className="border-t border-white/20 pt-4">
                <h4 className="font-semibold text-white/90 mb-3">Recent Activity</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-1.5"></div>
                    <div>
                      <p className="text-white/90">Tourist check-in at Zone A</p>
                      <p className="text-white/60 text-xs">2 minutes ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-1.5"></div>
                    <div>
                      <p className="text-white/90">Weather alert issued</p>
                      <p className="text-white/60 text-xs">5 minutes ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5"></div>
                    <div>
                      <p className="text-white/90">Emergency response resolved</p>
                      <p className="text-white/60 text-xs">12 minutes ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Heat Map and Location Analytics */}
        <div className="grid lg:grid-cols-2 gap-6">
          
          {/* Risk Heat Map */}
          <div className="bg-white/15 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center drop-shadow-sm">
                  <FiMapPin className="w-5 h-5 text-white/90 mr-2" />
                  Risk Heat Map
                </h3>
                <p className="text-white/80 text-sm">Geographic risk distribution</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded"></div>
                  <span className="text-xs text-white/80">High</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                  <span className="text-xs text-white/80">Medium</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded"></div>
                  <span className="text-xs text-white/80">Low</span>
                </div>
              </div>
            </div>
            
            {isLoading ? (
              <div className="h-64 bg-gradient-to-r from-white/10 to-white/5 rounded-lg animate-pulse"></div>
            ) : (
              <HeatMap data={heatMapData} />
            )}
          </div>
          
          {/* Location Insights */}
          <div className="bg-white/15 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center drop-shadow-sm">
              <FiMapPin className="w-5 h-5 text-white/90 mr-2" />
              Location Insights
            </h3>
            
            <div className="space-y-6">
              {/* Top Locations */}
              <div>
                <h4 className="font-semibold text-white/90 mb-3">Highest Traffic Areas</h4>
                <div className="space-y-3">
                  {[
                    { name: 'Bengaluru Palace', count: 245, safety: 92 },
                    { name: 'Mysore Palace', count: 189, safety: 88 },
                    { name: 'Hampi Heritage Site', count: 156, safety: 95 },
                    { name: 'Coorg Hill Station', count: 134, safety: 85 }
                  ].map((location, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10">
                      <div>
                        <p className="font-medium text-white">{location.name}</p>
                        <p className="text-sm text-white/70">{location.count} tourists</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-white">{location.safety}%</p>
                        <p className="text-xs text-white/60">Safety Score</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="border-t border-white/20 pt-4">
                <h4 className="font-semibold text-white/90 mb-3">Coverage Statistics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10">
                    <p className="text-2xl font-bold text-white">98.5%</p>
                    <p className="text-xs text-white/70">Area Coverage</p>
                  </div>
                  <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10">
                    <p className="text-2xl font-bold text-white">24/7</p>
                    <p className="text-xs text-white/70">Monitoring</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;