import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { FiDownload, FiRefreshCw, FiClock, FiMapPin, FiShare2, FiGrid, FiUsers, FiShield } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { qrAPI } from '../services/api';
import { toast } from 'react-toastify';

const QRGenerator = ({ userLocation }) => {
  const [qrData, setQrData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [locationName, setLocationName] = useState('');
  const [expiryHours, setExpiryHours] = useState(24);
  const [qrHistory, setQrHistory] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    loadCurrentQR();
    loadQRHistory();
  }, []);

  const loadCurrentQR = async () => {
    try {
      const response = await qrAPI.getCurrentQR();
      setQrData(response.data.data);
    } catch (error) {
      // No current QR code or expired
      console.log('No current QR code available');
    }
  };

  const loadQRHistory = async () => {
    try {
      const response = await qrAPI.getQRHistory();
      setQrHistory(response.data.data);
    } catch (error) {
      console.error('Error loading QR history:', error);
    }
  };

  const generateQR = async () => {
    if (!userLocation) {
      toast.error(t('qr.errors.noLocation', 'Location not available. Please enable location services.'));
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await qrAPI.generateQR({
        location_name: locationName || 'Bengaluru, Karnataka, India',
        expires_in_hours: expiryHours
      });
      
      setQrData(response.data.data);
      await loadQRHistory(); // Refresh history
      
      toast.success(t('qr.success.generated', 'QR code generated successfully!'));
    } catch (error) {
      console.error('Error generating QR:', error);
      toast.error(
        error.response?.data?.message || 
        t('qr.errors.generation', 'Failed to generate QR code. Please try again.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  const downloadQR = () => {
    if (!qrData) return;

    const canvas = document.createElement('canvas');
    const svg = document.querySelector('#qr-code svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      const link = document.createElement('a');
      link.download = `qr-code-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL();
      link.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const shareQR = async () => {
    if (!qrData) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: t('qr.share.title', 'My Safety QR Code'),
          text: t('qr.share.text', 'Here is my current location and contact information for safety purposes.'),
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(JSON.stringify(qrData.qr_data));
      toast.success(t('qr.share.copied', 'QR data copied to clipboard!'));
    }
  };

  const isExpired = (expiresAt) => {
    return new Date(expiresAt) <= new Date();
  };

  const formatTimeRemaining = (expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry - now;
    
    if (diff <= 0) return t('qr.status.expired', 'Expired');
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return t('qr.status.hoursMinutes', '{{hours}}h {{minutes}}m', { hours, minutes });
    }
    return t('qr.status.minutes', '{{minutes}}m', { minutes });
  };

  return (
    <div className="min-h-screen bg-gradient-aurora p-4 relative overflow-hidden">
      {/* Luxurious Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/30 via-transparent to-purple-900/30"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(124, 58, 237, 0.15) 0%, transparent 50%), 
                           radial-gradient(circle at 75% 75%, rgba(236, 72, 153, 0.15) 0%, transparent 50%),
                           radial-gradient(circle at 50% 100%, rgba(251, 191, 36, 0.1) 0%, transparent 50%)`
        }}></div>
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 premium-glass-enhanced rounded-lg border border-white/30">
              <FiGrid className="w-8 h-8 premium-text-gold" />
            </div>
            <h1 className="text-4xl font-bold premium-text-bold">
              {t('qr.title', 'QR Code Generator')}
            </h1>
          </div>
          <p className="premium-text text-lg">
            Generate secure QR codes for tourist identification and emergency access
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* QR Generation Form */}
          <div className="space-y-6">
            <div className="premium-glass-enhanced p-6">
              <h2 className="text-2xl font-bold premium-text-bold mb-6 flex items-center">
                <FiGrid className="mr-3 premium-text-gold" />
                Generate New QR Code
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block premium-text font-medium mb-2">
                    {t('qr.form.locationName', 'Location Name (Optional)')}
                  </label>
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder={t('qr.form.locationPlaceholder', 'e.g., Bengaluru Palace, Mysore Palace, Hampi Temple')}
                    className="w-full p-3 premium-glass-enhanced rounded-xl premium-text placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block premium-text font-medium mb-2">
                    {t('qr.form.expiry', 'Expiry Time')}
                  </label>
                  <select
                    value={expiryHours}
                    onChange={(e) => setExpiryHours(parseInt(e.target.value))}
                    className="w-full p-3 premium-glass-enhanced rounded-xl premium-text focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all"
                  >
                    <option value={1} className="bg-gray-800 text-white">{t('qr.form.expiry1h', '1 Hour')}</option>
                    <option value={6} className="bg-gray-800 text-white">{t('qr.form.expiry6h', '6 Hours')}</option>
                    <option value={12} className="bg-gray-800 text-white">{t('qr.form.expiry12h', '12 Hours')}</option>
                    <option value={24} className="bg-gray-800 text-white">{t('qr.form.expiry24h', '24 Hours')}</option>
                    <option value={48} className="bg-gray-800 text-white">{t('qr.form.expiry48h', '2 Days')}</option>
                    <option value={168} className="bg-gray-800 text-white">{t('qr.form.expiry1w', '1 Week')}</option>
                  </select>
                </div>

                {userLocation && (
                  <div className="p-4 bg-emerald-500/20 border border-emerald-400/30 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center text-emerald-300 mb-2">
                      <FiMapPin className="w-4 h-4 mr-2" />
                      <span className="font-medium">{t('qr.currentLocation', 'Current Location')}</span>
                    </div>
                    <div className="text-emerald-200 text-sm font-mono bg-black/20 p-2 rounded">
                      {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}
                    </div>
                  </div>
                )}

                <button
                  onClick={generateQR}
                  disabled={isLoading || !userLocation}
                  className="w-full py-4 bg-gradient-to-r from-sapphire-600 to-blue-700 hover:from-sapphire-500 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 hover:scale-105 shadow-xl"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{t('qr.generating', 'Generating...')}</span>
                    </>
                  ) : (
                    <>
                      <FiRefreshCw className="w-5 h-5" />
                      <span>{t('qr.generate', 'Generate QR Code')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Features Info */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-white mb-4 glow-text flex items-center">
                <FiShield className="mr-2 text-emerald-300" />
                Security Features
              </h3>
              <div className="space-y-3 text-white/80">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2"></div>
                  <p className="text-sm">Auto-expiring QR codes for enhanced security</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-sapphire-400 rounded-full mt-2"></div>
                  <p className="text-sm">Contains encrypted contact and location data</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-gold-400 rounded-full mt-2"></div>
                  <p className="text-sm">Scannable by authorities for quick identification</p>
                </div>
              </div>
            </div>
          </div>

          {/* Current QR Code Display */}
          <div className="space-y-6 animate-slide-in animate-delay-400">
            {qrData ? (
              <div className="glass-card p-6">
                <h3 className="text-2xl font-bold text-white mb-6 glow-text">
                  {t('qr.current.title', 'Your Current QR Code')}
                </h3>
                
                <div className="flex flex-col items-center space-y-6">
                  {/* QR Code */}
                  <div className="p-6 bg-white rounded-2xl shadow-2xl">
                    <div id="qr-code">
                      <QRCodeSVG
                        value={JSON.stringify(qrData.qr_data)}
                        size={200}
                        level="M"
                        includeMargin={true}
                      />
                    </div>
                  </div>

                  {/* QR Info */}
                  <div className="w-full space-y-4">
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                      <div className="flex items-center space-x-2 mb-2">
                        <FiMapPin className="w-4 h-4 text-emerald-300" />
                        <span className="text-white font-medium">{qrData.location_name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FiClock className="w-4 h-4 text-sapphire-300" />
                        <span className={`font-medium ${
                          isExpired(qrData.expires_at) ? 'text-red-300' : 'text-emerald-300'
                        }`}>
                          {isExpired(qrData.expires_at) ? (
                            t('qr.status.expired', 'Expired')
                          ) : (
                            t('qr.status.expiresIn', 'Expires in {{time}}', { 
                              time: formatTimeRemaining(qrData.expires_at) 
                            })
                          )}
                        </span>
                      </div>
                      <div className="text-white/60 text-sm mt-2">
                        {t('qr.current.created', 'Created')}: {new Date(qrData.created_at).toLocaleString()}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <button
                        onClick={downloadQR}
                        className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-medium rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 hover:scale-105"
                      >
                        <FiDownload className="w-4 h-4" />
                        <span>{t('qr.actions.download', 'Download')}</span>
                      </button>
                      <button
                        onClick={shareQR}
                        className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-medium rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 hover:scale-105"
                      >
                        <FiShare2 className="w-4 h-4" />
                        <span>{t('qr.actions.share', 'Share')}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Usage Instructions */}
                <div className="mt-6 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                  <h5 className="text-white font-bold mb-3 glow-text">
                    {t('qr.instructions.title', 'How to use:')}
                  </h5>
                  <ul className="text-white/70 space-y-2 text-sm">
                    <li className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-sapphire-400 rounded-full mt-2"></div>
                      <span>{t('qr.instructions.show', 'Show this QR code to police or authorities when requested')}</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2"></div>
                      <span>{t('qr.instructions.contains', 'Contains your contact information and current location')}</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-gold-400 rounded-full mt-2"></div>
                      <span>{t('qr.instructions.expires', 'QR code expires automatically for security')}</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2"></div>
                      <span>{t('qr.instructions.generate', 'Generate a new code when this one expires')}</span>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="glass-card p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-sapphire-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FiGrid className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 glow-text">No QR Code Generated</h3>
                <p className="text-white/70">
                  Create your first QR code using the form on the left
                </p>
              </div>
            )}

            {/* QR History */}
            {qrHistory.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-white mb-4 glow-text flex items-center">
                  <FiUsers className="mr-2 text-gold-300" />
                  {t('qr.history.title', 'QR Code History')}
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                  {qrHistory.slice(0, 5).map((qr) => (
                    <div
                      key={qr.id}
                      className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 transition-all"
                    >
                      <div>
                        <div className="text-white font-medium">
                          {qr.location_name || t('qr.history.noLocation', 'No location name')}
                        </div>
                        <div className="text-white/60 text-sm">
                          {t('qr.history.created', 'Created')}: {new Date(qr.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${
                          isExpired(qr.expires_at) ? 'text-red-300' : 'text-emerald-300'
                        }`}>
                          {isExpired(qr.expires_at) 
                            ? t('qr.status.expired', 'Expired')
                            : t('qr.status.active', 'Active')
                          }
                        </div>
                        <div className="text-white/60 text-xs">
                          {t('qr.history.scans', 'Scans')}: {qr.scan_count}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(1deg); }
          66% { transform: translateY(-10px) rotate(-1deg); }
        }
        @keyframes float-slower {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(0.5deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        .animate-float-slower {
          animation: float-slower 10s ease-in-out infinite;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
};

export default QRGenerator;