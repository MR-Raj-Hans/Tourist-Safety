import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiShield, FiMap, FiTriangle, FiCamera, FiUser } from 'react-icons/fi';

const LoginSelection = () => {
  const navigate = useNavigate();

  const handleTravelerLogin = () => {
    navigate('/login?type=user');
  };

  const handleAdminLogin = () => {
    navigate('/login?type=admin');
  };

  return (
    <div className="min-h-screen w-full bg-white font-inter overflow-hidden">
      {/* Split Screen Container */}
      <div className="flex min-h-screen">
        
        {/* Left Section - 65% Width */}
        <div className="relative w-[65%] flex items-center justify-start pl-20">
          
          {/* Illustration Circles Container */}
          <div className="relative">
            
            {/* Main Center Circle - 250px x 250px */}
            <div className="relative w-[250px] h-[250px] bg-gradient-to-br from-blue-500 to-blue-300 rounded-full shadow-[0px_8px_20px_rgba(0,0,0,0.15)] flex items-center justify-center animate-float-main">
              {/* Couple on Scooter Illustration */}
              <div className="flex items-center space-x-3">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <FiUser className="w-8 h-8 text-white" />
                </div>
                <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center">
                  <FiCamera className="w-6 h-6 text-white" />
                </div>
              </div>
              {/* Scooter representation */}
              <div className="absolute bottom-8 w-20 h-8 bg-white/20 rounded-full"></div>
            </div>

            {/* Top-Left Small Circle - 120px x 120px */}
            <div 
              className="absolute w-[120px] h-[120px] bg-gradient-to-br from-purple-400 to-purple-200 rounded-full shadow-lg flex items-center justify-center animate-float-diagonal"
              style={{ 
                top: '-80px', 
                left: '-160px' 
              }}
            >
              {/* Hiking Illustration */}
              <FiTriangle className="w-10 h-10 text-white" />
            </div>

            {/* Top-Right Small Circle - 120px x 120px */}
            <div 
              className="absolute w-[120px] h-[120px] bg-gradient-to-br from-pink-400 to-pink-200 rounded-full shadow-lg flex items-center justify-center animate-bounce-scale"
              style={{ 
                top: '-80px', 
                right: '-120px' 
              }}
            >
              {/* Traveler with Backpack */}
              <FiMap className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Tagline Text */}
          <div className="absolute bottom-32 left-20">
            <h1 className="font-bold text-2xl text-gray-900 mb-2 leading-tight">
              Explore the world easily
            </h1>
            <p className="font-normal text-base text-gray-500">
              To your desire
            </p>
          </div>
        </div>

        {/* Right Section - 35% Width */}
        <div className="w-[35%] flex items-center justify-center pr-20">
          
          {/* Login Card */}
          <div className="w-[350px] bg-white/70 backdrop-blur-[20px] border border-white/30 rounded-[20px] shadow-[0_8px_30px_rgba(0,0,0,0.2)] p-8 animate-slide-in-right">
            
            {/* Card Header */}
            <div className="text-center mb-6">
              {/* Path to Mountain Illustration */}
              <div className="flex justify-center mb-4">
                <svg width="80" height="40" viewBox="0 0 80 40" className="text-red-500">
                  <path 
                    d="M10 35 Q25 25 40 20 Q55 15 70 10" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    fill="none"
                    strokeDasharray="4,2"
                  />
                  <circle cx="10" cy="35" r="2" fill="currentColor" />
                  <polygon points="70,10 75,20 65,20" fill="currentColor" />
                </svg>
              </div>
              
              <h2 className="font-bold text-[28px] text-gray-900">
                Welcome
              </h2>
            </div>

            {/* Buttons Container */}
            <div className="space-y-4">
              
              {/* Traveler Button */}
              <button
                onClick={handleTravelerLogin}
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium text-base rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 animate-pulse-idle"
              >
                <FiUsers className="w-5 h-5" />
                <span>Traveler</span>
              </button>

              {/* Admin Button */}
              <button
                onClick={handleAdminLogin}
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium text-base rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 animate-pulse-idle"
              >
                <FiShield className="w-5 h-5" />
                <span>Admin</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animations CSS */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        .font-inter {
          font-family: 'Inter', sans-serif;
        }

        @keyframes float-main {
          0%, 100% { 
            transform: translateY(0px); 
          }
          50% { 
            transform: translateY(-10px); 
          }
        }

        @keyframes float-diagonal {
          0%, 100% { 
            transform: translateY(0px) translateX(0px); 
          }
          50% { 
            transform: translateY(-12px) translateX(-8px); 
          }
        }

        @keyframes bounce-scale {
          0%, 100% { 
            transform: scale(0.95); 
          }
          50% { 
            transform: scale(1.05); 
          }
        }

        @keyframes slide-in-right {
          0% { 
            transform: translateX(80px); 
            opacity: 0; 
          }
          100% { 
            transform: translateX(0px); 
            opacity: 1; 
          }
        }

        @keyframes pulse-idle {
          0%, 100% { 
            opacity: 1; 
          }
          50% { 
            opacity: 0.9; 
          }
        }

        .animate-float-main {
          animation: float-main 4s ease-in-out infinite;
        }

        .animate-float-diagonal {
          animation: float-diagonal 5s ease-in-out infinite;
        }

        .animate-bounce-scale {
          animation: bounce-scale 3s ease-in-out infinite;
        }

        .animate-slide-in-right {
          animation: slide-in-right 1s ease-out;
        }

        .animate-pulse-idle {
          animation: pulse-idle 2s ease-in-out infinite;
        }

        /* Hover Effects */
        button:hover {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(37, 99, 235, 0.9));
        }

        button:hover.from-purple-600 {
          background: linear-gradient(135deg, rgba(147, 51, 234, 0.9), rgba(109, 40, 217, 0.9));
        }
      `}</style>
    </div>
  );
};

export default LoginSelection;