import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiShield, FiMap, FiTriangle, FiCamera, FiUser } from 'react-icons/fi';
import Navbar from '../components/Navbar';

const LoginSelection = () => {
  const navigate = useNavigate();

  const handleTravelerLogin = () => {
    navigate('/login?type=user');
  };

  const handleAdminLogin = () => {
    navigate('/login?type=admin');
  };

  return (
    <div className="min-h-screen bg-gradient-aurora relative overflow-hidden">
      <Navbar />
      
      {/* Main Content */}
      <div className="relative z-10 pt-4">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <div className="w-14 h-14 rounded-3xl premium-glass-enhanced flex items-center justify-center shadow-xl">
                <FiShield size={24} className="premium-text-gold" />
              </div>
              <div className="ml-4">
                <h1 className="text-3xl font-bold premium-text-bold">
                  Trāṇa (त्राण)
                </h1>
                <p className="text-sm premium-text-secondary">Protection • Refuge • Care</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-[calc(100vh-120px)] flex items-center justify-center px-4">
        <div className="max-w-6xl w-full">
          
          {/* Welcome Section */}
          <div className="text-center mb-16 animate-slide-in">
            <h2 className="text-4xl md:text-5xl font-bold premium-text-bold mb-4">
              Welcome to Your Safety Guardian
            </h2>
            <p className="text-xl premium-text mb-2">
              Choose your access level to continue
            </p>
            <p className="premium-text-secondary">
              Experience premium protection with our futuristic safety system
            </p>
          </div>

          {/* Selection Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* Tourist Access Card */}
            <div 
              className="premium-glass-enhanced p-8 cursor-pointer group hover:scale-105 transition-all duration-500 rounded-3xl animate-slide-in"
              onClick={handleTravelerLogin}
              style={{animationDelay: '0.2s'}}
            >
              {/* Card Header */}
              <div className="text-center mb-8">
                <div className="w-24 h-24 mx-auto mb-6 premium-glass-enhanced rounded-3xl flex items-center justify-center shadow-xl group-hover:animate-pulse">
                  <FiUsers className="w-12 h-12 premium-text-gold" />
                </div>
                <h3 className="text-2xl font-bold premium-text-bold mb-2">Tourist Access</h3>
                <p className="premium-text-secondary">Personal safety dashboard for travelers</p>
              </div>

              {/* Features List */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <FiMap className="w-5 h-5 text-emerald-400" />
                  <span className="premium-text">Real-time location tracking</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FiShield className="w-5 h-5 text-emerald-400" />
                  <span className="premium-text">Emergency panic button</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FiCamera className="w-5 h-5 text-emerald-400" />
                  <span className="premium-text">Digital ID & QR codes</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FiTriangle className="w-5 h-5 text-emerald-400" />
                  <span className="premium-text">AI risk assessment</span>
                </div>
              </div>

              {/* CTA Button */}
              <button className="btn-glassmorphism w-full py-4 px-6 font-bold transition-all duration-300 group-hover:scale-105">
                <div className="flex items-center justify-center space-x-2">
                  <FiUser className="w-5 h-5" />
                  <span>Access Tourist Portal</span>
                </div>
              </button>
            </div>

            {/* Police Access Card */}
            <div 
              className="premium-glass-enhanced p-8 cursor-pointer group hover:scale-105 transition-all duration-500 rounded-3xl animate-slide-in"
              onClick={handleAdminLogin}
              style={{animationDelay: '0.4s'}}
            >
              {/* Card Header */}
              <div className="text-center mb-8">
                <div className="w-24 h-24 mx-auto mb-6 premium-glass-enhanced rounded-3xl flex items-center justify-center shadow-xl group-hover:animate-pulse">
                  <FiShield className="w-12 h-12 premium-text-gold" />
                </div>
                <h3 className="text-2xl font-bold premium-text-bold mb-2">Police Command</h3>
                <p className="premium-text-secondary">Administrative control center</p>
              </div>

              {/* Features List */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <FiMap className="w-5 h-5 text-purple-400" />
                  <span className="premium-text">Live monitoring dashboard</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FiTriangle className="w-5 h-5 text-purple-400" />
                  <span className="premium-text">Alert management system</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FiUsers className="w-5 h-5 text-purple-400" />
                  <span className="premium-text">Tourist registry access</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FiCamera className="w-5 h-5 text-purple-400" />
                  <span className="premium-text">Security verification tools</span>
                </div>
              </div>

              {/* CTA Button */}
              <button className="btn-glassmorphism w-full py-4 px-6 font-bold transition-all duration-300 group-hover:scale-105">
                <div className="flex items-center justify-center space-x-2">
                  <FiShield className="w-5 h-5" />
                  <span>Access Command Center</span>
                </div>
              </button>
            </div>
          </div>

          {/* Bottom Info */}
          <div className="text-center mt-16 animate-slide-in" style={{animationDelay: '0.6s'}}>
            <div className="premium-glass-enhanced p-6 max-w-2xl mx-auto rounded-3xl">
              <p className="premium-text mb-4">
                <span className="font-bold premium-text-gold">Trāṇa</span> provides cutting-edge safety solutions 
                powered by advanced AI and real-time monitoring technology.
              </p>
              <div className="flex items-center justify-center space-x-6 text-sm premium-text-secondary">
                <span>🔐 Secure Authentication</span>
                <span>🛡️ 24/7 Protection</span>
                <span>🌐 Real-time Updates</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSelection;