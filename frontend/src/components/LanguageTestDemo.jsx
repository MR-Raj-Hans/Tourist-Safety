import React from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const LanguageTestDemo = () => {
  const { t, i18n } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with Language Switcher */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">
              {t('navbar.title', 'Trana')} - Language Test
            </h1>
            <LanguageSwitcher />
          </div>
          <p className="text-white/80 mt-2">
            Current Language: <span className="font-bold text-yellow-300">{i18n.language}</span>
          </p>
        </div>

        {/* Test Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Navigation Test */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">Navigation</h2>
            <ul className="space-y-2 text-white/90">
              <li>• {t('navbar.dashboard', 'Dashboard')}</li>
              <li>• {t('navbar.emergency', 'Emergency')}</li>
              <li>• {t('navbar.qr', 'My QR')}</li>
              <li>• {t('navbar.alerts', 'My Alerts')}</li>
              <li>• {t('navbar.profile', 'Profile')}</li>
              <li>• {t('navbar.logout', 'Logout')}</li>
            </ul>
          </div>

          {/* Dashboard Test */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">Dashboard</h2>
            <div className="space-y-2 text-white/90">
              <p><strong>{t('dashboard.welcome', 'Welcome to Trana')}</strong></p>
              <p>{t('dashboard.subtitle', 'Your safety is our priority')}</p>
              <p>{t('dashboard.location', 'Location')}: {t('dashboard.enabled', 'Enabled')}</p>
              <p>{t('dashboard.emergency', 'Emergency Control')}</p>
            </div>
          </div>

          {/* Features Test */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">Features</h2>
            <div className="space-y-2 text-white/90 text-sm">
              <p><strong>{t('features.emergency', 'Emergency Alerts')}</strong></p>
              <p>{t('features.emergencyDesc', 'Instant panic button')}</p>
              <p><strong>{t('features.qr', 'QR Identification')}</strong></p>
              <p>{t('features.qrDesc', 'Dynamic QR codes')}</p>
              <p><strong>{t('features.location', 'Location Tracking')}</strong></p>
              <p>{t('features.locationDesc', 'Real-time GPS tracking')}</p>
            </div>
          </div>

          {/* Common Elements Test */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">Common Elements</h2>
            <div className="space-y-3">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                {t('common.save', 'Save')}
              </button>
              <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors ml-2">
                {t('common.cancel', 'Cancel')}
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors ml-2">
                {t('common.refresh', 'Refresh')}
              </button>
              <p className="text-white/80 mt-3">
                {t('common.loading', 'Loading...')}
              </p>
            </div>
          </div>
        </div>

        {/* Language Test Instructions */}
        <div className="bg-yellow-500/20 backdrop-blur-lg rounded-xl p-6 mt-8 border border-yellow-400/30">
          <h3 className="text-lg font-bold text-yellow-200 mb-3">🧪 Language Test Instructions</h3>
          <div className="text-yellow-100 space-y-2 text-sm">
            <p>1. Click the language dropdown in the top-right corner</p>
            <p>2. Select "🇮🇳 हिंदी (Hindi)" - All text should change to Hindi</p>
            <p>3. Try other languages: Tamil, Telugu, Bengali</p>
            <p>4. Check that the language preference is saved when you refresh</p>
            <p>5. Open browser console (F12) to see language change logs</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageTestDemo;