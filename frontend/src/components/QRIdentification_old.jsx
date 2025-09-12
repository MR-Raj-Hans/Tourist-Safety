import React, { useState, useEffect } from 'react';
import { FiUser, FiMapPin, FiPhone, FiMail, FiCalendar, FiFlag, FiCheck, FiCamera, FiRefreshCw } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import QRCode from 'qrcode';

const QRIdentification = () => {
  const { t } = useTranslation();
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Mock tourist data
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
    emergencyContact: 'Jane Smith (+1-555-0456)',
    riskLevel: 'Low',
    location: 'Times Square, NY'
  };

  // Generate QR Code
  useEffect(() => {
    const generateQR = async () => {
      try {
        const qrData = JSON.stringify({
          touristId: touristData.id,
          name: touristData.name,
          nationality: touristData.nationality,
          phone: touristData.phone,
          location: touristData.location,
          timestamp: new Date().toISOString()
        });
        
        const qrUrl = await QRCode.toDataURL(qrData, {
          width: 256,
          margin: 2,
          color: {
            dark: '#10B981',
            light: '#FFFFFF'
          }
        });
        setQrCodeUrl(qrUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    generateQR();
  }, [touristData]);

  const handleVerification = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setShowVerification(true);
      setTimeout(() => {
        setIsVerified(true);
      }, 500);
    }, 2000);
  };

  const resetVerification = () => {
    setIsVerified(false);
    setShowVerification(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-gray-900 to-teal-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            {t('Digital Tourist ID')}
          </h1>
          <p className="text-emerald-200">
            {t('Official identification for safe tourism')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* QR Code Section */}
          <div className="relative">
            {/* Glassmorphism Container */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl">
              {/* QR Code Display */}
              <div className="text-center">
                <div className="relative inline-block mb-6">
                  {/* Glowing Border */}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-400 rounded-2xl blur-md opacity-70 animate-pulse"></div>
                  
                  {/* QR Code Container */}
                  <div className="relative bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-white/30">
                    {qrCodeUrl ? (
                      <img 
                        src={qrCodeUrl} 
                        alt="Tourist QR Code" 
                        className="w-64 h-64 mx-auto rounded-lg shadow-lg"
                      />
                    ) : (
                      <div className="w-64 h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ID Badge */}
                <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-sm border border-emerald-400/30 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-emerald-300 font-mono text-lg">
                      ID: {touristData.id}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center space-x-4">
                  <button 
                    onClick={handleVerification}
                    disabled={isScanning}
                    className="bg-emerald-600/80 hover:bg-emerald-600 disabled:opacity-50 text-white px-6 py-3 rounded-xl backdrop-blur-sm border border-emerald-500/30 transition-all duration-300 flex items-center space-x-2"
                  >
                    {isScanning ? (
                      <>
                        <FiRefreshCw className="w-5 h-5 animate-spin" />
                        <span>{t('Scanning...')}</span>
                      </>
                    ) : (
                      <>
                        <FiCamera className="w-5 h-5" />
                        <span>{t('Verify ID')}</span>
                      </>
                    )}
                  </button>
                  
                  <button 
                    onClick={resetVerification}
                    className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-300"
                  >
                    {t('Reset')}
                  </button>
                </div>
              </div>
            </div>

            {/* Verification Overlay */}
            {showVerification && (
              <div className="absolute inset-0 bg-emerald-900/90 backdrop-blur-md rounded-3xl flex items-center justify-center z-10">
                <div className="text-center text-white">
                  <div className={`w-24 h-24 mx-auto mb-4 rounded-full border-4 flex items-center justify-center transition-all duration-500 ${
                    isVerified 
                      ? 'border-emerald-400 bg-emerald-500/20' 
                      : 'border-yellow-400 bg-yellow-500/20'
                  }`}>
                    {isVerified ? (
                      <FiCheck className="w-12 h-12 text-emerald-400 animate-bounce" />
                    ) : (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold mb-2">
                    {isVerified ? t('Verification Successful') : t('Verifying...')}
                  </h3>
                  <p className="text-emerald-200">
                    {isVerified 
                      ? t('Identity confirmed and registered') 
                      : t('Please wait while we verify your identity')
                    }
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Tourist Information Section */}
          <div className="space-y-6">
            {/* Personal Information Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
                <FiUser className="w-6 h-6 text-emerald-400" />
                <span>{t('Personal Information')}</span>
                {isVerified && (
                  <div className="ml-auto">
                    <div className="flex items-center space-x-2 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm">
                      <FiCheck className="w-4 h-4" />
                      <span>{t('Verified')}</span>
                    </div>
                  </div>
                )}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <FiUser className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-200 text-sm">{t('Full Name')}</span>
                  </div>
                  <p className="text-white font-medium">{touristData.name}</p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <FiFlag className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-200 text-sm">{t('Nationality')}</span>
                  </div>
                  <p className="text-white font-medium">{touristData.nationality}</p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <FiPhone className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-200 text-sm">{t('Phone')}</span>
                  </div>
                  <p className="text-white font-medium">{touristData.phone}</p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <FiMail className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-200 text-sm">{t('Email')}</span>
                  </div>
                  <p className="text-white font-medium">{touristData.email}</p>
                </div>
              </div>
            </div>

            {/* Visit Information Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
                <FiCalendar className="w-6 h-6 text-teal-400" />
                <span>{t('Visit Information')}</span>
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
                  <span className="text-teal-200">{t('Check-in Date')}</span>
                  <span className="text-white font-medium">{touristData.checkIn}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
                  <span className="text-teal-200">{t('Check-out Date')}</span>
                  <span className="text-white font-medium">{touristData.checkOut}</span>
                </div>

                <div className="flex justify-between items-center p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
                  <span className="text-teal-200">{t('Accommodation')}</span>
                  <span className="text-white font-medium">{touristData.hotel}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <FiMapPin className="w-4 h-4 text-teal-400" />
                    <span className="text-teal-200">{t('Current Location')}</span>
                  </div>
                  <span className="text-white font-medium">{touristData.location}</span>
                </div>
              </div>
            </div>

            {/* Security Status Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
                <div className="w-6 h-6 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full flex items-center justify-center">
                  <FiCheck className="w-4 h-4 text-white" />
                </div>
                <span>{t('Security Status')}</span>
              </h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-emerald-500/20 border border-emerald-400/30 rounded-xl">
                  <span className="text-emerald-200">{t('Risk Level')}</span>
                  <span className="text-emerald-400 font-bold">{touristData.riskLevel}</span>
                </div>
                
                <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                  <div className="text-gray-300 text-sm mb-1">{t('Emergency Contact')}</div>
                  <div className="text-white font-medium">{touristData.emergencyContact}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Verification Badge */}
      {isVerified && (
        <div className="fixed bottom-8 right-8 z-50">
          <div className="bg-emerald-500 text-white p-4 rounded-full shadow-2xl animate-bounce">
            <FiCheck className="w-8 h-8" />
          </div>
        </div>
      )}
    </div>
  );
};

export default QRIdentification;