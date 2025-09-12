import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { FiDownload, FiRefreshCw, FiClock, FiMapPin, FiShare2 } from 'react-icons/fi';
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
        location_name: locationName || 'Current Location',
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
    <div className="space-y-6">
      {/* QR Generation Form */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-gray-800">
            {t('qr.title', 'Generate Safety QR Code')}
          </h2>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('qr.form.locationName', 'Location Name (Optional)')}
              </label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder={t('qr.form.locationPlaceholder', 'e.g., Hotel Lobby, Tourist Center')}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('qr.form.expiry', 'Expiry Time')}
              </label>
              <select
                value={expiryHours}
                onChange={(e) => setExpiryHours(parseInt(e.target.value))}
                className="input-field"
              >
                <option value={1}>{t('qr.form.expiry1h', '1 Hour')}</option>
                <option value={6}>{t('qr.form.expiry6h', '6 Hours')}</option>
                <option value={12}>{t('qr.form.expiry12h', '12 Hours')}</option>
                <option value={24}>{t('qr.form.expiry24h', '24 Hours')}</option>
                <option value={48}>{t('qr.form.expiry48h', '2 Days')}</option>
                <option value={168}>{t('qr.form.expiry1w', '1 Week')}</option>
              </select>
            </div>

            {userLocation && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center text-blue-800">
                  <FiMapPin className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">
                    {t('qr.currentLocation', 'Current Location')}
                  </span>
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}
                </div>
              </div>
            )}

            <button
              onClick={generateQR}
              disabled={isLoading || !userLocation}
              className="btn-primary w-full flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="spinner w-4 h-4 mr-2"></div>
                  {t('qr.generating', 'Generating...')}
                </>
              ) : (
                <>
                  <FiRefreshCw className="h-4 w-4 mr-2" />
                  {t('qr.generate', 'Generate QR Code')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Current QR Code Display */}
      {qrData && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-800">
              {t('qr.current.title', 'Your Current QR Code')}
            </h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* QR Code */}
              <div className="flex-shrink-0">
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                  <div id="qr-code">
                    <QRCodeSVG
                      value={JSON.stringify(qrData.qr_data)}
                      size={200}
                      level="M"
                      includeMargin={true}
                    />
                  </div>
                </div>
              </div>

              {/* QR Info */}
              <div className="flex-grow space-y-4">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">
                    {t('qr.current.info', 'QR Code Information')}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <FiMapPin className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{qrData.location_name}</span>
                    </div>
                    <div className="flex items-center">
                      <FiClock className="h-4 w-4 mr-2 text-gray-500" />
                      <span>
                        {isExpired(qrData.expires_at) ? (
                          <span className="text-red-600 font-medium">
                            {t('qr.status.expired', 'Expired')}
                          </span>
                        ) : (
                          <span className="text-green-600 font-medium">
                            {t('qr.status.expiresIn', 'Expires in {{time}}', { 
                              time: formatTimeRemaining(qrData.expires_at) 
                            })}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {t('qr.current.created', 'Created')}: {new Date(qrData.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={downloadQR}
                    className="btn-secondary flex items-center"
                  >
                    <FiDownload className="h-4 w-4 mr-1" />
                    {t('qr.actions.download', 'Download')}
                  </button>
                  <button
                    onClick={shareQR}
                    className="btn-secondary flex items-center"
                  >
                    <FiShare2 className="h-4 w-4 mr-1" />
                    {t('qr.actions.share', 'Share')}
                  </button>
                </div>

                {/* Usage Instructions */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-gray-800 mb-2">
                    {t('qr.instructions.title', 'How to use:')}
                  </h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• {t('qr.instructions.show', 'Show this QR code to police or authorities when requested')}</li>
                    <li>• {t('qr.instructions.contains', 'Contains your contact information and current location')}</li>
                    <li>• {t('qr.instructions.expires', 'QR code expires automatically for security')}</li>
                    <li>• {t('qr.instructions.generate', 'Generate a new code when this one expires')}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR History */}
      {qrHistory.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-800">
              {t('qr.history.title', 'QR Code History')}
            </h3>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              {qrHistory.slice(0, 5).map((qr) => (
                <div
                  key={qr.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-gray-800">
                      {qr.location_name || t('qr.history.noLocation', 'No location name')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {t('qr.history.created', 'Created')}: {new Date(qr.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${
                      isExpired(qr.expires_at) ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {isExpired(qr.expires_at) 
                        ? t('qr.status.expired', 'Expired')
                        : t('qr.status.active', 'Active')
                      }
                    </div>
                    <div className="text-xs text-gray-500">
                      {t('qr.history.scans', 'Scans')}: {qr.scan_count}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRGenerator;