import React, { useState, useEffect } from 'react';
import { FiGlobe, FiMessageCircle, FiMic, FiVolume2, FiRefreshCw, FiCheck, FiSend } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const MultiLanguageSupport = () => {
  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [inputText, setInputText] = useState('');
  const [globeRotation, setGlobeRotation] = useState(0);
  const [isListening, setIsListening] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
    { code: 'fr', name: 'French', flag: '🇫🇷', nativeName: 'Français' },
    { code: 'de', name: 'German', flag: '🇩🇪', nativeName: 'Deutsch' },
    { code: 'it', name: 'Italian', flag: '🇮🇹', nativeName: 'Italiano' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹', nativeName: 'Português' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺', nativeName: 'Русский' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳', nativeName: '中文' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵', nativeName: '日本語' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷', nativeName: '한국어' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦', nativeName: 'العربية' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳', nativeName: 'हिन्दी' }
  ];

  // Sample conversation data
  const sampleMessages = [
    {
      id: 1,
      original: "Hello! I need help finding the nearest hospital.",
      translated: "¡Hola! Necesito ayuda para encontrar el hospital más cercano.",
      from: 'en',
      to: 'es',
      isUser: true,
      timestamp: '2:30 PM'
    },
    {
      id: 2,
      original: "El hospital más cercano está a 5 minutos caminando. ¿Necesita una ambulancia?",
      translated: "The nearest hospital is a 5-minute walk. Do you need an ambulance?",
      from: 'es',
      to: 'en',
      isUser: false,
      timestamp: '2:31 PM'
    }
  ];

  // Globe rotation animation
  useEffect(() => {
    const interval = setInterval(() => {
      setGlobeRotation(prev => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Initialize with sample conversation
  useEffect(() => {
    setConversation(sampleMessages);
  }, []);

  const translateMessage = async (text, fromLang, toLang) => {
    setIsTranslating(true);
    
    // Simulate translation delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock translation responses
    const translations = {
      'Hello! How can I help you?': {
        'es': '¡Hola! ¿Cómo puedo ayudarte?',
        'fr': 'Bonjour! Comment puis-je vous aider?',
        'de': 'Hallo! Wie kann ich dir helfen?',
        'zh': '你好！我可以怎样帮助你？'
      },
      'Where is the nearest police station?': {
        'es': '¿Dónde está la estación de policía más cercana?',
        'fr': 'Où est le poste de police le plus proche?',
        'de': 'Wo ist die nächste Polizeistation?',
        'zh': '最近的警察局在哪里？'
      }
    };

    const translated = translations[text]?.[toLang] || `[${toLang.toUpperCase()}] ${text}`;
    setIsTranslating(false);
    return translated;
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const targetLang = selectedLanguage === 'en' ? 'es' : 'en';
    
    const newMessage = {
      id: Date.now(),
      original: inputText,
      translated: await translateMessage(inputText, selectedLanguage, targetLang),
      from: selectedLanguage,
      to: targetLang,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setConversation(prev => [...prev, newMessage]);
    setInputText('');
  };

  const changeLanguage = (langCode) => {
    setSelectedLanguage(langCode);
    i18n.changeLanguage(langCode);
  };

  const FloatingGlobe = () => (
    <div className="relative w-32 h-32 mx-auto mb-6">
      {/* Outer glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-yellow-400 rounded-full blur-md opacity-30 animate-pulse"></div>
      
      {/* Globe container */}
      <div 
        className="relative w-32 h-32 bg-gradient-to-br from-blue-500 via-green-500 to-blue-600 rounded-full shadow-2xl"
        style={{
          transform: `rotate(${globeRotation}deg)`,
          background: `conic-gradient(from ${globeRotation}deg, #3B82F6, #10B981, #F59E0B, #3B82F6)`
        }}
      >
        {/* Globe surface details */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-400/30 to-transparent"></div>
        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-white/10 to-transparent"></div>
        
        {/* Globe icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <FiGlobe className="w-12 h-12 text-white drop-shadow-lg" />
        </div>

        {/* Orbiting elements */}
        {languages.slice(0, 6).map((lang, index) => (
          <div
            key={lang.code}
            className="absolute w-6 h-6 bg-white/90 rounded-full flex items-center justify-center text-xs shadow-lg"
            style={{
              top: `${50 + Math.sin((globeRotation + index * 60) * Math.PI / 180) * 35}%`,
              left: `${50 + Math.cos((globeRotation + index * 60) * Math.PI / 180) * 35}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            {lang.flag}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-900/30 via-blue-900/20 to-white/10 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <FloatingGlobe />
          <h1 className="text-4xl font-bold text-white mb-2">
            {t('Multi-Language Support')}
          </h1>
          <p className="text-gray-300">
            {t('Real-time translation for seamless communication')}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Language Selector */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 h-full">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-3">
                <FiGlobe className="w-6 h-6 text-yellow-400" />
                <span>{t('Select Language')}</span>
              </h2>

              <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                {languages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => changeLanguage(language.code)}
                    className={`w-full p-3 rounded-xl transition-all duration-300 flex items-center space-x-3 ${
                      selectedLanguage === language.code
                        ? 'bg-gradient-to-r from-yellow-500/30 to-blue-500/30 border border-yellow-400/50 text-white'
                        : 'bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white'
                    }`}
                  >
                    <span className="text-2xl">{language.flag}</span>
                    <div className="flex-1 text-left">
                      <div className="font-medium">{language.nativeName}</div>
                      <div className="text-sm opacity-70">{language.name}</div>
                    </div>
                    {selectedLanguage === language.code && (
                      <FiCheck className="w-5 h-5 text-yellow-400" />
                    )}
                  </button>
                ))}
              </div>

              {/* Voice Controls */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => setIsListening(!isListening)}
                  className={`w-full p-3 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 ${
                    isListening
                      ? 'bg-red-500/20 border border-red-400/50 text-red-400'
                      : 'bg-blue-500/20 border border-blue-400/50 text-blue-400 hover:bg-blue-500/30'
                  }`}
                >
                  <FiMic className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
                  <span>{isListening ? t('Stop Listening') : t('Voice Input')}</span>
                </button>

                <button className="w-full p-3 rounded-xl bg-green-500/20 border border-green-400/50 text-green-400 hover:bg-green-500/30 transition-all duration-300 flex items-center justify-center space-x-2">
                  <FiVolume2 className="w-5 h-5" />
                  <span>{t('Text to Speech')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Translation Chat */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 h-full">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-3">
                <FiMessageCircle className="w-6 h-6 text-blue-400" />
                <span>{t('Real-time Translation')}</span>
                {isTranslating && (
                  <div className="ml-auto flex items-center space-x-2 text-yellow-400">
                    <FiRefreshCw className="w-4 h-4 animate-spin" />
                    <span className="text-sm">{t('Translating...')}</span>
                  </div>
                )}
              </h2>

              {/* Chat Messages */}
              <div className="h-96 overflow-y-auto space-y-4 mb-6 custom-scrollbar">
                {conversation.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-sm space-y-2 ${message.isUser ? 'items-end' : 'items-start'} flex flex-col`}>
                      {/* Original Message */}
                      <div className={`p-4 rounded-2xl ${
                        message.isUser
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-sm'
                          : 'bg-white/20 text-white rounded-bl-sm'
                      }`}>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-xs opacity-70">
                            {languages.find(l => l.code === message.from)?.flag}
                          </span>
                          <span className="text-xs opacity-70 uppercase">{message.from}</span>
                        </div>
                        <p className="text-sm">{message.original}</p>
                      </div>

                      {/* Translated Message */}
                      <div className={`p-4 rounded-2xl border-2 border-dashed ${
                        message.isUser
                          ? 'border-yellow-400/50 bg-yellow-500/10 text-yellow-100 rounded-br-sm'
                          : 'border-green-400/50 bg-green-500/10 text-green-100 rounded-bl-sm'
                      }`}>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-xs opacity-70">
                            {languages.find(l => l.code === message.to)?.flag}
                          </span>
                          <span className="text-xs opacity-70 uppercase">{message.to}</span>
                          <FiRefreshCw className="w-3 h-3 opacity-50" />
                        </div>
                        <p className="text-sm">{message.translated}</p>
                      </div>

                      <span className="text-xs text-gray-400">{message.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <div className="flex space-x-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={t('Type your message...')}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                    <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                      {languages.find(l => l.code === selectedLanguage)?.flag}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isTranslating}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 text-white px-6 py-3 rounded-xl transition-all duration-300"
                >
                  <FiSend className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Phrases */}
              <div className="mt-4">
                <p className="text-gray-400 text-sm mb-2">{t('Quick Phrases:')}</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Hello! How can I help you?',
                    'Where is the nearest police station?',
                    'I need medical assistance',
                    'Can you call emergency services?'
                  ].map((phrase, index) => (
                    <button
                      key={index}
                      onClick={() => setInputText(phrase)}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white px-3 py-1 rounded-lg text-sm transition-all duration-300"
                    >
                      {phrase}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
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

export default MultiLanguageSupport;