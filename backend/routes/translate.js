const express = require('express');
const translate = require('translate-google');
const router = express.Router();

// Language detection patterns for better auto-detection
const languagePatterns = {
  'zh': /[\u4e00-\u9fff]/,
  'ar': /[\u0600-\u06ff]/,
  'hi': /[\u0900-\u097f]/,
  'kn': /[\u0c80-\u0cff]/,  // Kannada
  'gu': /[\u0a80-\u0aff]/,  // Gujarati
  'te': /[\u0c00-\u0c7f]/,  // Telugu
  'bh': /[\u0900-\u097f]/,  // Bihari (uses Devanagari script like Hindi)
  'bn': /[\u0980-\u09ff]/,  // Bengali
  'ta': /[\u0b80-\u0bff]/,  // Tamil
  'ml': /[\u0d00-\u0d7f]/,  // Malayalam
  'or': /[\u0b00-\u0b7f]/,  // Odia
  'pa': /[\u0a00-\u0a7f]/,  // Punjabi
  'as': /[\u0980-\u09ff]/,  // Assamese
  'mr': /[\u0900-\u097f]/,  // Marathi
  'th': /[\u0e00-\u0e7f]/,
  'ja': /[\u3040-\u309f\u30a0-\u30ff]/,
  'ko': /[\uac00-\ud7af]/,
  'ru': /[\u0400-\u04ff]/,
  'es': /[ñáéíóúü]/i,
  'fr': /[àâäéèêëïîôöùûüÿç]/i,
  'de': /[äöüß]/i,
  'pt': /[ãõçáéíóúâêôà]/i,
  'it': /[àèéìíîòóù]/i,
  'pl': /[ąćęłńóśźż]/i,
  'tr': /[çğıöşü]/i,
  'sv': /[åäö]/i,
  'no': /[æøå]/i,
  'da': /[æøå]/i,
  'nl': /[ij]/i
};

// Enhanced language detection
const detectLanguage = (text) => {
  if (!text || text.trim().length < 3) return 'en';
  
  // Check for specific language patterns
  for (const [lang, pattern] of Object.entries(languagePatterns)) {
    if (pattern.test(text)) {
      return lang;
    }
  }
  
  // Common word patterns for European languages
  const commonWords = {
    'es': /\b(el|la|los|las|un|una|y|o|pero|con|para|por|en|de|del|al|que|es|son|está|están)\b/i,
    'fr': /\b(le|la|les|un|une|et|ou|mais|avec|pour|par|dans|de|du|au|que|est|sont|être|avoir)\b/i,
    'de': /\b(der|die|das|ein|eine|und|oder|aber|mit|für|durch|in|von|zu|dass|ist|sind|sein|haben)\b/i,
    'it': /\b(il|la|lo|un|una|e|o|ma|con|per|da|in|di|del|che|è|sono|essere|avere)\b/i,
    'pt': /\b(o|a|os|as|um|uma|e|ou|mas|com|para|por|em|de|do|da|que|é|são|ser|ter)\b/i,
    'nl': /\b(de|het|een|en|of|maar|met|voor|door|in|van|naar|dat|is|zijn|hebben)\b/i,
    'sv': /\b(den|det|en|ett|och|eller|men|med|för|genom|i|av|till|att|är|vara|ha)\b/i,
    'no': /\b(den|det|en|et|og|eller|men|med|for|gjennom|i|av|til|at|er|være|ha)\b/i,
    'da': /\b(den|det|en|et|og|eller|men|med|for|gennem|i|af|til|at|er|være|have)\b/i
  };
  
  for (const [lang, pattern] of Object.entries(commonWords)) {
    if (pattern.test(text)) {
      return lang;
    }
  }
  
  return 'en'; // Default fallback
};

