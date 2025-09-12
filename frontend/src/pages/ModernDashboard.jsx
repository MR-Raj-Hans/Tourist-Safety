import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMoon, FiSun, FiAlertTriangle, FiBarChart2, FiGrid, FiMapPin, FiGlobe, FiCpu } from 'react-icons/fi';

// NOTE: Top-left shows only the "BUTTON" label now. Interactive demo buttons are inside each card.

const FeatureCard = ({ bgColor, icon, title, desc, onClick }) => (
  <div
    role="button"
    tabIndex={0}
    onClick={onClick}
    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick && onClick(); }}
    className="w-[320px] h-[180px] rounded-[16px] bg-[#F9FAFB] p-6 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 hover:scale-[1.02] transition-all duration-250 flex flex-col justify-center items-start cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-300"
  >
    <div className="flex items-start gap-4">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${bgColor}`}> {icon} </div>
      <div>
        <h3 className="text-black font-bold text-[16px]">{title}</h3>
        <p className="text-gray-500 text-[14px] mt-2" style={{ maxWidth: '220px' }}>{desc}</p>
      </div>
    </div>
  </div>
);

const ModernDashboard = () => {
  const [dark, setDark] = useState(false);
  const navigate = useNavigate();

  // Temporary auth guard: ensure user is a tourist by checking localStorage token
  const token = localStorage.getItem('authToken');
  const userData = localStorage.getItem('userData');
  if (!token || !userData) {
    // Redirect to login if not authenticated
    navigate('/login');
    return null;
  }

  return (
    <div className={`${dark ? 'bg-[#111827] text-white' : 'bg-white text-black'} min-h-screen py-12 px-8`}>
      {/* Soft pastel blobs background */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-30">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <defs>
            <linearGradient id="g1" x1="0%" x2="100%">
              <stop offset="0%" stopColor="#FEE2E2" />
              <stop offset="100%" stopColor="#FEF3C7" />
            </linearGradient>
          </defs>
          <rect x="5%" y="5%" width="30%" height="30%" rx="80" fill="url(#g1)" />
          <rect x="60%" y="15%" width="28%" height="28%" rx="80" fill="#FEEBF0" />
          <rect x="20%" y="60%" width="30%" height="24%" rx="80" fill="#EEF2FF" />
        </svg>
      </div>

      {/* Top bar (clean, only dark toggle) */}
      <div className="flex items-center justify-end mb-10">
        <div>
          <button
            onClick={() => setDark(!dark)}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md ${dark ? 'bg-yellow-500' : 'bg-[#111827]'}`}
            aria-label="Toggle dark mode"
          >
            {dark ? <FiSun /> : <FiMoon />}
          </button>
        </div>
      </div>

      {/* Welcome header */}
  <div className="max-w-4xl mx-auto text-center mb-8">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-gray-500 mt-2">Your safety dashboard — quick actions and a snapshot of your account</p>

        <div className="mt-4 flex items-center justify-center gap-4">
          <div className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">Active Alerts: 2</div>
          <div className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-medium">Safe Zones: 5</div>
          <div className="px-3 py-1 rounded-full bg-yellow-50 text-yellow-700 text-sm font-medium">QR Scans: 12</div>
        </div>
      </div>

      {/* Grid of feature cards: centered 3 columns x 2 rows */}
      <div className="flex justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-[40px] gap-x-8">
        <FeatureCard
          onClick={() => navigate('/emergency')}
          bgColor="bg-red-500 text-white"
          icon={<FiAlertTriangle className="w-5 h-5" />}
          title="Emergency Alerts"
          desc="Instant panic button with real-time alerts to authorities and emergency contacts."
        />

        <FeatureCard
          onClick={() => navigate('/analytics')}
          bgColor="bg-orange-200 text-red-600"
          icon={<FiBarChart2 className="w-5 h-5" />}
          title="Analytics Dashboard"
          desc="Comprehensive analytics and reporting for authorities to monitor trends and patterns."
        />

        <FeatureCard
          onClick={() => navigate('/qr-id')}
          bgColor="bg-orange-400 text-white"
          icon={<FiGrid className="w-5 h-5" />}
          title="QR Identification"
          desc="Dynamic QR codes containing tourist information for quick identification by authorities."
        />

        <FeatureCard
          onClick={() => navigate('/tracking')}
          bgColor="bg-pink-300 text-white"
          icon={<FiMapPin className="w-5 h-5" />}
          title="Location Tracking"
          desc="Real-time GPS tracking with geo-fence monitoring for restricted and safe zones."
        />

        <FeatureCard
          onClick={() => navigate('/translate')}
          bgColor="bg-blue-200 text-blue-700"
          icon={<FiGlobe className="w-5 h-5" />}
          title="Multi-language Support"
          desc="Support for multiple languages to assist international tourists effectively."
        />

        <FeatureCard
          onClick={() => navigate('/ai-risk')}
          bgColor="bg-violet-200 text-violet-700"
          icon={<FiCpu className="w-5 h-5" />}
          title="AI Risk Assessment"
          desc="Machine learning algorithms to predict and assess safety risks in real-time."
        />
        </div>
      </div>
    </div>
  );
};

export default ModernDashboard;
