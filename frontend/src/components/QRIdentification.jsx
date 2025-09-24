import React, { useState, useEffect } from 'react';
import { FiUser, FiMapPin, FiPhone, FiMail, FiCalendar, FiFlag, FiCheck, FiCamera, FiRefreshCw, FiShield, FiStar, FiClock, FiGlobe } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import QRCode from 'qrcode';
import Navbar from './Navbar';

const QRIdentification = () => {
  const { t } = useTranslation();
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [glowIntensity, setGlowIntensity] = useState(0);
  const [verificationStep, setVerificationStep] = useState(0);

  // Enhanced Indian tourist data
  const touristData = {
    id: 'IND-2025-0042',
    name: 'राज कुमार (Raj Kumar)',
    nationality: 'भारत (India)',
    aadhar: 'XXXX-XXXX-8745',
    phone: '+91-98765-43210',
    email: 'raj.kumar@gmail.com',
    checkIn: '2025-09-24',
    checkOut: '2025-10-05',
    accommodation: 'होटल ताज महल, मुंबई (Hotel Taj Mahal, Mumbai)',
    emergencyContact: 'सुनीता कुमार (+91-98765-43211)',
    purpose: 'पर्यटन (Tourism)',
    visitingStates: 'महाराष्ट्र, गोवा, केरल',
    homeState: 'उत्तर प्रदेश (Uttar Pradesh)',
    status: 'सक्रिय (Active)',
    verificationLevel: 'सत्यापित (Verified)',
    riskLevel: 'कम (Low)',
    avatar: null,
    lastUpdate: new Date().toISOString(),
    languages: 'हिंदी, अंग्रेजी (Hindi, English)',
    localGuide: 'राहुल शर्मा (+91-99887-66554)'
  };

  // Generate QR code with enhanced data
  useEffect(() => {
    const generateQR = async () => {
      try {
        const qrData = JSON.stringify({
          ...touristData,
          timestamp: Date.now(),
          securityHash: 'abc123def456' // In real app, this would be a proper hash
        });
        
        const url = await QRCode.toDataURL(qrData, {
          width: 300,
          margin: 2,
          color: {
            dark: '#059669', // Emerald green for Indian theme
            light: '#ffffff'
          }
        });
        setQrCodeUrl(url);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    generateQR();
  }, []);

  // Glow animation effect
  useEffect(() => {
    const glowInterval = setInterval(() => {
      setGlowIntensity(prev => (prev + 1) % 100);
    }, 80);

    return () => clearInterval(glowInterval);
  }, []);

  // Verification animation sequence
  const startVerification = () => {
    setShowVerification(true);
    setVerificationStep(0);
    
    const steps = [
      { step: 1, message: 'Scanning QR Code...', duration: 1500 },
      { step: 2, message: 'Validating Identity...', duration: 1200 },
      { step: 3, message: 'Checking Database...', duration: 1000 },
      { step: 4, message: 'Verification Complete!', duration: 800 }
    ];

    let currentStep = 0;
    const processStep = () => {
      if (currentStep < steps.length) {
        setVerificationStep(currentStep + 1);
        setTimeout(() => {
          currentStep++;
          if (currentStep < steps.length) {
            processStep();
          } else {
            setIsVerified(true);
            setTimeout(() => {
              setShowVerification(false);
            }, 2000);
          }
        }, steps[currentStep].duration);
      }
    };

    processStep();
  };

  const regenerateQR = async () => {
    setIsScanning(true);
    // Simulate regeneration delay
    setTimeout(async () => {
      try {
        const qrData = JSON.stringify({
          ...touristData,
          timestamp: Date.now(),
          securityHash: Math.random().toString(36).substr(2, 9)
        });
        
        const url = await QRCode.toDataURL(qrData, {
          width: 300,
          margin: 2,
          color: {
            dark: '#10b981',
            light: '#ffffff'
          }
        });
        setQrCodeUrl(url);
        setIsScanning(false);
      } catch (error) {
        console.error('Error regenerating QR code:', error);
        setIsScanning(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Navbar />
      {/* Mobile optimized spacing */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="floating-particle" style={{top: '15%', left: '10%', animationDelay: '0s'}}></div>
        <div className="floating-particle" style={{top: '70%', left: '80%', animationDelay: '1.5s'}}></div>
        <div className="floating-particle" style={{top: '40%', left: '75%', animationDelay: '3s'}}></div>
        <div className="floating-particle" style={{top: '85%', left: '15%', animationDelay: '4.5s'}}></div>
        <div className="floating-particle" style={{top: '25%', left: '60%', animationDelay: '6s'}}></div>
      </div>

      {/* Ripple Background Animation */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {[1, 2, 3, 4].map(ring => (
            <div
              key={ring}
              className="absolute border border-white/10 rounded-full animate-ping"
              style={{
                width: `${200 + ring * 150}px`,
                height: `${200 + ring * 150}px`,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                animationDelay: `${ring * 0.8}s`,
                animationDuration: '4s'
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Premium Header */}
      <div className="relative z-10 bg-gray-800/80 border-b border-gray-700/50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="flex items-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-600 flex items-center justify-center">
                  <span className="text-white text-lg sm:text-xl font-bold">🛡️</span>
                </div>
                <div className="ml-2 sm:ml-3">
                  <h1 className="text-lg sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                    Digital Identity
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-300">Secure • Verified • Protected</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="glass-card px-4 py-2 flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-white/80 text-sm font-medium">Active Status</span>
              </div>
              <div className={`px-4 py-2 rounded-full text-xs font-bold glass-card border-2 ${
                isVerified 
                  ? 'border-emerald-500 text-emerald-400 glow-emerald' 
                  : 'border-royal text-royal glow-royal'
              }`}>
                {isVerified ? '✓ VERIFIED' : '⏳ PENDING'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          
          {/* QR Code Section - Center Focus */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 sm:top-8">
              {/* Central Glowing QR Card */}
              <div className="glass-card p-6 sm:p-8 text-center relative overflow-hidden">
                {/* Glowing Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-sapphire/20 via-emerald/20 to-royal/20 animate-pulse-slow"></div>
                
                <div className="relative z-10">
                  <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center justify-center gap-2">
                    <span className="text-xl sm:text-2xl">🆔</span> 
                    <span className="text-sm sm:text-base">Digital Identity Code</span>
                  </h2>
                  
                  {/* QR Code Container with Neon Glow */}
                  <div className="relative mx-auto w-48 h-48 sm:w-64 sm:h-64 mb-4 sm:mb-6">
                    {/* Animated Neon Border */}
                    <div 
                      className="absolute inset-0 rounded-2xl bg-gradient-to-r from-sapphire via-emerald to-royal opacity-80 animate-pulse"
                      style={{
                        filter: `blur(${3 + Math.sin(glowIntensity * 0.1) * 4}px)`,
                        transform: `scale(${1 + Math.sin(glowIntensity * 0.05) * 0.03})`
                      }}
                    ></div>
                    
                    {/* Inner Glow Ring */}
                    <div 
                      className="absolute inset-2 rounded-xl bg-gradient-to-r from-emerald-400 to-sapphire-400 opacity-60"
                      style={{
                        filter: `blur(2px)`,
                        transform: `rotate(${glowIntensity * 2}deg)`
                      }}
                    ></div>
                    
                    {/* QR Code Container */}
                    <div className="relative bg-white rounded-2xl p-3 sm:p-4 shadow-2xl m-2">
                      {qrCodeUrl && !isScanning ? (
                        <img 
                          src={qrCodeUrl} 
                          alt="Tourist QR Code" 
                          className="w-full h-full object-contain rounded-xl touch-manipulation"
                          style={{
                            filter: `drop-shadow(0 0 ${8 + Math.sin(glowIntensity * 0.1) * 6}px rgba(16, 185, 129, 0.6))`
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl">
                          <div className="animate-spin text-emerald-500">
                            <FiRefreshCw className="w-6 h-6 sm:w-8 sm:h-8" />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Verification Checkmark with Neon Glow */}
                    {isVerified && (
                      <div className="absolute -top-3 -right-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full p-3 shadow-xl animate-bounce glow-emerald">
                        <FiCheck className="w-5 h-5 text-white font-bold" />
                      </div>
                    )}
                  </div>
                  
                  {/* ID Number with Glass Effect */}
                  <div className="glass-card p-4 mb-6 border border-emerald-500/30">
                    <p className="text-sm text-emerald-400 font-medium mb-1">🔑 Tourist ID</p>
                    <p className="text-lg font-bold text-white font-mono tracking-wider">{touristData.id}</p>
                  </div>
                  
                  {/* Gradient Neon Action Buttons */}
                  <div className="space-y-4">
                    <button
                      onClick={startVerification}
                      className="w-full btn-premium bg-gradient-to-r from-emerald-500 to-sapphire-500 hover:from-emerald-600 hover:to-sapphire-600 text-white font-bold py-4 px-6 rounded-xl glow-emerald"
                    >
                      <div className="flex items-center justify-center space-x-3">
                        <FiCamera className="w-5 h-5" />
                        <span>🔍 Verify Identity</span>
                      </div>
                    </button>
                    
                    <button
                      onClick={regenerateQR}
                      className="w-full btn-glass border-2 border-royal text-white font-semibold py-3 px-6 rounded-xl hover:border-emerald-500 hover:glow-emerald transition-all duration-300"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <FiRefreshCw className="w-4 h-4" />
                        <span>🔄 Regenerate Code</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Profile Information Cards */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Personal Information */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <FiUser className="w-6 h-6 text-emerald-400 mr-3" />
                👤 Personal Information
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="glass-card-light p-4 border-l-4 border-emerald-500">
                    <label className="text-sm text-emerald-400 font-medium flex items-center gap-1">
                      🏷️ पूरा नाम / Full Name
                    </label>
                    <p className="text-lg font-bold text-white mt-1">{touristData.name}</p>
                  </div>
                  
                  <div className="glass-card-light p-4 border-l-4 border-sapphire">
                    <label className="text-sm text-sapphire font-medium flex items-center gap-1">
                      <FiFlag className="w-4 h-4" />
                      �🇳 राष्ट्रीयता / Nationality
                    </label>
                    <p className="text-lg font-bold text-white mt-1">{touristData.nationality}</p>
                  </div>
                  
                  <div className="glass-card-light p-4 border-l-4 border-orange-500">
                    <label className="text-sm text-orange-400 font-medium">🆔 आधार संख्या / Aadhar Number</label>
                    <p className="text-lg font-bold text-white font-mono mt-1">{touristData.aadhar}</p>
                  </div>
                  
                  <div className="glass-card-light p-4 border-l-4 border-green-500">
                    <label className="text-sm text-green-400 font-medium">🏠 मूल राज्य / Home State</label>
                    <p className="text-lg font-bold text-white mt-1">{touristData.homeState}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="glass-card-light p-4 border-l-4 border-emerald-500">
                    <label className="text-sm text-emerald-400 font-medium flex items-center gap-1">
                      <FiPhone className="w-4 h-4" />
                      📱 मोबाइल नंबर / Phone Number
                    </label>
                    <p className="text-lg font-bold text-white mt-1">{touristData.phone}</p>
                  </div>
                  
                  <div className="glass-card-light p-4 border-l-4 border-sapphire">
                    <label className="text-sm text-sapphire font-medium flex items-center gap-1">
                      <FiMail className="w-4 h-4" />
                      📧 ईमेल पता / Email Address
                    </label>
                    <p className="text-lg font-bold text-white mt-1">{touristData.email}</p>
                  </div>
                  
                  <div className="glass-card-light p-4 border-l-4 border-purple-500">
                    <label className="text-sm text-purple-400 font-medium">🗣️ भाषाएं / Languages</label>
                    <p className="text-lg font-bold text-white mt-1">{touristData.languages}</p>
                  </div>
                  
                  <div className="glass-card-light p-4 border-l-4 border-blue-500">
                    <label className="text-sm text-blue-400 font-medium">🗺️ भ्रमण राज्य / Visiting States</label>
                    <p className="text-lg font-bold text-white mt-1">{touristData.visitingStates}</p>
                  </div>
                  
                  <div className="glass-card-light p-4 border-l-4 border-royal">
                    <label className="text-sm text-royal font-medium">🎯 Purpose of Visit</label>
                    <p className="text-lg font-bold text-white mt-1">{touristData.purpose}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Travel Details */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <FiCalendar className="w-6 h-6 text-sapphire mr-3" />
                ✈️ Travel Details
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="glass-card-light p-4 border-l-4 border-emerald-500">
                    <label className="text-sm text-emerald-400 font-medium">📅 चेक-इन दिनांक / Check-in Date</label>
                    <p className="text-lg font-bold text-white mt-1">{touristData.checkIn}</p>
                  </div>
                  
                  <div className="glass-card-light p-4 border-l-4 border-royal">
                    <label className="text-sm text-royal font-medium">📅 चेक-आउट दिनांक / Check-out Date</label>
                    <p className="text-lg font-bold text-white mt-1">{touristData.checkOut}</p>
                  </div>
                  
                  <div className="glass-card-light p-4 border-l-4 border-orange-500">
                    <label className="text-sm text-orange-400 font-medium">🎯 यात्रा का उद्देश्य / Purpose</label>
                    <p className="text-lg font-bold text-white mt-1">{touristData.purpose}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="glass-card-light p-4 border-l-4 border-sapphire">
                    <label className="text-sm text-sapphire font-medium flex items-center gap-1">
                      <FiMapPin className="w-4 h-4" />
                      🏨 आवास / Accommodation
                    </label>
                    <p className="text-lg font-bold text-white mt-1">{touristData.accommodation}</p>
                  </div>
                  
                  <div className="glass-card-light p-4 border-l-4 border-purple-500">
                    <label className="text-sm text-purple-400 font-medium">👨‍🦳 स्थानीय गाइड / Local Guide</label>
                    <p className="text-lg font-bold text-white mt-1">{touristData.localGuide}</p>
                  </div>
                  
                  <div className="glass-card-light p-4 border-l-4 border-red-500">
                    <label className="text-sm text-red-400 font-medium">🚨 आपातकालीन संपर्क / Emergency Contact</label>
                    <p className="text-lg font-bold text-white mt-1">{touristData.emergencyContact}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Security & Status */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <FiShield className="w-6 h-6 text-emerald-400 mr-3" />
                  🛡️ Security Status
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 glass-card-light rounded-lg">
                    <span className="text-white/80">Verification Level</span>
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        {[1, 2, 3].map(star => (
                          <FiStar key={star} className="w-4 h-4 text-royal fill-current" />
                        ))}
                      </div>
                      <span className="text-emerald-400 font-bold">{touristData.verificationLevel}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 glass-card-light rounded-lg">
                    <span className="text-white/80">Risk Assessment</span>
                    <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-full text-sm">
                      {touristData.riskLevel}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 glass-card-light rounded-lg">
                    <span className="text-white/80">Account Status</span>
                    <span className="px-3 py-1 bg-gradient-to-r from-sapphire to-emerald-500 text-white font-bold rounded-full text-sm">
                      {touristData.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <FiClock className="w-6 h-6 text-sapphire mr-3" />
                  ⏱️ Recent Activity
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 glass-card-light rounded-lg">
                    <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse glow-emerald"></div>
                    <span className="text-sm text-white/80 flex-1">🔍 QR Code accessed</span>
                    <span className="text-xs text-white/50">Just now</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 glass-card-light rounded-lg">
                    <div className="w-3 h-3 bg-sapphire rounded-full"></div>
                    <span className="text-sm text-white/80 flex-1">📍 Location updated</span>
                    <span className="text-xs text-white/50">5 min ago</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 glass-card-light rounded-lg">
                    <div className="w-3 h-3 bg-royal rounded-full"></div>
                    <span className="text-sm text-white/80 flex-1">✅ Profile verified</span>
                    <span className="text-xs text-white/50">1 hour ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Verification Modal */}
      {showVerification && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-50">
          <div className="glass-card max-w-md w-full mx-4 p-8 scale-in">
            <div className="text-center">
              <div className="mb-6">
                <div className="w-20 h-20 glass-card-light rounded-full flex items-center justify-center mx-auto mb-4 glow-emerald">
                  {verificationStep < 4 ? (
                    <div className="animate-spin">
                      <FiRefreshCw className="w-10 h-10 text-emerald-400" />
                    </div>
                  ) : (
                    <FiCheck className="w-10 h-10 text-emerald-400" />
                  )}
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-2">
                  🔐 Identity Verification
                </h3>
                
                <p className="text-white/80">
                  {verificationStep === 1 && '🔍 Scanning QR Code...'}
                  {verificationStep === 2 && '🛡️ Validating Identity...'}
                  {verificationStep === 3 && '💾 Checking Database...'}
                  {verificationStep === 4 && '✅ Verification Complete!'}
                </p>
              </div>
              
              {/* Enhanced Progress Bar */}
              <div className="w-full bg-white/20 rounded-full h-3 mb-6 overflow-hidden">
                <div 
                  className="h-3 rounded-full bg-gradient-to-r from-emerald-500 via-sapphire to-royal transition-all duration-500 glow-emerald"
                  style={{ width: `${(verificationStep / 4) * 100}%` }}
                ></div>
              </div>
              
              {verificationStep === 4 && (
                <div className="glass-card-light p-4 border-2 border-emerald-500 glow-emerald">
                  <p className="text-emerald-400 font-bold text-lg">
                    ✓ Identity successfully verified!
                  </p>
                  <p className="text-white/80 text-sm mt-1">
                    🛡️ All security checks passed.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRIdentification;