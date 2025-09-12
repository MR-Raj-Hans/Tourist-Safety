import React, { useState, useEffect } from 'react';
import { FiUser, FiMapPin, FiPhone, FiMail, FiCalendar, FiFlag, FiCheck, FiCamera, FiRefreshCw, FiShield, FiStar, FiClock, FiGlobe } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import QRCode from 'qrcode';

const QRIdentification = () => {
  const { t } = useTranslation();
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [glowIntensity, setGlowIntensity] = useState(0);
  const [verificationStep, setVerificationStep] = useState(0);

  // Enhanced tourist data
  const touristData = {
    id: 'TST-2025-001',
    name: 'John Smith',
    nationality: 'United States',
    passport: 'US123456789',
    phone: '+1-555-0123',
    email: 'john.smith@email.com',
    checkIn: '2025-09-10',
    checkOut: '2025-09-20',
    hotel: 'Grand Plaza Hotel',
    emergencyContact: 'Jane Smith (+1-555-0124)',
    purpose: 'Tourism',
    status: 'Active',
    verificationLevel: 'Verified',
    riskLevel: 'Low',
    avatar: null,
    lastUpdate: new Date().toISOString()
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
            dark: '#10b981', // Green color for the QR code
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
      {/* Elegant Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-green-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500/10 rounded-xl">
                <FiShield className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Digital Tourist ID</h1>
                <p className="text-green-600 text-sm">Secure • Verified • Official</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-600 text-sm font-medium">Active Status</span>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                isVerified 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-gray-100 text-gray-600 border border-gray-200'
              }`}>
                {isVerified ? 'VERIFIED' : 'PENDING'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* QR Code Section - Center Focus */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {/* QR Code Card with Glassmorphism */}
              <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl p-8 text-center">
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  Digital Identity Code
                </h2>
                
                {/* QR Code Container */}
                <div className="relative mx-auto w-64 h-64 mb-6">
                  {/* Glowing Border */}
                  <div 
                    className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-400 to-emerald-500 opacity-75"
                    style={{
                      filter: `blur(${2 + Math.sin(glowIntensity * 0.1) * 3}px)`,
                      transform: `scale(${1 + Math.sin(glowIntensity * 0.05) * 0.02})`
                    }}
                  ></div>
                  
                  {/* QR Code */}
                  <div className="relative bg-white rounded-2xl p-4 shadow-lg">
                    {qrCodeUrl && !isScanning ? (
                      <img 
                        src={qrCodeUrl} 
                        alt="Tourist QR Code" 
                        className="w-full h-full object-contain rounded-xl"
                        style={{
                          filter: `drop-shadow(0 0 ${5 + Math.sin(glowIntensity * 0.1) * 5}px rgba(16, 185, 129, 0.5))`
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl">
                        <div className="animate-spin">
                          <FiRefreshCw className="w-8 h-8 text-green-500" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Verification Checkmark */}
                  {isVerified && (
                    <div className="absolute -top-3 -right-3 bg-green-500 rounded-full p-2 shadow-lg animate-bounce">
                      <FiCheck className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                
                {/* ID Number */}
                <div className="bg-green-50/80 backdrop-blur-md rounded-xl p-4 mb-6">
                  <p className="text-sm text-green-600 font-medium mb-1">Tourist ID</p>
                  <p className="text-lg font-bold text-green-800 font-mono">{touristData.id}</p>
                </div>
                
                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={startVerification}
                    className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <FiCamera className="w-5 h-5" />
                      <span>Verify Identity</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={regenerateQR}
                    className="w-full py-3 bg-white/80 hover:bg-white border border-green-200 text-green-700 font-medium rounded-xl transition-all duration-300"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <FiRefreshCw className="w-4 h-4" />
                      <span>Regenerate Code</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Profile Information Cards */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Personal Information */}
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                <FiUser className="w-5 h-5 text-green-600 mr-3" />
                Personal Information
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-green-50/50 rounded-xl p-4">
                    <label className="text-sm text-green-600 font-medium">Full Name</label>
                    <p className="text-lg font-semibold text-gray-800">{touristData.name}</p>
                  </div>
                  
                  <div className="bg-green-50/50 rounded-xl p-4">
                    <label className="text-sm text-green-600 font-medium flex items-center">
                      <FiFlag className="w-4 h-4 mr-1" />
                      Nationality
                    </label>
                    <p className="text-lg font-semibold text-gray-800">{touristData.nationality}</p>
                  </div>
                  
                  <div className="bg-green-50/50 rounded-xl p-4">
                    <label className="text-sm text-green-600 font-medium">Passport Number</label>
                    <p className="text-lg font-semibold text-gray-800 font-mono">{touristData.passport}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-green-50/50 rounded-xl p-4">
                    <label className="text-sm text-green-600 font-medium flex items-center">
                      <FiPhone className="w-4 h-4 mr-1" />
                      Phone Number
                    </label>
                    <p className="text-lg font-semibold text-gray-800">{touristData.phone}</p>
                  </div>
                  
                  <div className="bg-green-50/50 rounded-xl p-4">
                    <label className="text-sm text-green-600 font-medium flex items-center">
                      <FiMail className="w-4 h-4 mr-1" />
                      Email Address
                    </label>
                    <p className="text-lg font-semibold text-gray-800">{touristData.email}</p>
                  </div>
                  
                  <div className="bg-green-50/50 rounded-xl p-4">
                    <label className="text-sm text-green-600 font-medium">Purpose of Visit</label>
                    <p className="text-lg font-semibold text-gray-800">{touristData.purpose}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Travel Details */}
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                <FiCalendar className="w-5 h-5 text-green-600 mr-3" />
                Travel Details
              </h3>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-green-50/50 rounded-xl p-4">
                  <label className="text-sm text-green-600 font-medium">Check-in Date</label>
                  <p className="text-lg font-semibold text-gray-800">{touristData.checkIn}</p>
                </div>
                
                <div className="bg-green-50/50 rounded-xl p-4">
                  <label className="text-sm text-green-600 font-medium">Check-out Date</label>
                  <p className="text-lg font-semibold text-gray-800">{touristData.checkOut}</p>
                </div>
                
                <div className="bg-green-50/50 rounded-xl p-4">
                  <label className="text-sm text-green-600 font-medium flex items-center">
                    <FiMapPin className="w-4 h-4 mr-1" />
                    Accommodation
                  </label>
                  <p className="text-lg font-semibold text-gray-800">{touristData.hotel}</p>
                </div>
              </div>
            </div>
            
            {/* Security & Status */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <FiShield className="w-5 h-5 text-green-600 mr-3" />
                  Security Status
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Verification Level</span>
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        {[1, 2, 3].map(star => (
                          <FiStar key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <span className="text-green-600 font-semibold">{touristData.verificationLevel}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Risk Assessment</span>
                    <span className="text-green-600 font-semibold">{touristData.riskLevel}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Account Status</span>
                    <span className="text-green-600 font-semibold">{touristData.status}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <FiClock className="w-5 h-5 text-green-600 mr-3" />
                  Recent Activity
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm text-gray-600">QR Code accessed</span>
                    <span className="text-xs text-gray-400 ml-auto">Just now</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-sm text-gray-600">Location updated</span>
                    <span className="text-xs text-gray-400 ml-auto">5 min ago</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="text-sm text-gray-600">Profile verified</span>
                    <span className="text-xs text-gray-400 ml-auto">1 hour ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Verification Modal */}
      {showVerification && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {verificationStep < 4 ? (
                    <div className="animate-spin">
                      <FiRefreshCw className="w-8 h-8 text-green-600" />
                    </div>
                  ) : (
                    <FiCheck className="w-8 h-8 text-green-600" />
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Identity Verification
                </h3>
                
                <p className="text-gray-600">
                  {verificationStep === 1 && 'Scanning QR Code...'}
                  {verificationStep === 2 && 'Validating Identity...'}
                  {verificationStep === 3 && 'Checking Database...'}
                  {verificationStep === 4 && 'Verification Complete!'}
                </p>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(verificationStep / 4) * 100}%` }}
                ></div>
              </div>
              
              {verificationStep === 4 && (
                <div className="bg-green-50 rounded-xl p-4">
                  <p className="text-green-800 font-semibold">
                    ✓ Identity successfully verified!
                  </p>
                  <p className="text-green-600 text-sm mt-1">
                    All security checks passed.
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