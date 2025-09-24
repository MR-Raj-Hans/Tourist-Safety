import React, { useState } from 'react';
import { FiGlobe, FiChevronDown, FiInfo } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = ({ showFooter = false }) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const changeLanguage = (languageCode) => {
    i18n.changeLanguage(languageCode);
    localStorage.setItem('selectedLanguage', languageCode);
    setIsOpen(false);
  };

  const languageMap = {
    'en': 'English',
    'hi': 'हिंदी',
    'ta': 'தமிழ்',
    'te': 'తెలుগు',
    'bn': 'বাংলা',
    'es': 'Español'
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center premium-text hover:premium-text-gold premium-glass-enhanced px-3 sm:px-4 py-2 rounded-2xl text-xs sm:text-sm font-medium transition-all duration-300 touch-manipulation min-w-0"
      >
        <FiGlobe className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
        <span className="font-semibold hidden sm:inline">{languageMap[i18n.language] || 'EN'}</span>
        <span className="font-semibold sm:hidden">{i18n.language.toUpperCase()}</span>
        <FiChevronDown className={`h-3 w-3 sm:h-4 sm:w-4 ml-1 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          width: '200px',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '8px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          zIndex: 999999
        }}>
          <button onClick={() => changeLanguage('en')} style={{ width: '100%', textAlign: 'left', padding: '8px 12px', backgroundColor: 'transparent', border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>🇺🇸 English</button>
          <button onClick={() => changeLanguage('hi')} style={{ width: '100%', textAlign: 'left', padding: '8px 12px', backgroundColor: 'transparent', border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>🇮🇳 हिंदी</button>
          <button onClick={() => changeLanguage('ta')} style={{ width: '100%', textAlign: 'left', padding: '8px 12px', backgroundColor: 'transparent', border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>🇮🇳 தமிழ்</button>
          <button onClick={() => changeLanguage('te')} style={{ width: '100%', textAlign: 'left', padding: '8px 12px', backgroundColor: 'transparent', border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>🇮🇳 తెలుగు</button>
          <button onClick={() => changeLanguage('bn')} style={{ width: '100%', textAlign: 'left', padding: '8px 12px', backgroundColor: 'transparent', border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>🇮🇳 বাংলা</button>
          <button onClick={() => changeLanguage('es')} style={{ width: '100%', textAlign: 'left', padding: '8px 12px', backgroundColor: 'transparent', border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>🇪🇸 Español</button>
        </div>
      )}
      
      {isOpen && <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999998 }} onClick={() => setIsOpen(false)} />}

      {/* Language Switcher Footer */}
      {showFooter && (
        <div className="mt-4 p-3 premium-glass-subtle rounded-xl border border-white/10">
          <div className="flex items-start gap-3">
            <FiInfo className="h-4 w-4 premium-text-gold mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold premium-text mb-1">
                Multi-Language Support
              </h4>
              <p className="text-xs premium-text-dim leading-relaxed mb-2">
                Choose your preferred language for the best experience. All content and interface elements will be translated to your selected language.
              </p>
              <div className="text-xs premium-text-dim">
                <div className="mb-1">
                  <span className="font-medium">Current Language:</span> {languageMap[i18n.language] || 'English'}
                </div>
                <div className="mb-1">
                  <span className="font-medium">Supported Languages:</span> {Object.keys(languageMap).length}
                </div>
                <div className="text-xs premium-text-gold font-medium">
                  🌐 Tourist Safety System • Language Pack v2.0
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;