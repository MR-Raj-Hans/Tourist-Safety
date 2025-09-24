import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiAlertTriangle, FiBarChart2, FiMapPin, FiGlobe, FiCpu, FiShield, FiUser, FiEye, FiActivity } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { getUserData } from '../services/api';
import Navbar from '../components/Navbar';

const PremiumFeatureCard = ({ priority, icon, title, desc, stats, onClick }) => (
  <div
    role="button"
    tabIndex={0}
    onClick={onClick}
    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick && onClick(); }}
    className="premium-glass-enhanced p-6 rounded-3xl cursor-pointer group animate-slide-in transition-all duration-300 hover:scale-105 hover:shadow-2xl"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="p-3 rounded-2xl premium-glass-enhanced transition-all duration-300 group-hover:scale-110">
        <div className="w-6 h-6 premium-text-gold">
          {icon}
        </div>
      </div>
      {stats && (
        <div className="text-right">
          <div className="text-2xl font-bold premium-text-bold">{stats.value}</div>
          <div className="text-xs premium-text-secondary font-medium">{stats.label}</div>
        </div>
      )}
    </div>
    
    <div className="space-y-3">
      <h3 className="text-xl premium-text-bold group-hover:premium-text-gold transition-all duration-300 leading-tight">
        {title}
      </h3>
      <p className="premium-text-secondary text-sm leading-relaxed">
        {desc}
      </p>
      
      {priority && (
        <div className="flex items-center justify-between pt-3 border-t border-white/20">
          <span className="text-xs font-bold premium-text-secondary uppercase tracking-wide">
            Priority: {priority}
          </span>
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-400 to-blue-400 animate-pulse"></div>
        </div>
      )}
    </div>
  </div>
);

const PremiumFooter = () => (
  <footer className="mt-12 premium-glass-enhanced p-6 rounded-3xl">
    <div className="text-center">
      <div className="flex items-center justify-center space-x-2 mb-3">
        <FiShield className="w-5 h-5 premium-text-gold" />
        <span className="text-lg font-bold premium-text-bold">Trāṇa (तरण)</span>
      </div>
      <p className="premium-text-secondary text-sm">
        Your Ultimate Travel Safety Companion
      </p>
      <p className="premium-text-secondary text-xs mt-2">
        Powered by Advanced AI & Real-time Monitoring
      </p>
    </div>
  </footer>
);

const ModernDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [userData] = useState(getUserData());

  const features = [
    {
      id: 'emergency',
      icon: <FiAlertTriangle className="premium-text-gold" />,
      title: t('dashboard.emergency', 'Emergency Alerts'),
      desc: t('dashboard.emergencyDesc', 'Instant panic button with real-time alerts to authorities.'),
      priority: 'CRITICAL',
      stats: { value: '24/7', label: 'Monitoring' },
      route: '/emergency'
    },
    {
      id: 'analytics',
      icon: <FiBarChart2 className="premium-text-gold" />,
      title: t('dashboard.analytics', 'Analytics Dashboard'),
      desc: t('dashboard.analyticsDesc', 'Comprehensive analytics and reporting with real-time insights.'),
      priority: 'HIGH',
      stats: { value: '95%', label: 'Accuracy' },
      route: '/analytics'
    },
    {
      id: 'tracking',
      icon: <FiMapPin className="premium-text-gold" />,
      title: t('dashboard.tracking', 'Location Tracking'),
      desc: t('dashboard.trackingDesc', 'Real-time GPS tracking with geo-fence monitoring for safety.'),
      priority: 'HIGH',
      stats: { value: '24/7', label: 'Active' },
      route: '/tracking'
    },
    {
      id: 'translate',
      icon: <FiGlobe className="premium-text-gold" />,
      title: t('dashboard.translate', 'Language Support'),
      desc: t('dashboard.translateDesc', 'Multi-language translation for seamless communication.'),
      priority: 'MEDIUM',
      stats: { value: '15+', label: 'Languages' },
      route: '/translate'
    },
    {
      id: 'ai-risk',
      icon: <FiCpu className="premium-text-gold" />,
      title: t('dashboard.aiRisk', 'AI Risk Assessment'),
      desc: t('dashboard.aiRiskDesc', 'Machine learning algorithms for predictive safety analysis.'),
      priority: 'HIGH',
      stats: { value: 'AI', label: 'Powered' },
      route: '/ai-risk'
    },
    {
      id: 'qr-id',
      icon: <FiUser className="premium-text-gold" />,
      title: t('dashboard.qrId', 'QR Identification'),
      desc: t('dashboard.qrIdDesc', 'Dynamic QR codes for quick identification by authorities.'),
      priority: 'MEDIUM',
      stats: { value: 'QR', label: 'Active' },
      route: '/qr-id'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-aurora relative overflow-hidden">
      <Navbar />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="text-center mb-12 premium-glass-enhanced p-8 rounded-3xl animate-slide-in">
          <div className="w-20 h-20 premium-glass-enhanced rounded-3xl flex items-center justify-center mx-auto mb-6">
            <FiUser size={40} className="premium-text-gold" />
          </div>
          
          <h1 className="text-5xl font-bold premium-text-bold mb-4">
            Welcome to Trāṇa, Traveler!
          </h1>
          <p className="text-xl premium-text-secondary max-w-3xl mx-auto leading-relaxed">
            Your safety is our priority. Monitor your location and stay connected.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <div className="premium-glass-enhanced px-4 py-2 rounded-2xl flex items-center space-x-2">
              <FiAlertTriangle className="w-5 h-5 text-orange-400" />
              <span className="premium-text text-sm">My Alerts: 2</span>
            </div>
            <div className="premium-glass-enhanced px-4 py-2 rounded-2xl flex items-center space-x-2">
              <FiEye className="w-5 h-5 text-green-400" />
              <span className="premium-text text-sm">My QR: Active</span>
            </div>
            <div className="premium-glass-enhanced px-4 py-2 rounded-2xl flex items-center space-x-2">
              <FiMapPin className="w-5 h-5 text-yellow-400" />
              <span className="premium-text text-sm">Safe Zones: 5</span>
            </div>
            <div className="premium-glass-enhanced px-4 py-2 rounded-2xl flex items-center space-x-2">
              <FiActivity className="w-5 h-5 text-blue-400" />
              <span className="premium-text text-sm">Status: Protected</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <div key={feature.id} style={{ animationDelay: `${index * 0.1}s` }}>
              <PremiumFeatureCard
                {...feature}
                onClick={() => navigate(feature.route)}
              />
            </div>
          ))}
        </div>

        <PremiumFooter />
      </div>
    </div>
  );
};

export default ModernDashboard;
