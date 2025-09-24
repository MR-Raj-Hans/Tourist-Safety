import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      navbar: {
        title: 'Trana',
        dashboard: 'Dashboard',
        qr: 'My QR',
        alerts: 'My Alerts',
        profile: 'Profile',
        logout: 'Logout',
        login: 'Login',
        register: 'Register',
        searchPlaceholder: 'Search locations, emergency alerts...',
        search: 'Search',
        emergency: 'Emergency',
        analytics: 'Analytics'
      },
      common: {
        loading: 'Loading...',
        save: 'Save',
        cancel: 'Cancel',
        refresh: 'Refresh'
      },
      login: {
        title: 'Sign in to your account',
        subtitle: 'Stay safe with real-time monitoring',
        tourist: 'Tourist',
        police: 'Police Officer',
        signIn: 'Sign in',
        success: 'Login successful!',
        error: 'Login failed. Please check your credentials.',
        adminTitle: 'Admin Login',
        userTitle: 'Tourist Login',
        adminSubtitle: 'Access administrative dashboard',
        userSubtitle: 'Stay safe with real-time monitoring',
        loginAs: 'Logging in as:',
        admin: 'Administrator',
        email: 'Email address',
        emailPlaceholder: 'Enter your email',
        password: 'Password',
        passwordPlaceholder: 'Enter your password',
        signingIn: 'Signing in...'
      },
      dashboard: {
        welcome: 'Welcome to Trana',
        subtitle: 'Your safety is our priority. Monitor your location and stay connected.',
        location: 'Location',
        enabled: 'Enabled',
        disabled: 'Disabled'
      },
      features: {
        emergency: 'Emergency Alerts',
        emergencyDesc: 'Instant panic button with real-time alerts to authorities.',
        analytics: 'Analytics Dashboard', 
        analyticsDesc: 'Comprehensive analytics and reporting with real-time insights.',
        qr: 'QR Identification',
        qrDesc: 'Dynamic QR codes for instant identification by authorities.',
        location: 'Location Tracking',
        locationDesc: 'Real-time GPS tracking with intelligent geo-fence monitoring.',
        language: 'Multi-language Support',
        languageDesc: 'Comprehensive language support with real-time translation.',
        ai: 'AI Risk Assessment',
        aiDesc: 'Advanced machine learning algorithms to predict and assess safety risks.'
      },
      create_account: 'Create Account',
      tourist: 'Tourist',
      police_officer: 'Police Officer',
      registration_successful: 'Registration successful',
      registration_failed: 'Registration failed',
      active: 'Active',
      investigating: 'Investigating',
      resolved: 'Resolved',
      high: 'High',
      medium: 'Medium',
      low: 'Low'
    }
  },
  es: {
    translation: {
      navbar: {
        title: 'ViajeSeguro',
        dashboard: 'Panel',
        qr: 'Mi QR',
        alerts: 'Mis Alertas',
        profile: 'Perfil',
        logout: 'Cerrar Sesion',
        login: 'Iniciar Sesion',
        register: 'Registrarse'
      },
      common: {
        loading: 'Cargando...',
        save: 'Guardar',
        cancel: 'Cancelar',
        refresh: 'Actualizar'
      },
      login: {
        title: 'Inicia sesion en tu cuenta',
        subtitle: 'Mantente seguro con monitoreo en tiempo real',
        tourist: 'Turista',
        police: 'Oficial de Policia',
        signIn: 'Iniciar Sesion',
        success: 'Inicio de sesion exitoso!',
        error: 'Error al iniciar sesion.',
        adminTitle: 'Inicio de Administrador',
        userTitle: 'Inicio de Turista',
        adminSubtitle: 'Acceder al panel administrativo',
        userSubtitle: 'Mantente seguro con monitoreo en tiempo real',
        loginAs: 'Iniciando sesion como:',
        admin: 'Administrador',
        email: 'Direccion de correo',
        emailPlaceholder: 'Ingresa tu correo',
        password: 'Contraseña',
        passwordPlaceholder: 'Ingresa tu contraseña',
        signingIn: 'Iniciando sesion...'
      },
      dashboard: {
        welcome: 'Bienvenido a ViajeSeguro',
        subtitle: 'Tu seguridad es nuestra prioridad.',
        location: 'Ubicacion',
        enabled: 'Habilitado',
        disabled: 'Deshabilitado'
      },
      features: {
        emergency: 'Alertas de Emergencia',
        emergencyDesc: 'Boton de panico instantaneo con alertas en tiempo real.',
        analytics: 'Panel de Analisis',
        analyticsDesc: 'Analisis y reportes integrales.',
        qr: 'Identificacion QR',
        qrDesc: 'Codigos QR dinamicos para identificacion instantanea.',
        location: 'Seguimiento de Ubicacion',
        locationDesc: 'Seguimiento GPS en tiempo real.',
        language: 'Soporte Multiidioma',
        languageDesc: 'Soporte integral de idiomas.',
        ai: 'Evaluacion de Riesgo AI',
        aiDesc: 'Algoritmos avanzados de aprendizaje automatico.'
      },
      create_account: 'Crear Cuenta',
      tourist: 'Turista',
      police_officer: 'Oficial de Policia',
      registration_successful: 'Registro exitoso',
      registration_failed: 'Error en el registro',
      active: 'Activo',
      investigating: 'Investigando',
      resolved: 'Resuelto',
      high: 'Alto',
      medium: 'Medio',
      low: 'Bajo'
    }
  },
  hi: {
    translation: {
      navbar: {
        title: 'त्राण',
        dashboard: 'डैशबोर्ड',
        qr: 'मेरा QR',
        alerts: 'मेरे अलर्ट',
        profile: 'प्रोफ़ाइल',
        logout: 'लॉग आउट',
        login: 'लॉग इन',
        register: 'पंजीकरण',
        searchPlaceholder: 'स्थान, आपातकालीन अलर्ट खोजें...',
        search: 'खोजें',
        emergency: 'आपातकाल',
        analytics: 'एनालिटिक्स'
      },
      common: {
        loading: 'लोड हो रहा है...',
        save: 'सेव करें',
        cancel: 'रद्द करें',
        refresh: 'रिफ्रेश करें'
      },
      login: {
        title: 'अपने खाते में साइन इन करें',
        subtitle: 'रियल-टाइम मॉनिटरिंग के साथ सुरक्षित रहें',
        tourist: 'पर्यटक',
        police: 'पुलिस अधिकारी',
        signIn: 'साइन इन करें',
        success: 'लॉगिन सफल रहा!',
        error: 'लॉगिन असफल हुआ। कृपया अपनी जानकारी जांचें।',
        adminTitle: 'प्रशासक लॉगिन',
        userTitle: 'पर्यटक लॉगिन',
        adminSubtitle: 'प्रशासनिक डैशबोर्ड तक पहुंच',
        userSubtitle: 'रियल-टाइम मॉनिटरिंग के साथ सुरक्षित रहें',
        loginAs: 'इस रूप में लॉगिन कर रहे हैं:',
        admin: 'प्रशासक',
        email: 'ईमेल पता',
        emailPlaceholder: 'अपना ईमेल दर्ज करें',
        password: 'पासवर्ड',
        passwordPlaceholder: 'अपना पासवर्ड दर्ज करें',
        signingIn: 'साइन इन हो रहा है...'
      },
      dashboard: {
        welcome: 'त्राण में आपका स्वागत है',
        subtitle: 'आपकी सुरक्षा हमारी प्राथमिकता है। अपने स्थान की निगरानी करें और जुड़े रहें।',
        location: 'स्थान',
        enabled: 'सक्रिय',
        disabled: 'निष्क्रिय',
        riskLevel: 'जोखिम आकलन',
        unknown: 'स्कैन हो रहा है...',
        activeAlerts: 'सक्रिय अलर्ट',
        lastUpdate: 'अंतिम सिंक',
        recentAlerts: 'हाल के अलर्ट',
        emergency: 'आपातकालीन नियंत्रण',
        panicHelp: 'आपातकालीन अलर्ट भेजने के लिए 3 सेकंड दबाकर रखें',
        qrId: 'डिजिटल ID',
        quickActions: 'त्वरित क्रियाएं'
      },
      features: {
        emergency: 'आपातकालीन अलर्ट',
        emergencyDesc: 'प्राधिकरणों को रियल-टाइम अलर्ट के साथ तुरंत पैनिक बटन।',
        analytics: 'एनालिटिक्स डैशबोर्ड', 
        analyticsDesc: 'रियल-टाइम अंतर्दृष्टि के साथ व्यापक विश्लेषण और रिपोर्टिंग।',
        qr: 'QR पहचान',
        qrDesc: 'प्राधिकरणों द्वारा तुरंत पहचान के लिए डायनामिक QR कोड।',
        location: 'स्थान ट्रैकिंग',
        locationDesc: 'बुद्धिमान जियो-फेंस मॉनिटरिंग के साथ रियल-टाइम GPS ट्रैकिंग।',
        language: 'बहुभाषी समर्थन',
        languageDesc: 'रियल-टाइम अनुवाद के साथ व्यापक भाषा समर्थन।',
        ai: 'AI जोखिम आकलन',
        aiDesc: 'सुरक्षा जोखिमों की भविष्यवाणी और आकलन के लिए उन्नत मशीन लर्निंग एल्गोरिदम।'
      },
      create_account: 'खाता बनाएं',
      tourist: 'पर्यटक',
      police_officer: 'पुलिस अधिकारी',
      registration_successful: 'पंजीकरण सफल',
      registration_failed: 'पंजीकरण असफल',
      active: 'सक्रिय',
      investigating: 'जांच में',
      resolved: 'हल हो गया',
      high: 'उच्च',
      medium: 'मध्यम',
      low: 'कम',
      safety: {
        restrictedZone: 'आप एक प्रतिबंधित क्षेत्र में हैं। कृपया सावधानी बरतें।',
        highRisk: 'उच्च जोखिम क्षेत्र का पता चला। सतर्क रहें और वैकल्पिक मार्गों पर विचार करें।'
      },
      alertTypes: {
        theft: 'चोरी',
        accident: 'दुर्घटना',
        harassment: 'उत्पीड़न',
        medical: 'चिकित्सा',
        fire: 'आग',
        natural_disaster: 'प्राकृतिक आपदा'
      }
    }
  },
  ta: {
    translation: {
      navbar: {
        title: 'त्राण',
        dashboard: 'டாஷ்போர்ட்',
        qr: 'என் QR',
        alerts: 'என் எச்சரிக்கைகள்',
        profile: 'சுயவிவரம்',
        logout: 'வெளியேறு',
        login: 'உள்நுழை',
        register: 'பதிவு செய்',
        searchPlaceholder: 'இடங்கள், அவசர எச்சரிக்கைகளைத் தேடுங்கள்...',
        search: 'தேடு',
        emergency: 'அவசரநிலை',
        analytics: 'பகுப்பாய்வு'
      },
      common: {
        loading: 'ஏற்றப்படுகிறது...',
        save: 'சேமி',
        cancel: 'ரத்து செய்',
        refresh: 'புதுப்பி'
      },
      login: {
        title: 'உங்கள் கணக்கில் உள்நுழைக',
        subtitle: 'நிகழ்நேர கண்காணிப்புடன் பாதுகாப்பாக இருங்கள்',
        tourist: 'சுற்றுலாப் பயணி',
        police: 'போலீஸ் அதிகாரி',
        signIn: 'உள்நுழை',
        success: 'உள்நுழைவு வெற்றிகரமானது!',
        error: 'உள்நுழைவு தோல்வியடைந்தது। உங்கள் விவரங்களைச் சரிபார்க்கவும்।'
      },
      dashboard: {
        welcome: 'त्राण இல் உங்களை வரவேற்கிறோம்',
        subtitle: 'உங்கள் பாதுகாப்பு எங்களுக்கு முன்னுரிமை. உங்கள் இடத்தைக் கண்காணித்து இணைந்திருங்கள்।',
        location: 'இடம்',
        enabled: 'செயல்படுத்தப்பட்டது',
        disabled: 'முடக்கப்பட்டது',
        riskLevel: 'ஆபத்து மதிப்பீடு',
        unknown: 'ஸ்கேன் செய்யப்படுகிறது...',
        activeAlerts: 'செயலில் உள்ள எச்சரிக்கைகள்',
        lastUpdate: 'கடைசி ஒத்திசைவு',
        recentAlerts: 'சமீபத்திய எச்சரிக்கைகள்',
        emergency: 'அவசரகால கட்டுப்பாடு',
        panicHelp: 'அவசர எச்சரிக்கை அனுப்ப 3 வினாடிகள் அழுத்திப் பிடிக்கவும்',
        qrId: 'டிஜிட்டல் அடையாளம்',
        quickActions: 'விரைவு செயல்கள்'
      },
      features: {
        emergency: 'அவசரகால எச்சரிக்கைகள்',
        emergencyDesc: 'அதிகாரிகளுக்கு நிகழ்நேர எச்சரிக்கைகளுடன் உடனடி பீதி பொத்தான்.',
        analytics: 'பகுப்பாய்வு டாஷ்போர்ட்',
        analyticsDesc: 'நிகழ்நேர நுண்ணறிவுகளுடன் விரிவான பகுப்பாய்வு மற்றும் அறிக்கையிடல்.',
        qr: 'QR அடையாளம்',
        qrDesc: 'அதிகாரிகளால் உடனடி அடையாளத்திற்கான டைனமிக் QR குறியீடுகள்.',
        location: 'இடக் கண்காணிப்பு',
        locationDesc: 'அறிவார்ந்த ஜியோ-ஃபென்ஸ் கண்காணிப்புடன் நிகழ்நேர GPS கண்காணிப்பு.',
        language: 'பல மொழி ஆதரவு',
        languageDesc: 'நிகழ்நேர மொழிபெயர்ப்புடன் விரிவான மொழி ஆதரவு.',
        ai: 'AI ஆபத்து மதிப்பீடு',
        aiDesc: 'பாதுகாப்பு ஆபத்துகளை முன்னறிவிக்க மற்றும் மதிப்பிடுவதற்கான மேம்பட்ட இயந்திர கற்றல் வழிமுறைகள்.'
      },
      create_account: 'கணக்கை உருவாக்கு',
      tourist: 'சுற்றுலாப் பயணி',
      police_officer: 'போலீஸ் அதிகாரி',
      registration_successful: 'பதிவு வெற்றிகரமானது',
      registration_failed: 'பதிவு தோல்வியடைந்தது',
      active: 'செயலில்',
      investigating: 'விசாரணையில்',
      resolved: 'தீர்க்கப்பட்டது',
      high: 'உயர்ந்த',
      medium: 'நடுத்தர',
      low: 'குறைந்த',
      safety: {
        restrictedZone: 'நீங்கள் தடைசெய்யப்பட்ட பகுதியில் இருக்கிறீர்கள். தயவுசெய்து எச்சரிக்கையாக இருங்கள்.',
        highRisk: 'அதிக ஆபத்துள்ள பகுதி கண்டறியப்பட்டது. விழிப்புடன் இருந்து மாற்று வழிகளைக் கவனியுங்கள்.'
      },
      alertTypes: {
        theft: 'திருட்டு',
        accident: 'விபத்து',
        harassment: 'துன்புறுத்தல்',
        medical: 'மருத்துவம்',
        fire: 'தீ',
        natural_disaster: 'இயற்கை பேரழிவு'
      }
    }
  },
  te: {
    translation: {
      navbar: {
        title: 'त्राण',
        dashboard: 'డాష్‌బోర్డ్',
        qr: 'నా QR',
        alerts: 'నా హెచ్చరికలు',
        profile: 'ప్రొఫైల్',
        logout: 'లాగ్ అవుట్',
        login: 'లాగిన్',
        register: 'నమోదు',
        searchPlaceholder: 'స్థానాలు, అత్యవసర హెచ్చరికలను వెతకండి...',
        search: 'వెతకండి',
        emergency: 'అత్యవసరం',
        analytics: 'విశ్లేషణలు'
      },
      common: {
        loading: 'లోడ్ అవుతోంది...',
        save: 'సేవ్ చేయండి',
        cancel: 'రద్దు చేయండి',
        refresh: 'రిఫ్రెష్ చేయండి'
      },
      login: {
        title: 'మీ ఖాతాలో సైన్ ఇన్ చేయండి',
        subtitle: 'రియల్-టైమ్ మానిటరింగ్‌తో సురక్షితంగా ఉండండి',
        tourist: 'పర్యాటకుడు',
        police: 'పోలీస్ అధికారి',
        signIn: 'సైన్ ఇన్ చేయండి',
        success: 'లాగిన్ విజయవంతమైంది!',
        error: 'లాగిన్ విఫలమైంది. దయచేసి మీ వివరాలను తనిఖీ చేయండి.'
      },
      dashboard: {
        welcome: 'त्राण కు స్వాగతం',
        subtitle: 'మీ భద్రత మా ప్రాధాన్యత. మీ స్థానాన్ని పర్యవేక్షించండి మరియు కనెక్ట్‌గా ఉండండి.',
        location: 'స్థానం',
        enabled: 'ప్రారంభించబడింది',
        disabled: 'నిలిపివేయబడింది',
        riskLevel: 'ప్రమాద అంచనా',
        unknown: 'స్కాన్ చేస్తోంది...',
        activeAlerts: 'క్రియాశీల హెచ్చరికలు',
        lastUpdate: 'చివరి సింక్',
        recentAlerts: 'ఇటీవలి హెచ్చరికలు',
        emergency: 'అత్యవసర నియంత్రణ',
        panicHelp: 'అత్యవసర హెచ్చరిక పంపడానికి 3 సెకన్లు నొక్కి పట్టుకోండి',
        qrId: 'డిజిటల్ ID',
        quickActions: 'వేగవంతమైన చర్యలు'
      },
      features: {
        emergency: 'అత్యవసర హెచ్చరికలు',
        emergencyDesc: 'అధికారులకు రియల్-టైమ్ హెచ్చరికలతో తక్షణ పానిక్ బటన్.',
        analytics: 'విశ్లేషణల డాష్‌బోర్డ్',
        analyticsDesc: 'రియల్-టైమ్ అంతర్దృష్టులతో సమగ్ర విశ్లేషణ మరియు రిపోర్టింగ్.',
        qr: 'QR గుర్తింపు',
        qrDesc: 'అధికారుల ద్వారా తక్షణ గుర్తింపు కోసం డైనమిక్ QR కోడ్‌లు.',
        location: 'స్థాన ట్రాకింగ్',
        locationDesc: 'తెలివైన జియో-ఫెన్స్ మానిటరింగ్‌తో రియల్-టైమ్ GPS ట్రాకింగ్.',
        language: 'బహుభాషా మద్దతు',
        languageDesc: 'రియల్-టైమ్ అనువాదంతో సమగ్ర భాషా మద్దతు.',
        ai: 'AI ప్రమాద అంచనా',
        aiDesc: 'భద్రతా ప్రమాదాలను అంచనా వేయడానికి మరియు అంచనా వేయడానికి అధునాతన మెషిన్ లర్నింగ్ అల్గారిథమ్‌లు.'
      },
      create_account: 'ఖాతా సృష్టించండి',
      tourist: 'పర్యాటకుడు',
      police_officer: 'పోలీస్ అధికారి',
      registration_successful: 'నమోదు విజయవంతమైంది',
      registration_failed: 'నమోదు విఫలమైంది',
      active: 'క్రియాశీలం',
      investigating: 'దర్యాప్తులో',
      resolved: 'పరిష్కరించబడింది',
      high: 'అధిక',
      medium: 'మధ్యస్థ',
      low: 'తక్కువ',
      safety: {
        restrictedZone: 'మీరు నిషేధిత ప్రాంతంలో ఉన్నారు. దయచేసి జాగ్రత్త వహించండి.',
        highRisk: 'అధిక ప్రమాద ప్రాంతం కనుగొనబడింది. అప్రమత్తంగా ఉండండి మరియు ప్రత్యామనాయ మార్గాలను పరిగణించండి.'
      },
      alertTypes: {
        theft: 'దొంగతనం',
        accident: 'ప్రమాదం',
        harassment: 'వేధింపులు',
        medical: 'వైద్యం',
        fire: 'అగ్ని',
        natural_disaster: 'సహజ విపత్తు'
      }
    }
  },
  bn: {
    translation: {
      navbar: {
        title: 'त्राण',
        dashboard: 'ড্যাশবোর্ড',
        qr: 'আমার QR',
        alerts: 'আমার সতর্কতা',
        profile: 'প্রোফাইল',
        logout: 'লগ আউট',
        login: 'লগ ইন',
        register: 'নিবন্ধন',
        searchPlaceholder: 'স্থান, জরুরি সতর্কতা অনুসন্ধান করুন...',
        search: 'অনুসন্ধান',
        emergency: 'জরুরি অবস্থা',
        analytics: 'বিশ্লেষণ'
      },
      common: {
        loading: 'লোড হচ্ছে...',
        save: 'সংরক্ষণ',
        cancel: 'বাতিল',
        refresh: 'রিফ্রেশ'
      },
      login: {
        title: 'আপনার অ্যাকাউন্টে সাইন ইন করুন',
        subtitle: 'রিয়েল-টাইম মনিটরিং এর সাথে নিরাপদ থাকুন',
        tourist: 'পর্যটক',
        police: 'পুলিশ অফিসার',
        signIn: 'সাইন ইন করুন',
        success: 'লগইন সফল হয়েছে!',
        error: 'লগইন ব্যর্থ হয়েছে। দয়া করে আপনার তথ্য পরীক্ষা করুন।'
      },
      dashboard: {
        welcome: 'त्राण এ স্বাগতম',
        subtitle: 'আপনার নিরাপত্তা আমাদের অগ্রাধিকার। আপনার অবস্থান নিরীক্ষণ করুন এবং সংযুক্ত থাকুন।',
        location: 'অবস্থান',
        enabled: 'সক্রিয়',
        disabled: 'নিষ্ক্রিয়',
        riskLevel: 'ঝুঁকি মূল্যায়ন',
        unknown: 'স্ক্যান করা হচ্ছে...',
        activeAlerts: 'সক্রিয় সতর্কতা',
        lastUpdate: 'শেষ সিঙ্ক',
        recentAlerts: 'সাম্প্রতিক সতর্কতা',
        emergency: 'জরুরি নিয়ন্ত্রণ',
        panicHelp: 'জরুরি সতর্কতা পাঠাতে ৩ সেকেন্ড চেপে ধরুন',
        qrId: 'ডিজিটাল আইডি',
        quickActions: 'দ্রুত ক্রিয়া'
      },
      features: {
        emergency: 'জরুরি সতর্কতা',
        emergencyDesc: 'কর্তৃপক্ষের কাছে রিয়েল-টাইম সতর্কতাসহ তাৎক্ষণিক প্যানিক বোতাম।',
        analytics: 'বিশ্লেষণ ড্যাশবোর্ড',
        analyticsDesc: 'রিয়েল-টাইম অন্তর্দৃষ্টিসহ ব্যাপক বিশ্লেষণ এবং রিপোর্টিং।',
        qr: 'QR সনাক্তকরণ',
        qrDesc: 'কর্তৃপক্ষের দ্বারা তাৎক্ষণিক সনাক্তকরণের জন্য ডায়নামিক QR কোড।',
        location: 'অবস্থান ট্র্যাকিং',
        locationDesc: 'বুদ্ধিমান জিও-ফেন্স মনিটরিং সহ রিয়েল-টাইম GPS ট্র্যাকিং।',
        language: 'বহুভাষিক সমর্থন',
        languageDesc: 'রিয়েল-টাইম অনুবাদসহ ব্যাপক ভাষা সমর্থন।',
        ai: 'AI ঝুঁকি মূল্যায়ন',
        aiDesc: 'নিরাপত্তা ঝুঁকি ভবিষ্যদ্বাণী এবং মূল্যায়নের জন্য উন্নত মেশিন লার্নিং অ্যালগরিদম।'
      },
      create_account: 'অ্যাকাউন্ট তৈরি করুন',
      tourist: 'পর্যটক',
      police_officer: 'পুলিশ অফিসার',
      registration_successful: 'নিবন্ধন সফল',
      registration_failed: 'নিবন্ধন ব্যর্থ',
      active: 'সক্রিয়',
      investigating: 'তদন্তাধীন',
      resolved: 'সমাধান হয়েছে',
      high: 'উচ্চ',
      medium: 'মধ্যম',
      low: 'নিম্ন',
      safety: {
        restrictedZone: 'আপনি একটি নিষিদ্ধ এলাকায় আছেন। দয়া করে সতর্ক থাকুন।',
        highRisk: 'উচ্চ ঝুঁকিপূর্ণ এলাকা সনাক্ত হয়েছে। সতর্ক থাকুন এবং বিকল্প পথ বিবেচনা করুন।'
      },
      alertTypes: {
        theft: 'চুরি',
        accident: 'দুর্ঘটনা',
        harassment: 'হয়রানি',
        medical: 'চিকিৎসা',
        fire: 'আগুন',
        natural_disaster: 'প্রাকৃতিক দুর্যোগ'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('selectedLanguage') || 'en', // Load saved language preference
    fallbackLng: 'en',
    debug: false, // Set to true for debugging
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  });

// Listen for language changes and save to localStorage
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('selectedLanguage', lng);
});

export default i18n;