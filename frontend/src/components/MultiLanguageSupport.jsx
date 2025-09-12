import React, { useState, useEffect } from 'react';
import { FiGlobe, FiMessageCircle, FiMic, FiVolume2, FiRefreshCw, FiCheck, FiSend, FiHeart, FiUsers, FiMap } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const MultiLanguageSupport = () => {
  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [inputText, setInputText] = useState('');
  const [globeRotation, setGlobeRotation] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [connectionPulse, setConnectionPulse] = useState(0);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English', popularity: 95 },
    { code: 'es', name: 'Spanish', flag: '🇪🇸', nativeName: 'Español', popularity: 85 },
    { code: 'fr', name: 'French', flag: '🇫🇷', nativeName: 'Français', popularity: 75 },
    { code: 'de', name: 'German', flag: '🇩🇪', nativeName: 'Deutsch', popularity: 70 },
    { code: 'it', name: 'Italian', flag: '🇮🇹', nativeName: 'Italiano', popularity: 65 },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹', nativeName: 'Português', popularity: 60 },
    { code: 'ru', name: 'Russian', flag: '🇷🇺', nativeName: 'Русский', popularity: 55 },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵', nativeName: '日本語', popularity: 50 },
    { code: 'ko', name: 'Korean', flag: '🇰🇷', nativeName: '한국어', popularity: 45 },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳', nativeName: '中文', popularity: 90 },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦', nativeName: 'العربية', popularity: 40 },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳', nativeName: 'हिन्दी', popularity: 80 }
  ];

  // Sample conversations for different scenarios
  const sampleMessages = [
    {
      type: 'emergency',
      original: 'I need help, where is the nearest hospital?',
      translated: 'Necesito ayuda, ¿dónde está el hospital más cercano?',
      category: 'Emergency'
    },
    {
      type: 'direction',
      original: 'How do I get to the main tourist area?',
      translated: 'Comment puis-je me rendre à la zone touristique principale?',
      category: 'Navigation'
    },
    {
      type: 'food',
      original: 'Can you recommend a good local restaurant?',
      translated: 'Können Sie ein gutes lokales Restaurant empfehlen?',
      category: 'Dining'
    }
  ];

  // Globe animation
  useEffect(() => {
    const globeInterval = setInterval(() => {
      setGlobeRotation(prev => (prev + 1) % 360);
      setConnectionPulse(prev => (prev + 1) % 100);
    }, 50);

    return () => clearInterval(globeInterval);
  }, []);

  // Initialize with sample conversation
  useEffect(() => {
    const initialMessages = [
      {
        id: 1,
        type: 'received',
        original: 'Hello! How can I help you today?',
        translated: '¡Hola! ¿Cómo puedo ayudarte hoy?',
        timestamp: new Date(Date.now() - 300000).toLocaleTimeString(),
        language: 'es'
      },
      {
        id: 2,
        type: 'sent',
        original: 'I would like to find a good restaurant nearby.',
        translated: 'Me gustaría encontrar un buen restaurante cerca.',
        timestamp: new Date(Date.now() - 240000).toLocaleTimeString(),
        language: 'es'
      }
    ];
    setConversation(initialMessages);
  }, []);

  const translateMessage = async (text, targetLang) => {
    setIsTranslating(true);
    
    // Simulate translation API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock translations (in real app, this would call a translation API)
    const mockTranslations = {
      'Thank you for your help!': {
        'es': '¡Gracias por tu ayuda!',
        'fr': 'Merci pour votre aide!',
        'de': 'Vielen Dank für Ihre Hilfe!',
        'it': 'Grazie per il tuo aiuto!',
        'pt': 'Obrigado pela sua ajuda!',
        'ru': 'Спасибо за вашу помощь!',
        'ja': 'ご協力ありがとうございます！',
        'ko': '도움을 주셔서 감사합니다!',
        'zh': '谢谢你的帮助！',
        'ar': 'شكرا لك على مساعدتك!',
        'hi': 'आपकी सहायता के लिए धन्यवाद!'
      }
    };
    
    const translation = mockTranslations[text]?.[targetLang] || `[${targetLang.toUpperCase()}] ${text}`;
    setIsTranslating(false);
    
    return translation;
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    
    const currentLang = languages.find(lang => lang.code === selectedLanguage);
    const translation = await translateMessage(inputText, selectedLanguage);
    
    const newMessage = {
      id: conversation.length + 1,
      type: 'sent',
      original: inputText,
      translated: translation,
      timestamp: new Date().toLocaleTimeString(),
      language: selectedLanguage
    };
    
    setConversation(prev => [...prev, newMessage]);
    setInputText('');
    
    // Simulate response
    setTimeout(async () => {
      const responseText = 'Thank you for your message! I understand and will help you.';
      const responseTranslation = await translateMessage(responseText, selectedLanguage);
      
      const response = {
        id: conversation.length + 2,
        type: 'received',
        original: responseText,
        translated: responseTranslation,
        timestamp: new Date().toLocaleTimeString(),
        language: selectedLanguage
      };
      
      setConversation(prev => [...prev, response]);
    }, 2000);
  };

  const handleLanguageChange = (langCode) => {
    setSelectedLanguage(langCode);
    i18n.changeLanguage(langCode);
  };

  const startVoiceInput = () => {
    setIsListening(true);
    // Simulate voice input
    setTimeout(() => {
      setInputText('Where is the nearest metro station?');
      setIsListening(false);
    }, 3000);
  };

  const getSelectedLanguage = () => {
    return languages.find(lang => lang.code === selectedLanguage) || languages[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-blue-50">
      
      {/* Warm Header */}
      <div className="bg-gradient-to-r from-yellow-400/20 via-white/80 to-blue-400/20 backdrop-blur-xl border-b border-yellow-200/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                {/* Animated Globe */}
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-blue-500 rounded-full flex items-center justify-center">
                  <FiGlobe 
                    className="w-6 h-6 text-white" 
                    style={{ transform: `rotate(${globeRotation}deg)` }}
                  />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-blue-600 bg-clip-text text-transparent">
                  Universal Translator
                </h1>
                <p className="text-gray-600">Breaking language barriers worldwide</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2">
                <FiUsers className="w-4 h-4 text-blue-500" />
                <span className="text-blue-600 text-sm">Connected to 124 languages</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-600 text-sm font-medium">Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-4 gap-6">
          
          {/* Language Selector */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-yellow-200/50 shadow-xl p-6 sticky top-6">
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                <FiGlobe className="w-5 h-5 text-yellow-500 mr-2" />
                Select Language
              </h3>
              
              {/* Featured Languages */}
              <div className="space-y-3 mb-6">
                {languages.slice(0, 6).map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`w-full p-3 rounded-xl border-2 transition-all duration-300 ${
                      selectedLanguage === lang.code
                        ? 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-blue-50 shadow-lg'
                        : 'border-gray-200 hover:border-yellow-300 bg-white/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{lang.flag}</span>
                      <div className="text-left flex-1">
                        <div className="font-semibold text-gray-800">{lang.name}</div>
                        <div className="text-sm text-gray-600">{lang.nativeName}</div>
                      </div>
                      {selectedLanguage === lang.code && (
                        <FiCheck className="w-5 h-5 text-yellow-500" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
              
              {/* All Languages Dropdown */}
              <div className="border-t border-gray-200 pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">All Languages</label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                >
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name} ({lang.nativeName})
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Language Stats */}
              <div className="mt-6 bg-gradient-to-r from-yellow-50 to-blue-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Language Info</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Popularity:</span>
                    <span className="text-blue-600 font-medium">{getSelectedLanguage().popularity}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Native Name:</span>
                    <span className="text-purple-600 font-medium">{getSelectedLanguage().nativeName}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Chat Interface */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Chat Container */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-blue-200/50 shadow-xl overflow-hidden">
              
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-yellow-100 to-blue-100 p-4 border-b border-gray-200/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-blue-500 rounded-full flex items-center justify-center">
                      <FiMessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">Live Translation Chat</h3>
                      <p className="text-sm text-gray-600">
                        Translating to {getSelectedLanguage().nativeName}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {isTranslating && (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin">
                          <FiRefreshCw className="w-4 h-4 text-blue-500" />
                        </div>
                        <span className="text-sm text-blue-600">Translating...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Messages */}
              <div className="h-96 overflow-y-auto p-4 space-y-4">
                {conversation.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'sent' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md ${
                      message.type === 'sent' 
                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white' 
                        : 'bg-white border border-gray-200'
                    } rounded-2xl p-4 shadow-lg`}>
                      
                      {/* Original Message */}
                      <div className="mb-2">
                        <p className={`font-medium ${message.type === 'sent' ? 'text-white' : 'text-gray-800'}`}>
                          {message.original}
                        </p>
                      </div>
                      
                      {/* Translation */}
                      <div className="border-t border-opacity-30 pt-2">
                        <p className={`text-sm italic ${message.type === 'sent' ? 'text-yellow-100' : 'text-blue-600'}`}>
                          {message.translated}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className={`text-xs ${message.type === 'sent' ? 'text-yellow-200' : 'text-gray-500'}`}>
                            {message.timestamp}
                          </span>
                          <div className="flex items-center space-x-1">
                            <span className="text-lg">
                              {languages.find(l => l.code === message.language)?.flag}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Input Area */}
              <div className="border-t border-gray-200/50 p-4">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={startVoiceInput}
                    className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                      isListening
                        ? 'border-red-400 bg-red-50 text-red-600'
                        : 'border-gray-300 hover:border-blue-400 text-gray-600'
                    }`}
                  >
                    <FiMic className="w-5 h-5" />
                  </button>
                  
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type your message..."
                      className="w-full p-3 border border-gray-300 rounded-xl bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    />
                    {isListening && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={sendMessage}
                    disabled={!inputText.trim() || isTranslating}
                    className="p-3 bg-gradient-to-r from-yellow-400 to-blue-500 hover:from-yellow-500 hover:to-blue-600 text-white rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiSend className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Quick Phrases */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-purple-200/50 shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <FiHeart className="w-5 h-5 text-pink-500 mr-2" />
                Quick Travel Phrases
              </h3>
              
              <div className="grid md:grid-cols-3 gap-4">
                {sampleMessages.map((sample, index) => (
                  <button
                    key={index}
                    onClick={() => setInputText(sample.original)}
                    className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border border-purple-200 rounded-xl transition-all duration-300 text-left group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-purple-600 uppercase">
                        {sample.category}
                      </span>
                      <FiMap className="w-4 h-4 text-purple-400 group-hover:text-purple-600" />
                    </div>
                    <p className="text-sm text-gray-700 font-medium mb-2">{sample.original}</p>
                    <p className="text-xs text-purple-600 italic">{sample.translated}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiLanguageSupport;