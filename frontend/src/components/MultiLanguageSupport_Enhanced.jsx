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

  // Comprehensive language list with all major world languages
  const languages = [
    { code: 'auto', name: 'Auto Detect', flag: '🔍', nativeName: 'Auto Detect', popularity: 100, region: 'System' },
    
    // Indian Languages (Primary Focus for Indian Tourist System)
    { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English', popularity: 95, region: 'Global' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳', nativeName: 'हिन्दी', popularity: 90, region: 'India' },
    { code: 'kn', name: 'Kannada', flag: '🇮🇳', nativeName: 'ಕನ್ನಡ', popularity: 85, region: 'India' },
    { code: 'te', name: 'Telugu', flag: '🇮🇳', nativeName: 'తెలుగు', popularity: 83, region: 'India' },
    { code: 'bn', name: 'Bengali', flag: '🇮🇳', nativeName: 'বাংলা', popularity: 88, region: 'India' },
    { code: 'ta', name: 'Tamil', flag: '🇮🇳', nativeName: 'தமிழ்', popularity: 85, region: 'India' },
    { code: 'mr', name: 'Marathi', flag: '🇮🇳', nativeName: 'मराठी', popularity: 83, region: 'India' },
    { code: 'gu', name: 'Gujarati', flag: '🇮🇳', nativeName: 'ગુજરાતી', popularity: 82, region: 'India' },
    { code: 'ml', name: 'Malayalam', flag: '🇮🇳', nativeName: 'മലയാളം', popularity: 78, region: 'India' },
    { code: 'pa', name: 'Punjabi', flag: '🇮🇳', nativeName: 'ਪੰਜਾਬੀ', popularity: 77, region: 'India' },
    { code: 'or', name: 'Odia', flag: '🇮🇳', nativeName: 'ଓଡ଼ିଆ', popularity: 70, region: 'India' },
    { code: 'as', name: 'Assamese', flag: '🇮🇳', nativeName: 'অসমীয়া', popularity: 68, region: 'India' },
    { code: 'ur', name: 'Urdu', flag: '🇮🇳', nativeName: 'اردو', popularity: 75, region: 'India' },
    { code: 'sa', name: 'Sanskrit', flag: '🇮🇳', nativeName: 'संस्कृतम्', popularity: 45, region: 'India' },
    { code: 'bho', name: 'Bhojpuri', flag: '🇮🇳', nativeName: 'भोजपुरी', popularity: 65, region: 'India' },
    { code: 'mai', name: 'Maithili', flag: '🇮🇳', nativeName: 'मैथिली', popularity: 55, region: 'India' },
    { code: 'sd', name: 'Sindhi', flag: '🇮🇳', nativeName: 'سنڌي', popularity: 52, region: 'India' },
    { code: 'ks', name: 'Kashmiri', flag: '🇮🇳', nativeName: 'کٲشُر', popularity: 48, region: 'India' },
    { code: 'doi', name: 'Dogri', flag: '🇮🇳', nativeName: 'डोगरी', popularity: 42, region: 'India' },
    { code: 'mni', name: 'Manipuri', flag: '🇮🇳', nativeName: 'মৈতৈলোন্', popularity: 45, region: 'India' },
    { code: 'kok', name: 'Konkani', flag: '🇮🇳', nativeName: 'कोंकणी', popularity: 47, region: 'India' },
    { code: 'sat', name: 'Santali', flag: '🇮🇳', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', popularity: 43, region: 'India' },
    
    // South Asian Neighbors
    { code: 'ne', name: 'Nepali', flag: '🇳🇵', nativeName: 'नेपाली', popularity: 62, region: 'South Asia' },
    { code: 'si', name: 'Sinhala', flag: '🇱🇰', nativeName: 'සිංහල', popularity: 58, region: 'South Asia' },
    { code: 'dv', name: 'Dhivehi', flag: '🇲🇻', nativeName: 'ދިވެހި', popularity: 35, region: 'South Asia' },
    { code: 'ps', name: 'Pashto', flag: '🇦🇫', nativeName: 'پښتو', popularity: 48, region: 'South Asia' },
    { code: 'fa', name: 'Persian', flag: '🇮🇷', nativeName: 'فارسی', popularity: 58, region: 'Middle East' },
    
    // Major Global Languages - Essential for international tourists
    { code: 'zh', name: 'Chinese (Simplified)', flag: '🇨🇳', nativeName: '简体中文', popularity: 90, region: 'East Asia' },
    { code: 'zh-tw', name: 'Chinese (Traditional)', flag: '🇹🇼', nativeName: '繁體中文', popularity: 75, region: 'East Asia' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸', nativeName: 'Español', popularity: 85, region: 'Europe/Americas' },
    { code: 'fr', name: 'French', flag: '🇫🇷', nativeName: 'Français', popularity: 75, region: 'Europe/Africa' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦', nativeName: 'العربية', popularity: 77, region: 'Middle East' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹', nativeName: 'Português', popularity: 68, region: 'Europe/Americas' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺', nativeName: 'Русский', popularity: 72, region: 'Europe/Asia' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵', nativeName: '日本語', popularity: 78, region: 'East Asia' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷', nativeName: '한국어', popularity: 70, region: 'East Asia' },
    { code: 'de', name: 'German', flag: '🇩🇪', nativeName: 'Deutsch', popularity: 70, region: 'Europe' },
    { code: 'it', name: 'Italian', flag: '🇮🇹', nativeName: 'Italiano', popularity: 65, region: 'Europe' },
    
    // Southeast Asian Languages - Important for regional tourism
    { code: 'th', name: 'Thai', flag: '🇹🇭', nativeName: 'ไทย', popularity: 60, region: 'Southeast Asia' },
    { code: 'vi', name: 'Vietnamese', flag: '🇻🇳', nativeName: 'Tiếng Việt', popularity: 62, region: 'Southeast Asia' },
    { code: 'id', name: 'Indonesian', flag: '🇮🇩', nativeName: 'Bahasa Indonesia', popularity: 64, region: 'Southeast Asia' },
    { code: 'ms', name: 'Malay', flag: '🇲🇾', nativeName: 'Bahasa Melayu', popularity: 58, region: 'Southeast Asia' },
    { code: 'my', name: 'Myanmar (Burmese)', flag: '🇲🇲', nativeName: 'မြန်မာ', popularity: 45, region: 'Southeast Asia' },
    { code: 'km', name: 'Khmer', flag: '🇰🇭', nativeName: 'ខ្មែរ', popularity: 42, region: 'Southeast Asia' },
    { code: 'lo', name: 'Lao', flag: '🇱🇦', nativeName: 'ລາວ', popularity: 40, region: 'Southeast Asia' },
    { code: 'tl', name: 'Filipino', flag: '🇵🇭', nativeName: 'Filipino', popularity: 55, region: 'Southeast Asia' },
    { code: 'ceb', name: 'Cebuano', flag: '🇵🇭', nativeName: 'Cebuano', popularity: 38, region: 'Southeast Asia' },
    { code: 'haw', name: 'Hawaiian', flag: '🏝️', nativeName: 'ʻŌlelo Hawaiʻi', popularity: 32, region: 'Pacific' },
    
    // European Languages - Key for European tourists
    { code: 'nl', name: 'Dutch', flag: '🇳🇱', nativeName: 'Nederlands', popularity: 58, region: 'Europe' },
    { code: 'sv', name: 'Swedish', flag: '🇸🇪', nativeName: 'Svenska', popularity: 55, region: 'Europe' },
    { code: 'no', name: 'Norwegian', flag: '🇳🇴', nativeName: 'Norsk', popularity: 53, region: 'Europe' },
    { code: 'da', name: 'Danish', flag: '🇩🇰', nativeName: 'Dansk', popularity: 52, region: 'Europe' },
    { code: 'fi', name: 'Finnish', flag: '🇫🇮', nativeName: 'Suomi', popularity: 51, region: 'Europe' },
    { code: 'pl', name: 'Polish', flag: '🇵🇱', nativeName: 'Polski', popularity: 60, region: 'Europe' },
    { code: 'cs', name: 'Czech', flag: '🇨🇿', nativeName: 'Čeština', popularity: 48, region: 'Europe' },
    { code: 'sk', name: 'Slovak', flag: '🇸🇰', nativeName: 'Slovenčina', popularity: 45, region: 'Europe' },
    { code: 'hu', name: 'Hungarian', flag: '🇭🇺', nativeName: 'Magyar', popularity: 47, region: 'Europe' },
    { code: 'ro', name: 'Romanian', flag: '🇷🇴', nativeName: 'Română', popularity: 50, region: 'Europe' },
    { code: 'bg', name: 'Bulgarian', flag: '🇧🇬', nativeName: 'Български', popularity: 43, region: 'Europe' },
    { code: 'hr', name: 'Croatian', flag: '🇭🇷', nativeName: 'Hrvatski', popularity: 44, region: 'Europe' },
    { code: 'sr', name: 'Serbian', flag: '🇷🇸', nativeName: 'Српски', popularity: 42, region: 'Europe' },
    { code: 'sl', name: 'Slovenian', flag: '🇸🇮', nativeName: 'Slovenščina', popularity: 40, region: 'Europe' },
    { code: 'et', name: 'Estonian', flag: '🇪🇪', nativeName: 'Eesti', popularity: 38, region: 'Europe' },
    { code: 'lv', name: 'Latvian', flag: '🇱🇻', nativeName: 'Latviešu', popularity: 37, region: 'Europe' },
    { code: 'lt', name: 'Lithuanian', flag: '🇱🇹', nativeName: 'Lietuvių', popularity: 39, region: 'Europe' },
    { code: 'el', name: 'Greek', flag: '🇬🇷', nativeName: 'Ελληνικά', popularity: 46, region: 'Europe' },
    { code: 'tr', name: 'Turkish', flag: '🇹🇷', nativeName: 'Türkçe', popularity: 68, region: 'Europe/Asia' },
    { code: 'uk', name: 'Ukrainian', flag: '🇺🇦', nativeName: 'Українська', popularity: 55, region: 'Europe' },
    { code: 'be', name: 'Belarusian', flag: '🇧🇾', nativeName: 'Беларуская', popularity: 38, region: 'Europe' },
    
    // African Languages
    { code: 'sw', name: 'Swahili', flag: '🇰🇪', nativeName: 'Kiswahili', popularity: 55, region: 'Africa' },
    { code: 'af', name: 'Afrikaans', flag: '🇿🇦', nativeName: 'Afrikaans', popularity: 48, region: 'Africa' },
    { code: 'am', name: 'Amharic', flag: '🇪🇹', nativeName: 'አማርኛ', popularity: 45, region: 'Africa' },
    { code: 'ha', name: 'Hausa', flag: '🇳🇬', nativeName: 'Harshen Hausa', popularity: 50, region: 'Africa' },
    { code: 'yo', name: 'Yoruba', flag: '🇳🇬', nativeName: 'Yorùbá', popularity: 48, region: 'Africa' },
    { code: 'ig', name: 'Igbo', flag: '🇳🇬', nativeName: 'Asụsụ Igbo', popularity: 45, region: 'Africa' },
    { code: 'zu', name: 'Zulu', flag: '🇿🇦', nativeName: 'isiZulu', popularity: 47, region: 'Africa' },
    { code: 'xh', name: 'Xhosa', flag: '🇿🇦', nativeName: 'isiXhosa', popularity: 44, region: 'Africa' },
    { code: 'st', name: 'Sesotho', flag: '🇱🇸', nativeName: 'Sesotho', popularity: 40, region: 'Africa' },
    { code: 'tn', name: 'Setswana', flag: '🇧🇼', nativeName: 'Setswana', popularity: 42, region: 'Africa' },
    { code: 'ny', name: 'Chichewa', flag: '🇲🇼', nativeName: 'Chicheŵa', popularity: 38, region: 'Africa' },
    { code: 'sn', name: 'Shona', flag: '🇿🇼', nativeName: 'chiShona', popularity: 43, region: 'Africa' },
    { code: 'so', name: 'Somali', flag: '🇸🇴', nativeName: 'Af Soomaali', popularity: 46, region: 'Africa' },
    { code: 'rw', name: 'Kinyarwanda', flag: '🇷🇼', nativeName: 'Ikinyarwanda', popularity: 41, region: 'Africa' },
    { code: 'lg', name: 'Luganda', flag: '🇺🇬', nativeName: 'Oluganda', popularity: 37, region: 'Africa' },
    
    // Middle Eastern Languages
    { code: 'he', name: 'Hebrew', flag: '🇮🇱', nativeName: 'עברית', popularity: 52, region: 'Middle East' },
    { code: 'ku', name: 'Kurdish', flag: '🏴', nativeName: 'Kurdî', popularity: 40, region: 'Middle East' },
    { code: 'az', name: 'Azerbaijani', flag: '🇦🇿', nativeName: 'Azərbaycanca', popularity: 43, region: 'Middle East' },
    { code: 'ka', name: 'Georgian', flag: '🇬🇪', nativeName: 'ქართული', popularity: 38, region: 'Caucasus' },
    { code: 'hy', name: 'Armenian', flag: '🇦🇲', nativeName: 'Հայերեն', popularity: 40, region: 'Caucasus' },
    
    // Central Asian Languages
    { code: 'kk', name: 'Kazakh', flag: '🇰🇿', nativeName: 'Қазақша', popularity: 42, region: 'Central Asia' },
    { code: 'ky', name: 'Kyrgyz', flag: '🇰🇬', nativeName: 'Кыргызча', popularity: 38, region: 'Central Asia' },
    { code: 'uz', name: 'Uzbek', flag: '🇺🇿', nativeName: 'Oʻzbekcha', popularity: 45, region: 'Central Asia' },
    { code: 'tk', name: 'Turkmen', flag: '🇹🇲', nativeName: 'Türkmençe', popularity: 35, region: 'Central Asia' },
    { code: 'tg', name: 'Tajik', flag: '🇹🇯', nativeName: 'Тоҷикӣ', popularity: 37, region: 'Central Asia' },
    { code: 'mn', name: 'Mongolian', flag: '🇲🇳', nativeName: 'Монгол', popularity: 40, region: 'Central Asia' },
    
    // Other Notable Languages
    { code: 'cy', name: 'Welsh', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', nativeName: 'Cymraeg', popularity: 35, region: 'Europe' },
    { code: 'ga', name: 'Irish', flag: '🇮🇪', nativeName: 'Gaeilge', popularity: 36, region: 'Europe' },
    { code: 'gd', name: 'Scottish Gaelic', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', nativeName: 'Gàidhlig', popularity: 32, region: 'Europe' },
    { code: 'mt', name: 'Maltese', flag: '🇲🇹', nativeName: 'Malti', popularity: 32, region: 'Europe' },
    { code: 'is', name: 'Icelandic', flag: '🇮🇸', nativeName: 'Íslenska', popularity: 33, region: 'Europe' },
    { code: 'fo', name: 'Faroese', flag: '🇫🇴', nativeName: 'Føroyskt', popularity: 28, region: 'Europe' },
    { code: 'mk', name: 'Macedonian', flag: '🇲🇰', nativeName: 'Македонски', popularity: 38, region: 'Europe' },
    { code: 'sq', name: 'Albanian', flag: '🇦🇱', nativeName: 'Shqip', popularity: 41, region: 'Europe' },
    { code: 'eu', name: 'Basque', flag: '🏴', nativeName: 'Euskera', popularity: 34, region: 'Europe' },
    { code: 'ca', name: 'Catalan', flag: '🏴', nativeName: 'Català', popularity: 43, region: 'Europe' },
    { code: 'gl', name: 'Galician', flag: '🏴', nativeName: 'Galego', popularity: 35, region: 'Europe' },
    { code: 'eo', name: 'Esperanto', flag: '🌍', nativeName: 'Esperanto', popularity: 30, region: 'Constructed' },
    { code: 'la', name: 'Latin', flag: '🏛️', nativeName: 'Latina', popularity: 25, region: 'Classical' },
    
    // Pacific & Indigenous Languages
    { code: 'mi', name: 'Maori', flag: '🇳🇿', nativeName: 'Te Reo Māori', popularity: 35, region: 'Pacific' },
    { code: 'sm', name: 'Samoan', flag: '🇼🇸', nativeName: 'Gagana Sāmoa', popularity: 33, region: 'Pacific' },
    { code: 'to', name: 'Tongan', flag: '🇹🇴', nativeName: 'Lea Fakatonga', popularity: 30, region: 'Pacific' },
    { code: 'fj', name: 'Fijian', flag: '🇫🇯', nativeName: 'Na Vosa Vakaviti', popularity: 32, region: 'Pacific' }
  ];

  // Filter languages based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = languages.filter(lang => 
        lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lang.nativeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lang.region.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredLanguages(filtered);
    } else {
      setFilteredLanguages(languages);
    }
  }, [searchTerm]);

  // Rest of the component remains the same as before...
  // [Include all the previous functions and UI components here]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Navbar />
      
      <div className="relative z-10 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          
          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-4 gap-6">
            
            {/* Enhanced Language Selector Panel with Search */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-700/50 shadow-xl p-6 sticky top-6">
                
                {/* Online Status */}
                <div className="flex items-center justify-center space-x-2 mb-6 p-2 bg-green-900/30 border border-green-500/30 rounded-xl">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm font-medium">Translation Service Online</span>
                </div>
                
                {/* Language Search */}
                <div className="mb-6">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search languages..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent custom-scroll"
                    />
                  </div>
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
                        {filteredLanguages.filter(lang => ['en', 'hi', 'kn', 'te', 'bn', 'ta', 'mr', 'gu', 'ml', 'pa'].includes(lang.code)).map(lang => (
                          <option key={lang.code} value={lang.code} className="bg-gray-800 text-white py-1">
                            {lang.flag} {lang.name} ({lang.nativeName})
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="🌍 All Supported Languages" className="bg-gray-800 text-green-400 font-semibold">
                        {filteredLanguages.filter(lang => lang.code !== 'auto').slice(0, 50).map(lang => (
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
                    onClick={() => {
                      if (selectedSourceLanguage !== 'auto') {
                        setSelectedSourceLanguage(selectedTargetLanguage);
                        setSelectedTargetLanguage(selectedSourceLanguage);
                      }
                    }}
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
                      <span className="text-sm">Detected: {languages.find(l => l.code === detectedLanguage)?.name || detectedLanguage}</span>
                    </div>
                  </div>
                )}
                
                <div className="border-t border-white/20 my-6"></div>
                
                {/* Target Language Section with Enhanced Options */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    <FiGlobe className="w-5 h-5 text-green-400 mr-2" />
                    To
                  </h3>
                  
                  {/* Popular Target Languages */}
                  <div className="space-y-2 mb-4 max-h-64 overflow-y-auto custom-scroll">
                    {filteredLanguages.filter(lang => ['en', 'hi', 'kn', 'te', 'bn', 'ta'].includes(lang.code)).map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => setSelectedTargetLanguage(lang.code)}
                        className={`w-full p-3 rounded-xl border-2 transition-all duration-300 ${
                          selectedTargetLanguage === lang.code
                            ? 'border-yellow-400 bg-gray-800/80 shadow-lg'
                            : 'border-white/30 hover:border-yellow-300 bg-gray-800/80'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{lang.flag}</span>
                          <div className="text-left flex-1">
                            <div className="font-medium text-white">{lang.name}</div>
                            <div className="text-xs text-gray-300">{lang.nativeName}</div>
                          </div>
                          {selectedTargetLanguage === lang.code && (
                            <FiCheck className="w-4 h-4 text-yellow-400" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  {/* Comprehensive Languages Dropdown */}
                  <div className="relative">
                    <select
                      value={selectedTargetLanguage}
                      onChange={(e) => setSelectedTargetLanguage(e.target.value)}
                      className="w-full p-3 border border-white/30 rounded-xl bg-gray-800/80 backdrop-blur-sm focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white appearance-none custom-scroll"
                      style={{ maxHeight: '200px' }}
                    >
                      <optgroup label="🇮🇳 Indian Languages" className="bg-gray-800 text-yellow-400 font-semibold">
                        {filteredLanguages.filter(lang => lang.region === 'India').map(lang => (
                          <option key={lang.code} value={lang.code} className="bg-gray-800 text-white py-1">
                            {lang.flag} {lang.name} ({lang.nativeName})
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="🌍 Global Languages" className="bg-gray-800 text-blue-400 font-semibold">
                        {filteredLanguages.filter(lang => lang.region && !['India', 'System'].includes(lang.region)).slice(0, 20).map(lang => (
                          <option key={lang.code} value={lang.code} className="bg-gray-800 text-white py-1">
                            {lang.flag} {lang.name} ({lang.nativeName})
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="🌏 All Languages" className="bg-gray-800 text-green-400 font-semibold">
                        {filteredLanguages.filter(lang => lang.code !== 'auto').map(lang => (
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
                <div className="bg-gray-800/80 rounded-xl p-4 border border-white/30">
                  <h4 className="font-semibold text-white mb-3">Translation Info</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Total Translations:</span>
                      <span className="text-yellow-400 font-medium">{translationHistory.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Target Language:</span>
                      <span className="text-yellow-400 font-medium">{languages.find(l => l.code === selectedTargetLanguage)?.nativeName || selectedTargetLanguage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Available Languages:</span>
                      <span className="text-green-400 font-medium">{languages.length - 1}</span>
                    </div>
                    {detectedLanguage && (
                      <div className="flex justify-between">
                        <span className="text-gray-300">Last Detected:</span>
                        <span className="text-green-300 font-medium">{languages.find(l => l.code === detectedLanguage)?.name || detectedLanguage}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Chat Interface - Enhanced with better scrolling */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Chat Container */}
              <div className="bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-700/50 shadow-xl overflow-hidden">
                
                {/* Chat Header with Enhanced Info */}
                <div className="bg-gray-800/80 p-4 border-b border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-blue-500 rounded-full flex items-center justify-center">
                        <FiMessageCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">Smart Translation Chat</h3>
                        <p className="text-sm text-gray-300 flex items-center space-x-2">
                          <span>Auto-detecting from</span>
                          <span className="font-medium text-yellow-400">
                            {languages.find(l => l.code === selectedSourceLanguage)?.name || selectedSourceLanguage}
                          </span>
                          <FiArrowRight className="w-3 h-3" />
                          <span className="font-medium text-yellow-400">
                            {languages.find(l => l.code === selectedTargetLanguage)?.nativeName || selectedTargetLanguage}
                          </span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {isTranslating && (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin">
                            <FiRefreshCw className="w-4 h-4 text-yellow-400" />
                          </div>
                          <span className="text-sm text-yellow-400">Translating...</span>
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-400">
                        {conversation.length - 1} messages
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Messages with Custom Scrolling */}
                <div className="h-96 overflow-y-auto p-4 space-y-4 custom-scroll">
                  {/* Messages will be populated here */}
                  <div className="text-center text-gray-400 py-8">
                    <FiMessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Start a conversation by typing a message below</p>
                    <p className="text-sm mt-2">Your message will be automatically translated to {languages.find(l => l.code === selectedTargetLanguage)?.name}</p>
                  </div>
                </div>
                
                {/* Enhanced Input Area */}
                <div className="border-t border-gray-700/50 p-4">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setIsListening(!isListening)}
                      className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                        isListening
                          ? 'border-red-400 bg-red-50 text-red-600 animate-pulse'
                          : 'border-gray-600 hover:border-blue-400 text-gray-400'
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
                        onKeyPress={(e) => e.key === 'Enter' && inputText.trim() && !isTranslating}
                        placeholder={`Type in ${languages.find(l => l.code === selectedSourceLanguage)?.name || 'any language'}...`}
                        className="w-full p-3 pr-20 border border-gray-600 rounded-xl bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white placeholder-gray-400"
                        maxLength={500}
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
                      onClick={() => inputText.trim() && !isTranslating}
                      disabled={!inputText.trim() || isTranslating}
                      className="p-3 bg-gradient-to-r from-yellow-400 to-blue-500 hover:from-yellow-500 hover:to-blue-600 text-white rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                      title="Send & Translate"
                    >
                      <FiSend className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* Language Detection Preview */}
                  {inputText.length > 3 && (
                    <div className="mt-2 text-xs text-gray-400 flex items-center space-x-2">
                      <FiSearch className="w-3 h-3 text-green-400" />
                      <span>Will auto-detect language and translate to {languages.find(l => l.code === selectedTargetLanguage)?.name}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Quick Phrases with better organization */}
              <div className="bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-700/50 shadow-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <FiHeart className="w-5 h-5 text-pink-400 mr-2" />
                  Quick Travel Phrases ({languages.length} Languages Supported)
                </h3>
                
                <div className="text-sm text-gray-300 mb-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-xl">
                  <FiZap className="w-4 h-4 inline mr-2 text-blue-400" />
                  <strong>Tip:</strong> Click any phrase to instantly translate it to {languages.find(l => l.code === selectedTargetLanguage)?.name}. 
                  Search above to find your specific language from our {languages.length - 1} supported languages!
                </div>
                
                {/* Quick phrases grid here - keep the existing structure */}
                <div className="grid gap-4">
                  <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-xl">
                    <h4 className="font-semibold text-green-400 mb-2">🚨 Emergency Phrases</h4>
                    <div className="grid md:grid-cols-2 gap-2">
                      {['I need help immediately!', 'Where is the nearest hospital?', 'Please call the police!'].map((phrase, i) => (
                        <button
                          key={i}
                          onClick={() => setInputText(phrase)}
                          className="p-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg text-left text-sm text-white transition-all duration-300"
                        >
                          {phrase}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-xl">
                    <h4 className="font-semibold text-blue-400 mb-2">🗺️ Directions</h4>
                    <div className="grid md:grid-cols-2 gap-2">
                      {['How do I get to the airport?', 'Where is the train station?', 'Is this the right way to downtown?'].map((phrase, i) => (
                        <button
                          key={i}
                          onClick={() => setInputText(phrase)}
                          className="p-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg text-left text-sm text-white transition-all duration-300"
                        >
                          {phrase}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-xl">
                    <h4 className="font-semibold text-yellow-400 mb-2">🍽️ Food & Dining</h4>
                    <div className="grid md:grid-cols-2 gap-2">
                      {['Can I see the menu please?', 'Do you have vegetarian options?', 'The bill, please.'].map((phrase, i) => (
                        <button
                          key={i}
                          onClick={() => setInputText(phrase)}
                          className="p-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg text-left text-sm text-white transition-all duration-300"
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
        </div>
      </div>
    </div>
  );
};

export default MultiLanguageSupport;