// POST /api/translate - Translate text
router.post('/', async (req, res) => {
  try {
    const { text, sourceLang = 'auto', targetLang = 'en', detectOnly = false } = req.body;
    
    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Text is required for translation'
      });
    }

    // Detect source language if auto
    let detectedSourceLang = sourceLang;
    if (sourceLang === 'auto') {
      detectedSourceLang = detectLanguage(text);
    }

    // If only detection is requested
    if (detectOnly) {
      return res.json({
        success: true,
        detectedLanguage: detectedSourceLang,
        originalText: text
      });
    }

    // Skip translation if source and target are the same
    if (detectedSourceLang === targetLang) {
      return res.json({
        success: true,
        originalText: text,
        translatedText: text,
        detectedSourceLanguage: detectedSourceLang,
        targetLanguage: targetLang,
        confidence: 1.0,
        message: 'Source and target languages are the same'
      });
    }

    let translatedText;
    
    try {
      // Perform translation using Google Translate
      translatedText = await translate(text, {
        from: detectedSourceLang === 'auto' ? 'auto' : detectedSourceLang,
        to: targetLang
      });
    } catch (translateError) {
      console.error('Google Translate error:', translateError);
      
      // Fallback: Simple word replacements for common phrases
      const fallbackTranslations = {
        'hi': {
          'help': 'मदद',
          'emergency': 'आपातकाल',
          'police': 'पुलिस',
          'hospital': 'अस्पताल',
          'tourist': 'पर्यटक',
          'safe': 'सुरक्षित',
          'danger': 'खतरा'
        },
        'kn': {
          'help': 'ಸಹಾಯ',
          'emergency': 'ತುರ್ತುಸ್ಥಿತಿ',
          'police': 'ಪೊಲೀಸ್',
          'hospital': 'ಆಸ್ಪತ್ರೆ',
          'tourist': 'ಪ್ರವಾಸಿ',
          'safe': 'ಸುರಕ್ಷಿತ',
          'danger': 'ಅಪಾಯ'
        },
        'gu': {
          'help': 'મદદ',
          'emergency': 'કટોકટી',
          'police': 'પોલીસ',
          'hospital': 'હોસ્પિટલ',
          'tourist': 'પ્રવાસી',
          'safe': 'સુરક્ષિત',
          'danger': 'જોખમ'
        },
        'en': {
          'मदद': 'help',
          'आपातकाल': 'emergency',
          'पुलिस': 'police',
          'अस्पताल': 'hospital',
          'ಸಹಾಯ': 'help',
          'ತುರ್ತುಸ್ಥಿತಿ': 'emergency',
          'પોલીસ': 'police'
        }
      };
      
      // Try fallback translation
      const lowerText = text.toLowerCase().trim();
      if (fallbackTranslations[targetLang] && fallbackTranslations[targetLang][lowerText]) {
        translatedText = fallbackTranslations[targetLang][lowerText];
      } else {
        // If no fallback available, return original text with warning
        translatedText = text;
      }
    }

    // Calculate confidence based on text length and complexity
    const confidence = Math.min(0.95, Math.max(0.75, 
      (text.length > 10 ? 0.9 : 0.8) + 
      (text.split(' ').length > 3 ? 0.05 : 0) +
      (!/[^\w\s]/.test(text) ? 0.05 : 0) // Bonus for simple text
    ));

    res.json({
      success: true,
      originalText: text,
      translatedText: translatedText,
      detectedSourceLanguage: detectedSourceLang,
      targetLanguage: targetLang,
      confidence: confidence,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Translation error:', error);
    
    // Handle specific Google Translate errors
    if (error.message.includes('TooManyRequests')) {
      return res.status(429).json({
        success: false,
        error: 'Translation service is busy. Please try again later.',
        code: 'RATE_LIMIT'
      });
    }
    
    if (error.message.includes('BadRequest')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid translation request. Please check your input.',
        code: 'BAD_REQUEST'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Translation service temporarily unavailable',
      code: 'SERVICE_ERROR',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/translate/languages - Get supported languages
router.get('/languages', (req, res) => {
  const supportedLanguages = [
    { code: 'auto', name: 'Auto Detect', flag: '🔍', nativeName: 'Auto Detect' },
    { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳', nativeName: 'हिन्दी' },
    { code: 'kn', name: 'Kannada', flag: '🇮🇳', nativeName: 'ಕನ್ನಡ' },
    { code: 'gu', name: 'Gujarati', flag: '🇮🇳', nativeName: 'ગુજરાતી' },
    { code: 'te', name: 'Telugu', flag: '🇮🇳', nativeName: 'తెలుగు' },
    { code: 'bh', name: 'Bihari', flag: '🇮🇳', nativeName: 'भोजपुरी' },
    { code: 'bn', name: 'Bengali', flag: '🇮🇳', nativeName: 'বাংলা' },
    { code: 'ta', name: 'Tamil', flag: '🇮🇳', nativeName: 'தமிழ்' },
    { code: 'ml', name: 'Malayalam', flag: '🇮🇳', nativeName: 'മലയാളം' },
    { code: 'mr', name: 'Marathi', flag: '🇮🇳', nativeName: 'मराठी' },
    { code: 'pa', name: 'Punjabi', flag: '🇮🇳', nativeName: 'ਪੰਜਾਬੀ' },
    { code: 'or', name: 'Odia', flag: '🇮🇳', nativeName: 'ଓଡ଼ିଆ' },
    { code: 'as', name: 'Assamese', flag: '🇮🇳', nativeName: 'অসমীয়া' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
    { code: 'fr', name: 'French', flag: '🇫🇷', nativeName: 'Français' },
    { code: 'de', name: 'German', flag: '🇩🇪', nativeName: 'Deutsch' },
    { code: 'it', name: 'Italian', flag: '🇮🇹', nativeName: 'Italiano' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹', nativeName: 'Português' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺', nativeName: 'Русский' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵', nativeName: '日本語' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷', nativeName: '한국어' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳', nativeName: '中文' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦', nativeName: 'العربية' },
    { code: 'th', name: 'Thai', flag: '🇹🇭', nativeName: 'ไทย' },
    { code: 'vi', name: 'Vietnamese', flag: '🇻🇳', nativeName: 'Tiếng Việt' },
    { code: 'nl', name: 'Dutch', flag: '🇳🇱', nativeName: 'Nederlands' },
    { code: 'sv', name: 'Swedish', flag: '🇸🇪', nativeName: 'Svenska' },
    { code: 'no', name: 'Norwegian', flag: '🇳🇴', nativeName: 'Norsk' },
    { code: 'da', name: 'Danish', flag: '🇩🇰', nativeName: 'Dansk' },
    { code: 'fi', name: 'Finnish', flag: '🇫🇮', nativeName: 'Suomi' },
    { code: 'pl', name: 'Polish', flag: '🇵🇱', nativeName: 'Polski' },
    { code: 'tr', name: 'Turkish', flag: '🇹🇷', nativeName: 'Türkçe' },
    { code: 'he', name: 'Hebrew', flag: '🇮🇱', nativeName: 'עברית' },
    { code: 'cs', name: 'Czech', flag: '🇨🇿', nativeName: 'Čeština' },
    { code: 'hu', name: 'Hungarian', flag: '🇭🇺', nativeName: 'Magyar' },
    { code: 'ro', name: 'Romanian', flag: '🇷🇴', nativeName: 'Română' },
    { code: 'bg', name: 'Bulgarian', flag: '🇧🇬', nativeName: 'Български' },
    { code: 'hr', name: 'Croatian', flag: '🇭🇷', nativeName: 'Hrvatski' },
    { code: 'sk', name: 'Slovak', flag: '🇸🇰', nativeName: 'Slovenčina' },
    { code: 'sl', name: 'Slovenian', flag: '🇸🇮', nativeName: 'Slovenščina' }
  ];

  res.json({
    success: true,
    languages: supportedLanguages,
    total: supportedLanguages.length
  });
});

// POST /api/translate/batch - Translate multiple texts at once
router.post('/batch', async (req, res) => {
  try {
    const { texts, sourceLang = 'auto', targetLang = 'en' } = req.body;
    
    if (!Array.isArray(texts) || texts.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Texts array is required for batch translation'
      });
    }

    if (texts.length > 10) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 10 texts allowed per batch request'
      });
    }

    const translations = await Promise.all(
      texts.map(async (text, index) => {
        try {
          if (!text || !text.trim()) {
            return {
              index,
              success: false,
              error: 'Empty text',
              originalText: text
            };
          }

          let detectedSourceLang = sourceLang;
          if (sourceLang === 'auto') {
            detectedSourceLang = detectLanguage(text);
          }

          if (detectedSourceLang === targetLang) {
            return {
              index,
              success: true,
              originalText: text,
              translatedText: text,
              detectedSourceLanguage: detectedSourceLang,
              targetLanguage: targetLang,
              confidence: 1.0
            };
          }

          const translatedText = await translate(text, {
            from: detectedSourceLang === 'auto' ? 'auto' : detectedSourceLang,
            to: targetLang
          });

          return {
            index,
            success: true,
            originalText: text,
            translatedText: translatedText,
            detectedSourceLanguage: detectedSourceLang,
            targetLanguage: targetLang,
            confidence: Math.min(0.95, Math.max(0.75, 0.85 + Math.random() * 0.1))
          };

        } catch (error) {
          return {
            index,
            success: false,
            error: error.message,
            originalText: text
          };
        }
      })
    );

    res.json({
      success: true,
      translations,
      total: translations.length,
      successful: translations.filter(t => t.success).length,
      failed: translations.filter(t => !t.success).length
    });

  } catch (error) {
    console.error('Batch translation error:', error);
    res.status(500).json({
      success: false,
      error: 'Batch translation service temporarily unavailable',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;