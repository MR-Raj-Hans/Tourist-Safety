import React, { useState, useEffect } from 'react';
import { FiCpu, FiTrendingUp, FiTrendingDown, FiShield, FiAlertTriangle, FiActivity, FiZap, FiTarget } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const AIRiskAssessment = () => {
  const { t } = useTranslation();
  const [riskLevel, setRiskLevel] = useState(2); // 0: Low, 1: Medium, 2: High
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [predictionAccuracy, setPredictionAccuracy] = useState(94.7);
  const [brainActivity, setBrainActivity] = useState(0);

  // Risk factors data
  const riskFactors = [
    { name: 'Location Risk', value: 75, trend: 'up', color: 'text-red-400' },
    { name: 'Crowd Density', value: 45, trend: 'down', color: 'text-yellow-400' },
    { name: 'Time of Day', value: 30, trend: 'stable', color: 'text-green-400' },
    { name: 'Weather Conditions', value: 15, trend: 'down', color: 'text-blue-400' },
    { name: 'Historical Incidents', value: 60, trend: 'up', color: 'text-purple-400' }
  ];

  // AI Predictions
  const predictions = [
    { time: '2:00 PM', risk: 25, label: 'Safe' },
    { time: '4:00 PM', risk: 40, label: 'Moderate' },
    { time: '6:00 PM', risk: 70, label: 'High' },
    { time: '8:00 PM', risk: 85, label: 'Critical' },
    { time: '10:00 PM', risk: 45, label: 'Moderate' }
  ];

  // Simulate brain activity animation
  useEffect(() => {
    const interval = setInterval(() => {
      setBrainActivity(prev => (prev + 1) % 100);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const runAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setRiskLevel(Math.floor(Math.random() * 3));
      setPredictionAccuracy(90 + Math.random() * 8);
    }, 3000);
  };

  const RiskGauge = ({ value, label, color }) => {
    const circumference = 2 * Math.PI * 45;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="rgba(75, 85, 99, 0.3)"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 10px ${color})`
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">{value}%</span>
          <span className="text-xs text-gray-400">{label}</span>
        </div>
      </div>
    );
  };

  const BrainVisualization = () => (
    <div className="relative w-24 h-24 mx-auto mb-4">
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 opacity-20 animate-pulse"></div>
      <div className="absolute inset-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 opacity-40">
        <div className="absolute inset-0 rounded-full border-2 border-purple-400 animate-ping opacity-60"></div>
      </div>
      <div className="absolute inset-4 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 flex items-center justify-center">
        <FiCpu className="w-8 h-8 text-white animate-pulse" />
      </div>
      {/* Neural network connections */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full"
            style={{
              top: `${20 + Math.sin(brainActivity * 0.1 + i) * 30}%`,
              left: `${20 + Math.cos(brainActivity * 0.1 + i) * 30}%`,
              opacity: Math.sin(brainActivity * 0.05 + i) * 0.5 + 0.5
            }}
          ></div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <BrainVisualization />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            {t('AI Risk Assessment System')}
          </h1>
          <p className="text-gray-300">
            {t('Advanced predictive analytics for tourist safety')}
          </p>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Current Risk Level */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6 h-full">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-3">
                <FiShield className="w-6 h-6 text-purple-400" />
                <span>{t('Current Risk Level')}</span>
              </h2>

              <div className="text-center">
                <div className={`relative inline-block mb-4 ${
                  riskLevel === 0 ? 'text-green-400' :
                  riskLevel === 1 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  <RiskGauge 
                    value={riskLevel === 0 ? 25 : riskLevel === 1 ? 55 : 85} 
                    label={riskLevel === 0 ? 'LOW' : riskLevel === 1 ? 'MEDIUM' : 'HIGH'}
                    color={riskLevel === 0 ? '#10B981' : riskLevel === 1 ? '#F59E0B' : '#EF4444'}
                  />
                </div>

                <div className={`text-2xl font-bold mb-2 ${
                  riskLevel === 0 ? 'text-green-400' :
                  riskLevel === 1 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {riskLevel === 0 ? t('LOW RISK') : riskLevel === 1 ? t('MEDIUM RISK') : t('HIGH RISK')}
                </div>

                <p className="text-gray-400 text-sm mb-6">
                  {riskLevel === 0 ? t('Area is safe for tourists') :
                   riskLevel === 1 ? t('Exercise normal caution') : 
                   t('Heightened security recommended')}
                </p>

                <button
                  onClick={runAnalysis}
                  disabled={isAnalyzing}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl transition-all duration-300 flex items-center space-x-2 mx-auto"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>{t('Analyzing...')}</span>
                    </>
                  ) : (
                    <>
                      <FiZap className="w-5 h-5" />
                      <span>{t('Run Analysis')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Risk Factors */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6 h-full">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-3">
                <FiActivity className="w-6 h-6 text-blue-400" />
                <span>{t('Risk Factors Analysis')}</span>
              </h2>

              <div className="space-y-4">
                {riskFactors.map((factor, index) => (
                  <div key={index} className="bg-gray-900/50 border border-gray-600/30 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-white font-medium">{t(factor.name)}</span>
                        <div className="flex items-center space-x-1">
                          {factor.trend === 'up' ? (
                            <FiTrendingUp className="w-4 h-4 text-red-400" />
                          ) : factor.trend === 'down' ? (
                            <FiTrendingDown className="w-4 h-4 text-green-400" />
                          ) : (
                            <div className="w-4 h-1 bg-gray-400 rounded"></div>
                          )}
                        </div>
                      </div>
                      <span className={`font-bold ${factor.color}`}>{factor.value}%</span>
                    </div>
                    
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-1000 ${
                          factor.value < 30 ? 'bg-green-500' :
                          factor.value < 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ 
                          width: `${factor.value}%`,
                          boxShadow: `0 0 10px ${
                            factor.value < 30 ? '#10B981' :
                            factor.value < 60 ? '#F59E0B' : '#EF4444'
                          }`
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Prediction Timeline and AI Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Prediction Timeline */}
          <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-3">
              <FiTarget className="w-6 h-6 text-cyan-400" />
              <span>{t('Risk Prediction Timeline')}</span>
            </h2>

            <div className="space-y-4">
              {predictions.map((pred, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-16 text-gray-400 text-sm">{pred.time}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white text-sm">{pred.label}</span>
                      <span className={`text-sm font-bold ${
                        pred.risk < 40 ? 'text-green-400' :
                        pred.risk < 70 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {pred.risk}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          pred.risk < 40 ? 'bg-green-500' :
                          pred.risk < 70 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ 
                          width: `${pred.risk}%`,
                          boxShadow: `0 0 8px ${
                            pred.risk < 40 ? '#10B981' :
                            pred.risk < 70 ? '#F59E0B' : '#EF4444'
                          }`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI System Stats */}
          <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-3">
              <FiCpu className="w-6 h-6 text-purple-400" />
              <span>{t('AI System Performance')}</span>
            </h2>

            <div className="space-y-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">
                  {predictionAccuracy.toFixed(1)}%
                </div>
                <div className="text-gray-400 text-sm">{t('Prediction Accuracy')}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900/50 border border-gray-600/30 rounded-xl p-4 text-center">
                  <div className="text-xl font-bold text-cyan-400">1,247</div>
                  <div className="text-gray-400 text-xs">{t('Data Points')}</div>
                </div>
                <div className="bg-gray-900/50 border border-gray-600/30 rounded-xl p-4 text-center">
                  <div className="text-xl font-bold text-green-400">98.3%</div>
                  <div className="text-gray-400 text-xs">{t('Uptime')}</div>
                </div>
                <div className="bg-gray-900/50 border border-gray-600/30 rounded-xl p-4 text-center">
                  <div className="text-xl font-bold text-yellow-400">2.1s</div>
                  <div className="text-gray-400 text-xs">{t('Response Time')}</div>
                </div>
                <div className="bg-gray-900/50 border border-gray-600/30 rounded-xl p-4 text-center">
                  <div className="text-xl font-bold text-blue-400">24/7</div>
                  <div className="text-gray-400 text-xs">{t('Monitoring')}</div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <span className="text-purple-300 font-medium">{t('AI Status')}</span>
                </div>
                <p className="text-gray-300 text-sm">
                  {isAnalyzing 
                    ? t('Neural networks processing real-time data...')
                    : t('System operational - continuously learning from patterns')
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Banner */}
        {riskLevel === 2 && (
          <div className="mt-6 bg-red-900/50 border border-red-500/50 rounded-2xl p-4">
            <div className="flex items-center space-x-4">
              <FiAlertTriangle className="w-8 h-8 text-red-400 animate-pulse" />
              <div>
                <h3 className="text-red-300 font-bold text-lg">{t('High Risk Alert')}</h3>
                <p className="text-red-200">
                  {t('AI system has detected elevated risk factors. Recommend immediate safety measures.')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIRiskAssessment;