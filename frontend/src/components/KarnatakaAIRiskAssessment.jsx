import React, { useState, useEffect, useCallback } from 'react';
import { 
  FiMapPin, FiShield, FiAlertTriangle, FiThermometer, FiNavigation, 
  FiRefreshCw, FiClock, FiInfo, FiBook, FiPhone, FiGlobe
} from 'react-icons/fi';
import axios from 'axios';

const KarnatakaAIRiskAssessment = ({ currentPosition, location = 'Bangalore, Karnataka' }) => {
  // State management
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedTab, setSelectedTab] = useState('overview');

  // Fetch Karnataka AI risk assessment
  const fetchKarnatakaRiskAssessment = useCallback(async () => {
    if (!currentPosition.lat || !currentPosition.lng) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/api/karnataka/ai-risk-assessment', {
        lat: currentPosition.lat,
        lng: currentPosition.lng,
        location: location,
        userProfile: {
          type: 'tourist',
          language: 'english',
          interests: ['culture', 'heritage', 'nature']
        },
        travelPlan: {
          duration: 'day_trip',
          groupSize: 1,
          budget: 'medium'
        }
      });

      setRiskData(response.data);
      setLastUpdated(new Date());
      
    } catch (err) {
      console.error('Error fetching Karnataka risk assessment:', err);
      setError('Failed to fetch Karnataka-specific risk assessment');
      // Set fallback data
      setRiskData(getFallbackKarnatakaData());
    } finally {
      setLoading(false);
    }
  }, [currentPosition.lat, currentPosition.lng, location, getFallbackKarnatakaData]);

  // Fetch data on component mount and position change
  useEffect(() => {
    fetchKarnatakaRiskAssessment();
  }, [fetchKarnatakaRiskAssessment]);

  // Auto-refresh every 10 minutes
  useEffect(() => {
    const interval = setInterval(fetchKarnatakaRiskAssessment, 600000);
    return () => clearInterval(interval);
  }, [fetchKarnatakaRiskAssessment]);

  // Get risk level color
  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'very low': return 'text-green-600 bg-green-50';
      case 'low': return 'text-green-500 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'very high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Get fallback data for offline/error scenarios
  const getFallbackKarnatakaData = () => ({
    location: {
      name: location,
      coordinates: currentPosition,
      state: 'Karnataka',
      district: 'Bangalore Urban'
    },
    riskAssessment: {
      overallScore: 35,
      riskLevel: 'Low',
      factors: ['Good weather conditions'],
      recommendations: ['Enjoy your visit to Karnataka', 'Keep emergency contacts handy']
    },
    detailedAnalysis: {
      weather: {
        temperature: 26,
        humidity: 65,
        condition: 'Pleasant',
        riskScore: 20
      },
      traffic: {
        congestionLevel: 'moderate',
        riskScore: 40
      },
      safety: {
        recentIncidents: [],
        riskScore: 25
      },
      tourism: {
        riskScore: 30
      }
    },
    aiInsights: [
      {
        type: 'local_tip',
        priority: 'low',
        message: 'Karnataka is known for its rich cultural heritage.',
        recommendation: 'Explore the local attractions'
      }
    ],
    alerts: [],
    localInfo: {
      emergency: {
        police: '100',
        ambulance: '108',
        touristHelpline: '1363'
      }
    }
  });

  if (loading && !riskData) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center space-x-3">
          <FiRefreshCw className="w-5 h-5 animate-spin text-purple-600" />
          <span className="text-gray-600">Loading Karnataka AI Risk Assessment...</span>
        </div>
      </div>
    );
  }

  if (error && !riskData) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 text-red-600">
          <FiAlertTriangle className="w-5 h-5" />
          <span>{error}</span>
        </div>
        <button 
          onClick={fetchKarnatakaRiskAssessment}
          className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const data = riskData || getFallbackKarnatakaData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center space-x-2">
              <FiMapPin className="w-6 h-6" />
              <span>Karnataka AI Risk Assessment</span>
            </h2>
            <p className="text-purple-100 mt-1">
              {data.location.name} • {data.location.district}
            </p>
          </div>
          <button
            onClick={fetchKarnatakaRiskAssessment}
            disabled={loading}
            className="p-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
          >
            <FiRefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Risk Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Overall Risk Assessment</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(data.riskAssessment.riskLevel)}`}>
                {data.riskAssessment.riskLevel}
              </span>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="52"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="52"
                    stroke="#8b5cf6"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={326.73}
                    strokeDashoffset={326.73 - (326.73 * data.riskAssessment.overallScore) / 100}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-gray-800">
                    {data.riskAssessment.overallScore}
                  </span>
                </div>
              </div>
              
              <div className="flex-1">
                <h4 className="text-lg font-medium text-gray-800 mb-2">Risk Factors</h4>
                <div className="space-y-2">
                  {data.riskAssessment.factors.length > 0 ? (
                    data.riskAssessment.factors.map((factor, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <FiAlertTriangle className="w-4 h-4 text-orange-500" />
                        <span className="text-sm text-gray-600">{factor}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center space-x-2">
                      <FiShield className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-600">No significant risk factors identified</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center space-x-3">
              <FiThermometer className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Weather</p>
                <p className="text-lg font-semibold">{data.detailedAnalysis.weather.temperature}°C</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center space-x-3">
              <FiNavigation className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Traffic</p>
                <p className="text-lg font-semibold capitalize">{data.detailedAnalysis.traffic.congestionLevel}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center space-x-3">
              <FiShield className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Safety</p>
                <p className="text-lg font-semibold">
                  {data.detailedAnalysis.safety.riskScore < 30 ? 'Good' : 
                   data.detailedAnalysis.safety.riskScore < 60 ? 'Moderate' : 'Caution'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Overview', icon: FiInfo },
              { id: 'insights', name: 'AI Insights', icon: FiBook },
              { id: 'recommendations', name: 'Recommendations', icon: FiShield },
              { id: 'local', name: 'Local Info', icon: FiGlobe }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {selectedTab === 'overview' && (
            <div className="space-y-6">
              {/* Alerts */}
              {data.alerts && data.alerts.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-red-800 mb-3">Active Alerts</h4>
                  <div className="space-y-2">
                    {data.alerts.map((alert, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <FiAlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-red-800">{alert.message}</p>
                          <p className="text-xs text-red-600">{alert.action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Detailed Analysis Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-3">Weather Analysis</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Temperature:</span>
                      <span className="text-sm font-medium">{data.detailedAnalysis.weather.temperature}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Humidity:</span>
                      <span className="text-sm font-medium">{data.detailedAnalysis.weather.humidity}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Condition:</span>
                      <span className="text-sm font-medium">{data.detailedAnalysis.weather.condition}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Risk Score:</span>
                      <span className="text-sm font-medium">{data.detailedAnalysis.weather.riskScore}/100</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-3">Traffic Analysis</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Congestion:</span>
                      <span className="text-sm font-medium capitalize">{data.detailedAnalysis.traffic.congestionLevel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Risk Score:</span>
                      <span className="text-sm font-medium">{data.detailedAnalysis.traffic.riskScore}/100</span>
                    </div>
                    {data.detailedAnalysis.traffic.karnatakaSpecific && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-600">Karnataka Insights:</p>
                        {data.detailedAnalysis.traffic.karnatakaSpecific.map((insight, idx) => (
                          <p key={idx} className="text-xs text-blue-600 mt-1">• {insight}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'insights' && (
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-800">AI-Generated Insights</h4>
              {data.aiInsights && data.aiInsights.length > 0 ? (
                <div className="space-y-3">
                  {data.aiInsights.map((insight, index) => (
                    <div key={index} className="border-l-4 border-purple-500 bg-purple-50 p-4 rounded-r-lg">
                      <div className="flex items-start space-x-3">
                        <FiInfo className="w-5 h-5 text-purple-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-purple-800 mb-1">{insight.message}</p>
                          <p className="text-xs text-purple-600">{insight.recommendation}</p>
                          <span className={`inline-block mt-2 px-2 py-1 rounded text-xs ${
                            insight.priority === 'high' ? 'bg-red-100 text-red-700' :
                            insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {insight.priority} priority
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No specific insights available at this time.</p>
              )}
            </div>
          )}

          {selectedTab === 'recommendations' && (
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-800">Recommendations</h4>
              <div className="space-y-3">
                {data.riskAssessment.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                    <FiShield className="w-5 h-5 text-green-600 mt-0.5" />
                    <span className="text-sm text-green-800">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'local' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-gray-800 mb-3">Emergency Contacts</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(data.localInfo.emergency).map(([service, number]) => (
                    <div key={service} className="bg-red-50 rounded-lg p-3 text-center">
                      <FiPhone className="w-5 h-5 mx-auto text-red-600 mb-1" />
                      <p className="text-xs text-red-800 capitalize">{service.replace(/([A-Z])/g, ' $1')}</p>
                      <p className="text-sm font-bold text-red-600">{number}</p>
                    </div>
                  ))}
                </div>
              </div>

              {data.localInfo.language && (
                <div>
                  <h4 className="text-lg font-medium text-gray-800 mb-3">Local Language</h4>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-800 mb-2">
                      Primary Language: <span className="font-medium">{data.localInfo.language.primary}</span>
                    </p>
                    {data.localInfo.language.commonPhrases && (
                      <div>
                        <p className="text-xs text-blue-600 mb-2">Common Phrases:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {Object.entries(data.localInfo.language.commonPhrases).map(([english, local]) => (
                            <div key={english} className="text-xs">
                              <span className="text-blue-800">{english}:</span>
                              <span className="font-medium text-blue-600 ml-1">{local}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Last Updated */}
      {lastUpdated && (
        <div className="text-center text-xs text-gray-500">
          <FiClock className="inline w-3 h-3 mr-1" />
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default KarnatakaAIRiskAssessment;