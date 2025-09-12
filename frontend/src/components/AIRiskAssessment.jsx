import React, { useState, useEffect } from 'react';
import { FiCpu, FiTrendingUp, FiTrendingDown, FiShield, FiAlertTriangle, FiActivity, FiZap, FiTarget, FiEye, FiDatabase, FiWifi } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const AIRiskAssessment = () => {
  const { t } = useTranslation();
  const [riskLevel, setRiskLevel] = useState(2); // 0: Low, 1: Medium, 2: High
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [predictionAccuracy, setPredictionAccuracy] = useState(94.7);
  const [brainActivity, setBrainActivity] = useState(0);
  const [dataPoints, setDataPoints] = useState(0);
  const [scanningProgress, setScanningProgress] = useState(0);

  // Enhanced risk factors with real-time updates
  const [riskFactors, setRiskFactors] = useState([
    { name: 'Location Risk', value: 75, trend: 'up', color: 'text-red-400', impact: 'High' },
    { name: 'Crowd Density', value: 45, trend: 'down', color: 'text-yellow-400', impact: 'Medium' },
    { name: 'Time of Day', value: 30, trend: 'stable', color: 'text-green-400', impact: 'Low' },
    { name: 'Weather Conditions', value: 15, trend: 'down', color: 'text-blue-400', impact: 'Low' },
    { name: 'Historical Incidents', value: 60, trend: 'up', color: 'text-purple-400', impact: 'Medium' },
    { name: 'Social Behavior', value: 25, trend: 'stable', color: 'text-cyan-400', impact: 'Low' }
  ]);

  // AI Predictions with enhanced data
  const predictions = [
    { type: 'Theft Risk', probability: 23, confidence: 89, timeframe: '2-4 hours' },
    { type: 'Medical Emergency', probability: 8, confidence: 95, timeframe: '24 hours' },
    { type: 'Traffic Incident', probability: 34, confidence: 76, timeframe: '1-2 hours' },
    { type: 'Weather Hazard', probability: 12, confidence: 92, timeframe: '6-8 hours' }
  ];

  // Neural network simulation
  useEffect(() => {
    const brainInterval = setInterval(() => {
      setBrainActivity(prev => (prev + 1) % 360);
      setDataPoints(prev => prev + Math.floor(Math.random() * 10) + 1);
    }, 100);

    return () => clearInterval(brainInterval);
  }, []);

  // Risk analysis simulation
  useEffect(() => {
    const analysisInterval = setInterval(() => {
      if (isAnalyzing) {
        setScanningProgress(prev => {
          if (prev >= 100) {
            setIsAnalyzing(false);
            return 0;
          }
          return prev + 2;
        });
      }
    }, 100);

    return () => clearInterval(analysisInterval);
  }, [isAnalyzing]);

  // Dynamic risk factor updates
  useEffect(() => {
    const updateInterval = setInterval(() => {
      setRiskFactors(prev => prev.map(factor => ({
        ...factor,
        value: Math.max(0, Math.min(100, factor.value + (Math.random() - 0.5) * 5))
      })));
    }, 3000);

    return () => clearInterval(updateInterval);
  }, []);

  const startAnalysis = () => {
    setIsAnalyzing(true);
    setScanningProgress(0);
  };

  const getRiskLevelColor = () => {
    switch (riskLevel) {
      case 0: return 'text-green-400';
      case 1: return 'text-yellow-400';
      case 2: return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getRiskLevelText = () => {
    switch (riskLevel) {
      case 0: return 'LOW RISK';
      case 1: return 'MEDIUM RISK';
      case 2: return 'HIGH RISK';
      default: return 'UNKNOWN';
    }
  };

  const getRiskGaugeColor = (value) => {
    if (value <= 30) return 'from-green-500 to-emerald-400';
    if (value <= 60) return 'from-yellow-500 to-orange-400';
    return 'from-red-500 to-pink-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/30 to-black">
      {/* Cyberpunk Header */}
      <div className="bg-black/80 backdrop-blur-xl border-b border-purple-500/30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left: AI Status */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <FiCpu className="w-8 h-8 text-purple-400" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">AI RISK ASSESSMENT</h1>
                  <p className="text-purple-400 text-sm">Neural Network v3.2.1</p>
                </div>
              </div>
              
              <div className="h-8 w-px bg-purple-500/50"></div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <FiDatabase className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-400 text-sm font-mono">{dataPoints.toLocaleString()}</span>
                  <span className="text-gray-400 text-xs">data points</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiWifi className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm">{predictionAccuracy}%</span>
                  <span className="text-gray-400 text-xs">accuracy</span>
                </div>
              </div>
            </div>
            
            {/* Right: Status */}
            <div className="flex items-center space-x-4">
              <div className={`px-4 py-2 rounded-xl border font-bold text-sm ${
                riskLevel === 0 ? 'bg-green-500/20 border-green-500/50 text-green-400' :
                riskLevel === 1 ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400' :
                'bg-red-500/20 border-red-500/50 text-red-400'
              }`}>
                {getRiskLevelText()}
              </div>
              
              <div className="text-gray-400 text-sm font-mono">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {/* AI Brain Visualization */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          
          {/* Neural Network Visual */}
          <div className="lg:col-span-1">
            <div className="bg-black/60 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6 h-full">
              <div className="text-center">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-center">
                  <FiCpu className="w-5 h-5 text-purple-400 mr-2" />
                  Neural Network
                </h3>
                
                {/* AI Brain Animation */}
                <div className="relative w-48 h-48 mx-auto mb-6">
                  <svg width="192" height="192" className="absolute inset-0">
                    {/* Brain outline */}
                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      fill="none"
                      stroke="url(#brainGradient)"
                      strokeWidth="2"
                      className="animate-pulse"
                    />
                    
                    {/* Neural connections */}
                    {[...Array(12)].map((_, i) => (
                      <g key={i}>
                        <line
                          x1={96 + 60 * Math.cos(i * 30 * Math.PI / 180)}
                          y1={96 + 60 * Math.sin(i * 30 * Math.PI / 180)}
                          x2={96 + 40 * Math.cos((i * 30 + brainActivity) * Math.PI / 180)}
                          y2={96 + 40 * Math.sin((i * 30 + brainActivity) * Math.PI / 180)}
                          stroke="rgba(168, 85, 247, 0.6)"
                          strokeWidth="1"
                          className="animate-pulse"
                        />
                        <circle
                          cx={96 + 60 * Math.cos(i * 30 * Math.PI / 180)}
                          cy={96 + 60 * Math.sin(i * 30 * Math.PI / 180)}
                          r="3"
                          fill="rgb(168, 85, 247)"
                          className="animate-pulse"
                        />
                      </g>
                    ))}
                    
                    {/* Center node */}
                    <circle
                      cx="96"
                      cy="96"
                      r="8"
                      fill="rgb(168, 85, 247)"
                      className="animate-pulse"
                      style={{
                        filter: `drop-shadow(0 0 ${5 + Math.sin(brainActivity * 0.1) * 3}px rgba(168, 85, 247, 0.8))`
                      }}
                    />
                    
                    <defs>
                      <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="rgb(168, 85, 247)" />
                        <stop offset="100%" stopColor="rgb(59, 130, 246)" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Processing Speed</span>
                    <span className="text-purple-400 font-mono">2.4 THz</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Active Neurons</span>
                    <span className="text-blue-400 font-mono">1,247,932</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Model Confidence</span>
                    <span className="text-green-400 font-mono">{predictionAccuracy}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Risk Gauges */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Main Risk Gauge */}
            <div className="bg-black/60 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                <FiTarget className="w-5 h-5 text-red-400 mr-2" />
                Threat Assessment Matrix
              </h3>
              
              <div className="grid md:grid-cols-3 gap-6">
                {riskFactors.slice(0, 3).map((factor, index) => (
                  <div key={index} className="text-center">
                    <div className="relative w-24 h-24 mx-auto mb-3">
                      <svg width="96" height="96" className="transform -rotate-90">
                        <circle
                          cx="48"
                          cy="48"
                          r="36"
                          fill="none"
                          stroke="rgba(75, 85, 99, 0.3)"
                          strokeWidth="8"
                        />
                        <circle
                          cx="48"
                          cy="48"
                          r="36"
                          fill="none"
                          stroke={`url(#gauge${index})`}
                          strokeWidth="8"
                          strokeDasharray={`${2 * Math.PI * 36}`}
                          strokeDashoffset={`${2 * Math.PI * 36 * (1 - factor.value / 100)}`}
                          className="transition-all duration-1000"
                        />
                        <defs>
                          <linearGradient id={`gauge${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={
                              factor.value <= 30 ? '#10b981' :
                              factor.value <= 60 ? '#f59e0b' : '#ef4444'
                            } />
                            <stop offset="100%" stopColor={
                              factor.value <= 30 ? '#34d399' :
                              factor.value <= 60 ? '#fbbf24' : '#f87171'
                            } />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-bold text-white">{Math.round(factor.value)}%</span>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-white">{factor.name}</p>
                    <p className={`text-xs ${factor.color}`}>{factor.impact} Impact</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Analysis Controls */}
            <div className="bg-black/60 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center">
                  <FiActivity className="w-5 h-5 text-blue-400 mr-2" />
                  Real-time Analysis
                </h3>
                
                <button
                  onClick={startAnalysis}
                  disabled={isAnalyzing}
                  className={`px-6 py-2 rounded-xl font-semibold transition-all duration-300 ${
                    isAnalyzing
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white transform hover:scale-105'
                  }`}
                >
                  {isAnalyzing ? 'Analyzing...' : 'Start Deep Scan'}
                </button>
              </div>
              
              {isAnalyzing && (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Scanning progress</span>
                    <span className="text-purple-400">{scanningProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${scanningProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Risk Factors Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          
          {/* Risk Factors */}
          <div className="bg-black/60 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center">
              <FiZap className="w-5 h-5 text-yellow-400 mr-2" />
              Risk Factor Analysis
            </h3>
            
            <div className="space-y-4">
              {riskFactors.map((factor, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">{factor.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm ${factor.color}`}>{Math.round(factor.value)}%</span>
                      {factor.trend === 'up' && <FiTrendingUp className="w-4 h-4 text-red-400" />}
                      {factor.trend === 'down' && <FiTrendingDown className="w-4 h-4 text-green-400" />}
                      {factor.trend === 'stable' && <div className="w-4 h-1 bg-gray-400 rounded"></div>}
                    </div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`bg-gradient-to-r ${getRiskGaugeColor(factor.value)} h-2 rounded-full transition-all duration-1000`}
                      style={{ width: `${factor.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* AI Predictions */}
          <div className="bg-black/60 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center">
              <FiEye className="w-5 h-5 text-cyan-400 mr-2" />
              Predictive Analytics
            </h3>
            
            <div className="space-y-4">
              {predictions.map((prediction, index) => (
                <div key={index} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{prediction.type}</span>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      prediction.probability <= 20 ? 'bg-green-500/20 text-green-400' :
                      prediction.probability <= 50 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {prediction.probability}% risk
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Confidence: </span>
                      <span className="text-blue-400">{prediction.confidence}%</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Timeframe: </span>
                      <span className="text-purple-400">{prediction.timeframe}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Alert System */}
        <div className="bg-gradient-to-r from-red-900/20 to-purple-900/20 rounded-2xl border border-red-500/30 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FiShield className="w-6 h-6 text-red-400" />
              <div>
                <h3 className="text-lg font-bold text-white">Threat Detection System</h3>
                <p className="text-red-400 text-sm">Active monitoring • Real-time alerts</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-xs text-gray-400">Last scan:</div>
                <div className="text-sm text-white">2 minutes ago</div>
              </div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          <div className="mt-4 grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-black/40 rounded-lg p-3">
              <div className="text-gray-400">Threats Detected</div>
              <div className="text-xl font-bold text-red-400">3</div>
            </div>
            <div className="bg-black/40 rounded-lg p-3">
              <div className="text-gray-400">Alerts Sent</div>
              <div className="text-xl font-bold text-yellow-400">7</div>
            </div>
            <div className="bg-black/40 rounded-lg p-3">
              <div className="text-gray-400">Prevention Rate</div>
              <div className="text-xl font-bold text-green-400">94.2%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIRiskAssessment;