import React, { useState, useEffect } from 'react';
import { 
  FiAlertTriangle, 
  FiMapPin, 
  FiClock, 
  FiShield, 
  FiZap, 
  FiActivity, 
  FiTarget,
  FiRefreshCw,
  FiUsers,
  FiAward,
  FiBarChart3,
  FiThermometer,
  FiEye,
  FiTrendingUp,
  FiHeart,
  FiTruck,
  FiBell
} from 'react-icons/fi';
import Navbar from './Navbar';

const AIRiskAssessment = () => {
  const [riskLevel, setRiskLevel] = useState('low');
  const [isAssessing, setIsAssessing] = useState(false);
  const [location, setLocation] = useState('नई दिल्ली, भारत (New Delhi, India)');
  const [currentDateTime] = useState(new Date());

  const riskData = {
    overall: {
      level: 'low',
      score: 85,
      recommendation: 'सामान्य सावधानी के साथ यात्रा के लिए सुरक्षित (Safe for travel with normal precautions)'
    },
    factors: [
      {
        name: 'सुरक्षा स्तर (Security Level)',
        score: 88,
        status: 'good',
        icon: FiShield,
        details: 'क्षेत्र में मजबूत सुरक्षा उपस्थिति (Strong security presence in area)',
        color: 'emerald'
      },
      {
        name: 'मौसम की स्थिति (Weather Conditions)',
        score: 92,
        status: 'excellent',
        icon: FiThermometer,
        details: 'अनुकूल मौसमी परिस्थितियां (Favorable weather conditions)',
        color: 'sapphire'
      },
      {
        name: 'ट्रैफिक सुरक्षा (Traffic Safety)',
        score: 78,
        status: 'moderate',
        icon: FiTruck,
        details: 'मध्यम यातायात भीड़ (Moderate traffic congestion)',
        color: 'amber'
      },
      {
        name: 'आपातकालीन प्रतिक्रिया (Emergency Response)',
        score: 95,
        status: 'excellent',
        icon: FiTarget,
        details: 'त्वरित आपातकालीन प्रतिक्रिया उपलब्ध (Quick emergency response available)',
        color: 'emerald'
      },
      {
        name: 'भीड़-भाड़ (Crowd Density)',
        score: 70,
        status: 'moderate',
        icon: FiUsers,
        details: 'मध्यम पर्यटक गतिविधि (Moderate tourist activity)',
        color: 'violet'
      },
      {
        name: 'स्वास्थ्य सुविधाएं (Health Facilities)',
        score: 95,
        status: 'excellent',
        icon: FiHeart,
        details: 'पास में उत्कृष्ट चिकित्सा सुविधाएं (Excellent medical facilities nearby)',
        color: 'rose'
      },
      {
        name: 'स्थानीय सहायता (Local Assistance)',
        score: 85,
        status: 'good',
        icon: FiMapPin,
        details: 'स्थानीय सहायता और गाइड उपलब्ध (Local help and guides available)',
        color: 'cyan'
      }
    ]
  };

  const stats = [
    {
      icon: <FiAward size={24} className="text-emerald-300" />,
      value: '85%',
      label: 'सुरक्षा स्कोर (Safety Score)',
      glowClass: 'glow-emerald-subtle'
    },
    {
      icon: <FiUsers size={24} className="text-sapphire-300" />,
      value: '2.5k',
      label: 'सक्रिय पर्यटक (Active Tourists)',
      glowClass: 'glow-sapphire-subtle'
    },
    {
      icon: <FiMapPin size={24} className="text-gold-300" />,
      value: '24',
      label: 'सुरक्षित क्षेत्र (Safe Zones)',
      glowClass: 'glow-gold-subtle'
    },
    {
      icon: <FiActivity size={24} className="text-red-300" />,
      value: 'लाइव',
      label: 'निगरानी (Monitoring)',
      glowClass: 'glow-red-subtle'
    }
  ];

  const handleRefreshAssessment = () => {
    setIsAssessing(true);
    setTimeout(() => {
      setIsAssessing(false);
    }, 2000);
  };

  const recentAlerts = [
    {
      id: 1,
      type: 'info',
      message: 'इंडिया गेट क्षेत्र में उच्च पर्यटक गतिविधि का पता चला (High tourist activity detected in India Gate area)',
      time: '2 मिनट पहले',
      severity: 'low'
    },
    {
      id: 2,
      type: 'warning', 
      message: 'राजपथ पर मध्यम यातायात भीड़ (Moderate traffic congestion on Rajpath)',
      time: '15 मिनट पहले',
      severity: 'medium'
    },
    {
      id: 3,
      type: 'success',
      message: 'लाल किला क्षेत्र में सुरक्षा बढ़ाई गई (Enhanced security at Red Fort area)',
      time: '30 मिनट पहले',
      severity: 'low'
    }
  ];

  const refreshAssessment = () => {
    setIsAssessing(true);
    setTimeout(() => {
      setIsAssessing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Navbar />

      <div className="relative z-10 py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-600 rounded-xl flex items-center justify-center">
                <FiShield className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400 text-center sm:text-left">
                AI Risk Assessment
              </h1>
            </div>
            <p className="text-gray-300 text-sm sm:text-base lg:text-lg max-w-3xl mx-auto px-4 sm:px-0">
              Real-time AI-powered safety analysis for your current location and travel route.
            </p>
          </div>

          <div className="glass-card-light mb-8 animate-slide-in animate-delay-200">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-4">
                <FiMapPin className="text-sapphire-300" size={20} />
                <span className="text-white font-semibold">{location}</span>
              </div>
              <div className="flex items-center space-x-4">
                <FiClock className="text-gold-300" size={16} />
                <span className="text-white/80 text-sm">
                  {currentDateTime.toLocaleDateString()} - {currentDateTime.toLocaleTimeString()}
                </span>
                <button
                  onClick={handleRefreshAssessment}
                  disabled={isAssessing}
                  className="premium-btn-secondary p-2"
                >
                  <FiRefreshCw className={`w-4 h-4 ${isAssessing ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-slide-in animate-delay-300">
            {stats.map((stat, index) => (
              <div key={index} className="glass-card-light text-center p-4">
                <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${stat.glowClass}`}>
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-white glow-text mb-1">{stat.value}</div>
                <div className="text-white/60 text-xs font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="glass-card-strong bg-gradient-to-br from-emerald-600 to-emerald-800 border-2 border-white/20 animate-slide-in animate-delay-400">
                <div className="p-8 text-center">
                  <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
                    <FiShield className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2 glow-text">
                    {riskData.overall.level.toUpperCase()} RISK
                  </h2>
                  <div className="text-5xl font-bold text-white mb-4 glow-text">
                    {riskData.overall.score}%
                  </div>
                  <p className="text-white/80 text-lg mb-6">{riskData.overall.recommendation}</p>
                  <div className="flex items-center justify-center space-x-2 text-white/60">
                    <FiClock size={16} />
                    <span className="text-sm">Last updated: {new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 animate-slide-in animate-delay-600">
                <h3 className="text-xl font-bold text-white mb-4 glow-text">Recent Alerts</h3>
                <div className="space-y-3">
                  {recentAlerts.map(alert => (
                    <div key={alert.id} className="glass-card-light p-4">
                      <div className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          alert.severity === 'low' ? 'bg-emerald-400' :
                          alert.severity === 'medium' ? 'bg-gold-400' :
                          'bg-red-400'
                        }`}></div>
                        <div className="flex-1">
                          <p className="text-white text-sm">{alert.message}</p>
                          <p className="text-white/50 text-xs mt-1">{alert.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-white mb-6 glow-text animate-slide-in animate-delay-400">
                Risk Factors Analysis
              </h2>
              <div className="grid md:grid-cols-2 gap-6 animate-slide-in animate-delay-500">
                {riskData.factors.map((factor, index) => {
                  const IconComponent = factor.icon;
                  const getColorClasses = (color) => {
                    switch(color) {
                      case 'emerald': return 'from-emerald-600 to-emerald-800 text-emerald-300';
                      case 'sapphire': return 'from-sapphire-600 to-sapphire-800 text-sapphire-300';
                      case 'gold': return 'from-gold-600 to-gold-800 text-gold-300';
                      default: return 'from-gray-600 to-gray-800 text-gray-300';
                    }
                  };
                  const getStatusColor = (status) => {
                    switch(status) {
                      case 'excellent': return 'text-emerald-300';
                      case 'good': return 'text-sapphire-300';
                      case 'moderate': return 'text-gold-300';
                      default: return 'text-gray-300';
                    }
                  };
                  
                  return (
                    <div key={index} className="glass-card group hover:scale-105 transition-all duration-300">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getColorClasses(factor.color)} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          <div className={`text-right ${getStatusColor(factor.status)}`}>
                            <div className="text-2xl font-bold">{factor.score}%</div>
                            <div className="text-xs uppercase font-semibold">{factor.status}</div>
                          </div>
                        </div>
                        <h3 className="text-white font-bold text-lg mb-2">{factor.name}</h3>
                        <p className="text-white/60 text-sm mb-4">{factor.details}</p>
                        <div className="w-full bg-gray-700/50 rounded-full h-2 mb-2">
                          <div 
                            className={`h-2 rounded-full bg-gradient-to-r ${getColorClasses(factor.color)}`}
                            style={{ width: `${factor.score}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 glass-card animate-slide-in animate-delay-700">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-4 glow-text flex items-center">
                    <FiTarget className="mr-3 text-emerald-300" />
                    AI Recommendations
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2"></div>
                      <p className="text-white/80 text-sm">
                        Current location shows low risk levels. Continue with normal tourist activities.
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-gold-400 rounded-full mt-2"></div>
                      <p className="text-white/80 text-sm">
                        Monitor traffic conditions on main routes. Consider alternative transportation.
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-sapphire-400 rounded-full mt-2"></div>
                      <p className="text-white/80 text-sm">
                        Emergency services are highly responsive in this area. Keep emergency contacts handy.
                      </p>
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

export default AIRiskAssessment;