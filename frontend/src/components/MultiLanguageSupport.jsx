import React, { useState, useEffect } from 'react';
import { FiGlobe, FiMessageCircle, FiMic, FiVolume2, FiRefreshCw, FiCheck, FiSend, FiHeart, FiUsers, FiMap, FiArrowRight, FiSearch, FiZap } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { translate, detectLanguage, getLanguages } from '../services/api';
import Navbar from './Navbar';

const MultiLanguageSupport = () => {
  const { t, i18n } = useTranslation();
  const [selectedSourceLanguage, setSelectedSourceLanguage] = useState('auto');
  const [selectedTargetLanguage, setSelectedTargetLanguage] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [inputText, setInputText] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [translationHistory, setTranslationHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLanguages, setFilteredLanguages] = useState([]);

  // Comprehensive language list with Indian languages prioritized
  const languages = [
    { code: 'auto', name: 'Auto Detect', flag: '🔍', nativeName: 'Auto Detect', popularity: 100 },
    { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English', popularity: 95 },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳', nativeName: 'हिन्दी', popularity: 90 },
    { code: 'kn', name: 'Kannada', flag: '🇮🇳', nativeName: 'ಕನ್ನಡ', popularity: 85 },
    { code: 'gu', name: 'Gujarati', flag: '🇮🇳', nativeName: 'ગુજરાતી', popularity: 82 },
    { code: 'te', name: 'Telugu', flag: '🇮🇳', nativeName: 'తెలుగు', popularity: 80 },
    { code: 'bh', name: 'Bihari', flag: '🇮🇳', nativeName: 'भोजपुरी', popularity: 75 },
    { code: 'bn', name: 'Bengali', flag: '🇮🇳', nativeName: 'বাংলা', popularity: 88 },
    { code: 'ta', name: 'Tamil', flag: '🇮🇳', nativeName: 'தமிழ்', popularity: 85 },
    { code: 'ml', name: 'Malayalam', flag: '🇮🇳', nativeName: 'മലയാളം', popularity: 78 },
    { code: 'mr', name: 'Marathi', flag: '🇮🇳', nativeName: 'मराठी', popularity: 83 },
    { code: 'pa', name: 'Punjabi', flag: '🇮🇳', nativeName: 'ਪੰਜਾਬੀ', popularity: 77 },
    { code: 'or', name: 'Odia', flag: '🇮🇳', nativeName: 'ଓଡ଼ିଆ', popularity: 70 },
    { code: 'as', name: 'Assamese', flag: '🇮🇳', nativeName: 'অসমীয়া', popularity: 68 },
    { code: 'es', name: 'Spanish', flag: '🇪🇸', nativeName: 'Español', popularity: 85 },
    { code: 'fr', name: 'French', flag: '🇫🇷', nativeName: 'Français', popularity: 75 },
    { code: 'de', name: 'German', flag: '🇩🇪', nativeName: 'Deutsch', popularity: 70 },
    { code: 'it', name: 'Italian', flag: '🇮🇹', nativeName: 'Italiano', popularity: 65 },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹', nativeName: 'Português', popularity: 68 },
    { code: 'ru', name: 'Russian', flag: '🇷🇺', nativeName: 'Русский', popularity: 72 },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵', nativeName: '日本語', popularity: 78 },
    { code: 'ko', name: 'Korean', flag: '🇰🇷', nativeName: '한국어', popularity: 70 },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳', nativeName: '中文', popularity: 90 },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦', nativeName: 'العربية', popularity: 77 },
    { code: 'th', name: 'Thai', flag: '🇹🇭', nativeName: 'ไทย', popularity: 60 },
    { code: 'vi', name: 'Vietnamese', flag: '🇻🇳', nativeName: 'Tiếng Việt', popularity: 62 },
    { code: 'nl', name: 'Dutch', flag: '🇳🇱', nativeName: 'Nederlands', popularity: 58 },
    { code: 'sv', name: 'Swedish', flag: '🇸🇪', nativeName: 'Svenska', popularity: 55 },
    { code: 'no', name: 'Norwegian', flag: '🇳🇴', nativeName: 'Norsk', popularity: 53 },
    { code: 'da', name: 'Danish', flag: '🇩🇰', nativeName: 'Dansk', popularity: 52 },
    { code: 'fi', name: 'Finnish', flag: '🇫🇮', nativeName: 'Suomi', popularity: 51 }
  ];

  // Enhanced sample phrases with more languages and Indian context
  const quickPhrases = [
    {
      category: 'Emergency',
      icon: '🚨',
      phrases: [
        'I need help immediately!',
        'Where is the nearest hospital?',
        'Please call the police!',
        'I am lost and need directions.',
        'Can you help me find a doctor?'
      ]
    },
    {
      category: 'Directions',
      icon: '🗺️',
      phrases: [
        'How do I get to the airport?',
        'Where is the train station?',
        'Can you show me on the map?',
        'Is this the right way to downtown?',
        'Where is the nearest auto-rickshaw stand?'
      ]
    },
    {
      category: 'Food & Dining',
      icon: '🍽️',
      phrases: [
        'Can I see the menu please?',
        'I have food allergies.',
        'The bill, please.',
        'Do you have vegetarian options?',
        'Is this spicy?'
      ]
    },
    {
      category: 'Accommodation',
      icon: '🏨',
      phrases: [
        'I have a reservation.',
        'What time is check-out?',
        'Can I get a wake-up call?',
        'Is breakfast included?',
        'Do you have WiFi?'
      ]
    },
    {
      category: 'Indian Greetings',
      icon: '🙏',
      phrases: [
        'Namaste, how are you?',
        'Thank you very much',
        'Excuse me, can you help?',
        'Nice to meet you',
        'Have a good day'
      ]
    }
  ];

  // Real translation using the backend API
  const translateText = async (text, sourceLang, targetLang) => {
    setIsTranslating(true);
    
    try {
      // Use the real translation API
      const result = await translate(text, sourceLang, targetLang);
      
      if (result.success) {
        setDetectedLanguage(result.detectedSourceLanguage);
        setIsTranslating(false);
        return {
          translatedText: result.translatedText,
          detectedSourceLanguage: result.detectedSourceLanguage,
          confidence: result.confidence || 0.9
        };
      } else {
        throw new Error(result.error || 'Translation failed');
      }
      
    } catch (error) {
      setIsTranslating(false);
      console.error('Translation error:', error);
      return {
        translatedText: `❌ Translation failed: ${error.message}`,
        detectedSourceLanguage: sourceLang,
        confidence: 0,
        error: error.message
      };
    }
  };

  // Globe animation
  // Initialize with sample conversation
  useEffect(() => {
    const initialMessages = [
      {
        id: 1,
        type: 'system',
        original: 'Welcome to Universal Translator! Type a message to translate.',
        translated: '',
        timestamp: new Date().toLocaleTimeString(),
        sourceLang: 'en',
        targetLang: selectedTargetLanguage
      }
    ];
    setConversation(initialMessages);
  }, []);

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    
    // Add user message to conversation (right side)
    const userMessage = {
      id: Date.now(),
      type: 'sent',
      original: inputText,
      timestamp: new Date().toLocaleTimeString(),
      sourceLang: selectedSourceLanguage,
      targetLang: selectedTargetLanguage,
      showOriginalOnly: true // Only show original text for user message
    };
    
    setConversation(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    
    // Perform translation
    try {
      const result = await translateText(currentInput, selectedSourceLanguage, selectedTargetLanguage);
      
      // Add translation as a separate message on the opposite side (left side)
      const translationMessage = {
        id: Date.now() + 1,
        type: 'received',
        original: result.translatedText,
        timestamp: new Date().toLocaleTimeString(),
        sourceLang: result.detectedSourceLanguage,
        targetLang: selectedTargetLanguage,
        confidence: result.confidence,
        isTranslation: true,
        originalMessage: currentInput,
        showTranslationOnly: true // Only show translated text for bot message
      };

      // Add translation message with a slight delay for better UX
      setTimeout(() => {
        setConversation(prev => [...prev, translationMessage]);
      }, 500);

      // Add to translation history
      setTranslationHistory(prev => [...prev.slice(-9), {
        original: currentInput,
        translated: result.translatedText,
        sourceLang: result.detectedSourceLanguage,
        targetLang: selectedTargetLanguage,
        timestamp: new Date().toLocaleTimeString()
      }]);

    } catch (error) {
      console.error('Translation error:', error);
      
      // Add error message on the left side
      const errorMessage = {
        id: Date.now() + 1,
        type: 'received',
        original: `❌ Translation failed: ${error.message}`,
        timestamp: new Date().toLocaleTimeString(),
        sourceLang: selectedSourceLanguage,
        targetLang: selectedTargetLanguage,
        isError: true
      };

      setTimeout(() => {
        setConversation(prev => [...prev, errorMessage]);
      }, 500);
    }
  };

  const handleQuickPhrase = async (phrase) => {
    setInputText(phrase);
    // Auto-send after a short delay
    setTimeout(() => {
      if (phrase === inputText) {
        sendMessage();
      }
    }, 100);
  };

  const startVoiceInput = () => {
    setIsListening(true);
    // Simulate voice input with random phrases
    const voicePhrases = [
      'Where is the nearest metro station?',
      'Can you help me find a taxi?',
      'I need directions to the hotel.',
      'What time does the museum close?'
    ];
    
    setTimeout(() => {
      const randomPhrase = voicePhrases[Math.floor(Math.random() * voicePhrases.length)];
      setInputText(randomPhrase);
      setIsListening(false);
    }, 3000);
  };

  const getLanguageByCode = (code) => {
    return languages.find(lang => lang.code === code) || languages[1]; // fallback to English
  };

  const swapLanguages = () => {
    if (selectedSourceLanguage !== 'auto') {
      setSelectedSourceLanguage(selectedTargetLanguage);
      setSelectedTargetLanguage(selectedSourceLanguage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Navbar />
      
      <div className="relative z-10 text-white">


      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-4 gap-6">
          
          {/* Language Selector Panel */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-700/50 shadow-xl p-6 sticky top-6">
              
              {/* Online Status */}
              <div className="flex items-center justify-center space-x-2 mb-6 p-2 bg-green-900/30 border border-green-500/30 rounded-xl">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">Translation Service Online</span>
              </div>
              
              {/* Source Language Section */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <FiSearch className="w-5 h-5 text-blue-400 mr-2" />
                  From
                </h3>
                
                <div className="relative">
                  <select
                    value={selectedSourceLanguage}
                    onChange={(e) => setSelectedSourceLanguage(e.target.value)}
                    className="w-full p-3 border border-gray-600 rounded-xl bg-gray-700/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white appearance-none custom-scroll"
                  >
                    <option value="auto" className="bg-gray-800 text-yellow-400 font-semibold">
                      🔍 Auto Detect (Recommended)
                    </option>
                    <optgroup label="🇮🇳 Popular Indian Languages" className="bg-gray-800 text-blue-400 font-semibold">
                      {languages.filter(lang => ['en', 'hi', 'kn', 'te', 'bn', 'ta', 'mr', 'gu', 'ml', 'pa'].includes(lang.code)).map(lang => (
                        <option key={lang.code} value={lang.code} className="bg-gray-800 text-white py-1">
                          {lang.flag} {lang.name} ({lang.nativeName})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="🌍 All Supported Languages" className="bg-gray-800 text-green-400 font-semibold">
                      {languages.filter(lang => lang.code !== 'auto').map(lang => (
                        <option key={lang.code} value={lang.code} className="bg-gray-800 text-white py-1">
                          {lang.flag} {lang.name} ({lang.nativeName})
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <FiArrowRight className="w-4 h-4 text-gray-400 rotate-90" />
                  </div>
                </div>
              </div>
              
              {/* Language Swap Button */}
              <div className="flex justify-center my-4">
                <button 
                  onClick={swapLanguages}
                  className="p-3 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors border border-gray-600"
                  disabled={selectedSourceLanguage === 'auto'}
                  title="Swap Languages"
                >
                  <FiArrowRight className="w-5 h-5 text-white rotate-90" />
                </button>
              </div>
              
              {/* Language Detection Status */}
              {detectedLanguage && (
                <div className="mb-4 p-3 bg-green-900/30 border border-green-500/30 rounded-xl">
                  <div className="flex items-center space-x-2 text-green-400">
                    <FiSearch className="w-4 h-4" />
                    <span className="text-sm">Detected: {getLanguageByCode(detectedLanguage).name}</span>
                  </div>
                </div>
              )}
              
              <div className="border-t border-white/20 my-6"></div>
              
              {/* Target Language Section */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <FiGlobe className="w-5 h-5 text-green-400 mr-2" />
                  To
                </h3>
                
                {/* Popular Target Languages */}
                <div className="space-y-2 mb-4">
                  {languages.slice(1, 6).map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => setSelectedTargetLanguage(lang.code)}
                      className={`w-full p-3 rounded-xl border-2 transition-all duration-300 ${
                        selectedTargetLanguage === lang.code
                          ? 'border-yellow-400 premium-glass-enhanced shadow-lg'
                          : 'border-white/30 hover:border-yellow-300 premium-glass-enhanced'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{lang.flag}</span>
                        <div className="text-left flex-1">
                          <div className="font-medium premium-text">{lang.name}</div>
                          <div className="text-xs premium-text opacity-70">{lang.nativeName}</div>
                        </div>
                        {selectedTargetLanguage === lang.code && (
                          <FiCheck className="w-4 h-4 premium-text-gold" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                
                {/* All Languages Dropdown with Smooth Scrolling */}
                <div className="relative">
                  <select
                    value={selectedTargetLanguage}
                    onChange={(e) => setSelectedTargetLanguage(e.target.value)}
                    className="w-full p-3 border border-white/30 rounded-xl bg-gray-800/80 backdrop-blur-sm focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white appearance-none custom-scroll"
                    style={{ maxHeight: '200px' }}
                  >
                    <optgroup label="🇮🇳 Indian Languages" className="bg-gray-800 text-yellow-400 font-semibold">
                      {languages.filter(lang => lang.region === 'India').map(lang => (
                        <option key={lang.code} value={lang.code} className="bg-gray-800 text-white py-1">
                          {lang.flag} {lang.name} ({lang.nativeName})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="🌍 Global Languages" className="bg-gray-800 text-blue-400 font-semibold">
                      {languages.filter(lang => lang.region && !['India', 'System'].includes(lang.region)).slice(0, 15).map(lang => (
                        <option key={lang.code} value={lang.code} className="bg-gray-800 text-white py-1">
                          {lang.flag} {lang.name} ({lang.nativeName})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="🌏 All Languages" className="bg-gray-800 text-green-400 font-semibold">
                      {languages.filter(lang => lang.code !== 'auto').map(lang => (
                        <option key={lang.code} value={lang.code} className="bg-gray-800 text-white py-1">
                          {lang.flag} {lang.name} ({lang.nativeName}) - {lang.region}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <FiArrowRight className="w-4 h-4 text-gray-400 rotate-90" />
                  </div>
                </div>
              </div>
              
              {/* Translation Stats */}
              <div className="premium-glass-enhanced rounded-xl p-4 border border-white/30">
                <h4 className="font-semibold premium-text-bold mb-3">Translation Info</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="premium-text opacity-80">Total Translations:</span>
                    <span className="premium-text-gold font-medium">{translationHistory.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="premium-text opacity-80">Target Language:</span>
                    <span className="premium-text-gold font-medium">{getLanguageByCode(selectedTargetLanguage).nativeName}</span>
                  </div>
                  {detectedLanguage && (
                    <div className="flex justify-between">
                      <span className="premium-text opacity-80">Last Detected:</span>
                      <span className="text-green-300 font-medium">{getLanguageByCode(detectedLanguage).name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Chat Interface */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Chat Container */}
            <div className="premium-glass-enhanced backdrop-blur-xl rounded-3xl border border-white/30 shadow-xl overflow-hidden">
              
              {/* Chat Header with Enhanced Info */}
              <div className="premium-glass-enhanced p-4 border-b border-white/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-blue-500 rounded-full flex items-center justify-center">
                      <FiMessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold premium-text-bold">Smart Translation Chat</h3>
                      <p className="text-sm premium-text flex items-center space-x-2">
                        <span>Auto-detecting from</span>
                        <span className="font-medium premium-text-gold">
                          {getLanguageByCode(selectedSourceLanguage).name}
                        </span>
                        <FiArrowRight className="w-3 h-3" />
                        <span className="font-medium premium-text-gold">
                          {getLanguageByCode(selectedTargetLanguage).nativeName}
                        </span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {isTranslating && (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin">
                          <FiRefreshCw className="w-4 h-4 premium-text-gold" />
                        </div>
                        <span className="text-sm premium-text-gold">Translating...</span>
                      </div>
                    )}
                    
                    <div className="text-xs premium-text opacity-70">
                      {conversation.length - 1} messages
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Enhanced Messages with Custom Scrolling */}
              <div className="h-96 overflow-y-auto p-4 space-y-4 custom-scroll">
                {conversation.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.type === 'sent' ? 'justify-end' : 
                      message.type === 'system' ? 'justify-center' : 'justify-start'
                    }`}
                  >
                    <div className={`max-w-xs lg:max-w-md ${
                      message.type === 'sent' 
                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white' 
                        : message.type === 'system'
                        ? 'bg-gray-100 text-gray-600 text-center'
                        : message.isTranslation
                        ? 'bg-gradient-to-r from-blue-400 to-blue-500 text-white'
                        : message.isError
                        ? 'bg-gradient-to-r from-red-400 to-red-500 text-white'
                        : 'bg-white border border-gray-200'
                    } rounded-2xl p-4 shadow-lg relative`}>
                      
                      {message.type === 'system' && (
                        <p className="text-sm">{message.original}</p>
                      )}
                      
                      {message.type === 'sent' && (
                        <>
                          {/* User message - show original only */}
                          <div className="mb-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-yellow-100">
                                You ({getLanguageByCode(message.sourceLang).name})
                              </span>
                              <span className="text-lg">
                                {getLanguageByCode(message.sourceLang).flag}
                              </span>
                            </div>
                            <p className="font-medium text-white text-lg">
                              {message.original}
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-yellow-200">
                              {message.timestamp}
                            </span>
                            <div className="flex items-center space-x-1 text-xs text-yellow-200">
                              <FiSend className="w-3 h-3" />
                              <span>Sent</span>
                            </div>
                          </div>
                        </>
                      )}
                      
                      {message.type === 'received' && (
                        <>
                          {/* Translation message - show translation only */}
                          <div className="mb-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-xs font-medium ${
                                message.isTranslation ? 'text-blue-100' : 
                                message.isError ? 'text-red-100' : 'text-gray-500'
                              }`}>
                                {message.isTranslation 
                                  ? `Translation (${getLanguageByCode(message.targetLang).name})`
                                  : message.isError 
                                  ? 'Error'
                                  : 'Assistant'
                                }
                              </span>
                              <div className="flex items-center space-x-2">
                                {message.confidence && (
                                  <span className="text-xs text-blue-200">
                                    {Math.round(message.confidence * 100)}% confident
                                  </span>
                                )}
                                <span className="text-lg">
                                  {message.isTranslation 
                                    ? getLanguageByCode(message.targetLang).flag
                                    : message.isError
                                    ? '❌'
                                    : '🤖'
                                  }
                                </span>
                              </div>
                            </div>
                            <p className={`font-medium text-lg ${
                              message.isTranslation ? 'text-white' :
                              message.isError ? 'text-white' : 'text-gray-800'
                            }`}>
                              {message.original}
                            </p>
                            
                            {message.isTranslation && message.originalMessage && (
                              <div className="mt-2 pt-2 border-t border-blue-300 border-opacity-30">
                                <span className="text-xs text-blue-200 italic">
                                  Translated from: "{message.originalMessage}"
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className={`text-xs ${
                              message.isTranslation ? 'text-blue-200' : 
                              message.isError ? 'text-red-200' : 'text-gray-500'
                            }`}>
                              {message.timestamp}
                            </span>
                            <div className={`flex items-center space-x-1 text-xs ${
                              message.isTranslation ? 'text-blue-200' : 
                              message.isError ? 'text-red-200' : 'text-gray-500'
                            }`}>
                              {message.isTranslation && (
                                <>
                                  <FiGlobe className="w-3 h-3" />
                                  <span>Translated</span>
                                </>
                              )}
                              {message.isError && (
                                <>
                                  <FiRefreshCw className="w-3 h-3" />
                                  <span>Failed</span>
                                </>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Enhanced Input Area */}
              <div className="border-t border-gray-200/50 p-4">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={startVoiceInput}
                    className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                      isListening
                        ? 'border-red-400 bg-red-50 text-red-600 animate-pulse'
                        : 'border-gray-300 hover:border-blue-400 text-gray-600'
                    }`}
                    title="Voice Input"
                  >
                    <FiMic className="w-5 h-5" />
                  </button>
                  
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder={`Type in ${getLanguageByCode(selectedSourceLanguage).name}...`}
                      className="w-full p-3 pr-20 border border-gray-300 rounded-xl bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    />
                    {isListening && (
                      <div className="absolute right-12 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                        <div className="w-1 h-1 bg-red-400 rounded-full animate-ping"></div>
                        <div className="w-1 h-1 bg-red-400 rounded-full animate-ping" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-1 h-1 bg-red-400 rounded-full animate-ping" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    )}
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                      {inputText.length}/500
                    </div>
                  </div>
                  
                  <button
                    onClick={sendMessage}
                    disabled={!inputText.trim() || isTranslating}
                    className="p-3 bg-gradient-to-r from-yellow-400 to-blue-500 hover:from-yellow-500 hover:to-blue-600 text-white rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                    title="Send & Translate"
                  >
                    <FiSend className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Language Detection Preview */}
                {inputText.length > 3 && (
                  <div className="mt-2 text-xs text-gray-600 flex items-center space-x-2">
                    <FiSearch className="w-3 h-3 text-green-500" />
                    <span>Will auto-detect language and translate to {getLanguageByCode(selectedTargetLanguage).name}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Enhanced Quick Phrases */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-purple-200/50 shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <FiHeart className="w-5 h-5 text-pink-500 mr-2" />
                Quick Travel Phrases
              </h3>
              
              <div className="grid gap-6">
                {quickPhrases.map((category, categoryIndex) => (
                  <div key={categoryIndex}>
                    <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
                      <span className="text-lg mr-2">{category.icon}</span>
                      {category.category}
                    </h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      {category.phrases.map((phrase, phraseIndex) => (
                        <button
                          key={phraseIndex}
                          onClick={() => handleQuickPhrase(phrase)}
                          className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border border-purple-200 rounded-xl transition-all duration-300 text-left group"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-purple-600 uppercase">
                              Quick Phrase
                            </span>
                            <FiZap className="w-3 h-3 text-purple-400 group-hover:text-purple-600" />
                          </div>
                          <p className="text-sm text-gray-700 font-medium">{phrase}</p>
                          <p className="text-xs text-purple-600 italic mt-1">
                            Click to translate to {getLanguageByCode(selectedTargetLanguage).name}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default MultiLanguageSupport;