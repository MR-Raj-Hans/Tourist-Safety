import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      navbar: {
        title: 'SafeTravel',
        dashboard: 'Dashboard',
        qr: 'My QR',
        alerts: 'My Alerts',
        policeDashboard: 'Police Dashboard',
        activeAlerts: 'Active Alerts',
        geoFences: 'Geo-Fences',
        profile: 'Profile',
        logout: 'Logout',
        login: 'Login',
        register: 'Register'
      },
      
      // Common
      common: {
        loading: 'Loading...',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        view: 'View',
        close: 'Close',
        refresh: 'Refresh',
        search: 'Search',
        filter: 'Filter',
        export: 'Export',
        import: 'Import'
      },

      // Login
      login: {
        title: 'Sign in to your account',
        subtitle: 'Stay safe with real-time monitoring',
        userType: 'I am a:',
        tourist: 'Tourist',
        police: 'Police Officer',
        email: 'Email address',
        emailPlaceholder: 'Enter your email',
        password: 'Password',
        passwordPlaceholder: 'Enter your password',
        signIn: 'Sign in',
        signingIn: 'Signing in...',
        noAccount: "Don't have an account?",
        signUp: 'Sign up',
        success: 'Login successful!',
        error: 'Login failed. Please check your credentials.',
        demo: {
          title: 'Demo Credentials:',
          tourist: 'Tourist',
          police: 'Police'
        }
      },

      // Dashboard
      dashboard: {
        welcome: 'Welcome to SafeTravel',
        subtitle: 'Your safety is our priority. Monitor your location and stay connected.',
        location: 'Location',
        enabled: 'Enabled',
        disabled: 'Disabled',
        riskLevel: 'Risk Level',
        unknown: 'Unknown',
        activeAlerts: 'Active Alerts',
        lastUpdate: 'Last Update',
        safetyAssessment: 'Safety Assessment',
        currentRisk: 'Current Risk Level',
        refresh: 'Refresh',
        riskFactors: 'Risk Factors:',
        recommendations: 'Recommendations:',
        yourLocation: 'Your Location',
        recentAlerts: 'Recent Alerts'
      },

      // Panic Button
      panic: {
        title: 'Emergency Alert',
        description: 'Hold the button for 3 seconds to send an emergency alert',
        selectType: 'Select Alert Type:',
        types: {
          panic: 'Panic Alert',
          medical: 'Medical Emergency',
          crime: 'Crime Report',
          lost: 'Lost/Need Help'
        },
        button: 'PANIC',
        quickAlert: 'Quick Alert',
        instructions: {
          hold: 'Hold to activate:',
          holdDesc: 'Press and hold the panic button for 3 seconds',
          quick: 'Quick alert:',
          quickDesc: 'Click "Quick Alert" for immediate activation'
        },
        locationEnabled: 'Location services enabled',
        locationDisabled: 'Location services disabled',
        coordinates: 'Coordinates',
        enableLocation: 'Please enable location services for emergency alerts',
        success: 'Emergency alert sent successfully!',
        errors: {
          noLocation: 'Location not available. Please enable location services.',
          failed: 'Failed to send alert. Please try again.'
        },
        confirmation: {
          title: 'Alert Sent Successfully!',
          message: 'Emergency services have been notified and will respond shortly.',
          ok: 'OK'
        }
      },

      // QR Code
      qr: {
        title: 'Generate Safety QR Code',
        form: {
          locationName: 'Location Name (Optional)',
          locationPlaceholder: 'e.g., Hotel Lobby, Tourist Center',
          expiry: 'Expiry Time',
          expiry1h: '1 Hour',
          expiry6h: '6 Hours',
          expiry12h: '12 Hours',
          expiry24h: '24 Hours',
          expiry48h: '2 Days',
          expiry1w: '1 Week'
        },
        currentLocation: 'Current Location',
        generating: 'Generating...',
        generate: 'Generate QR Code',
        current: {
          title: 'Your Current QR Code',
          info: 'QR Code Information',
          created: 'Created'
        },
        status: {
          expired: 'Expired',
          active: 'Active',
          expiresIn: 'Expires in {{time}}',
          hoursMinutes: '{{hours}}h {{minutes}}m',
          minutes: '{{minutes}}m'
        },
        actions: {
          download: 'Download',
          share: 'Share'
        },
        instructions: {
          title: 'How to use:',
          show: 'Show this QR code to police or authorities when requested',
          contains: 'Contains your contact information and current location',
          expires: 'QR code expires automatically for security',
          generate: 'Generate a new code when this one expires'
        },
        history: {
          title: 'QR Code History',
          noLocation: 'No location name',
          created: 'Created',
          scans: 'Scans'
        },
        share: {
          title: 'My Safety QR Code',
          text: 'Here is my current location and contact information for safety purposes.',
          copied: 'QR data copied to clipboard!'
        },
        success: {
          generated: 'QR code generated successfully!'
        },
        errors: {
          noLocation: 'Location not available. Please enable location services.',
          generation: 'Failed to generate QR code. Please try again.'
        }
      },

      // Map
      map: {
        yourLocation: 'Your Location',
        accuracy: 'Accuracy',
        alertTypes: {
          panic: 'PANIC ALERT',
          medical: 'MEDICAL EMERGENCY',
          crime: 'CRIME REPORT',
          lost: 'LOST/NEED HELP'
        },
        tourist: 'Tourist',
        policeOfficer: 'Police Officer',
        priority: 'Priority',
        time: 'Time',
        description: 'Description',
        contact: 'Contact',
        name: 'Name',
        nationality: 'Nationality',
        status: 'Status',
        lastUpdate: 'Last Update',
        badge: 'Badge',
        rank: 'Rank',
        station: 'Station',
        created: 'Created',
        fenceTypes: {
          safe_zone: 'SAFE ZONE',
          restricted_zone: 'RESTRICTED ZONE',
          tourist_area: 'TOURIST AREA'
        }
      },

      // Location
      location: {
        notSupported: 'Geolocation is not supported by this browser.',
        error: 'Unable to retrieve your location. Please enable location services.'
      },

      // Safety
      safety: {
        restrictedZone: 'You are in a restricted area. Please exercise caution.',
        highRisk: 'High risk area detected. Stay alert and consider alternative routes.'
      },

      // Alert Types
      alertTypes: {
        panic: 'PANIC ALERT',
        medical: 'MEDICAL EMERGENCY',
        crime: 'CRIME REPORT',
        lost: 'LOST/NEED HELP'
      },

      // Registration
      'create_account': 'Create Account',
      'sign_in_existing': 'sign in to your existing account',
      'full_name': 'Full Name',
      'passport_number': 'Passport Number',
      'nationality': 'Nationality',
      'account_type': 'Account Type',
      'select_account_type': 'Select the type of account you want to create',
      'tourist': 'Tourist',
      'police_officer': 'Police Officer',
      'confirm_password': 'Confirm Password',
      'passwords_do_not_match': 'Passwords do not match',
      'password_min_length': 'Password must be at least 6 characters',
      'registration_successful': 'Registration successful',
      'registration_failed': 'Registration failed',
      'creating_account': 'Creating account...',
      'by_signing_up': 'By signing up, you agree to our',
      'terms_of_service': 'Terms of Service',
      'and': 'and',
      'privacy_policy': 'Privacy Policy',

      // Police Dashboard
      'police_dashboard': 'Police Dashboard',
      'police_dashboard_subtitle': 'Monitor tourist safety and respond to emergencies',
      'total_tourists': 'Total Tourists',
      'active_alerts': 'Active Alerts',
      'resolved_today': 'Resolved Today',
      'avg_response_time': 'Avg Response Time',
      'loading_dashboard': 'Loading dashboard...',
      'emergency_alerts': 'Emergency Alerts',
      'tourist_map': 'Tourist Map',
      'qr_scanner': 'QR Scanner',
      'geo_fences': 'Geo-fences',
      'no_active_alerts': 'No active alerts at the moment',
      'priority': 'Priority',
      'investigate': 'Investigate',
      'resolve': 'Resolve',
      'last_seen': 'Last seen',
      'type': 'Type',
      'radius': 'Radius',
      'enter_qr_code': 'Enter QR Code',
      'qr_code_placeholder': 'Enter QR code to scan tourist information',
      'scan': 'Scan',
      'tourist_information': 'Tourist Information',
      'qr_generated': 'QR Generated',
      'please_enter_qr_code': 'Please enter a QR code',
      'qr_code_scanned_successfully': 'QR code scanned successfully',
      'invalid_qr_code': 'Invalid QR code',
      'error_scanning_qr_code': 'Error scanning QR code',
      'create_geo_fence': 'Create Geo-fence',
      'safe_zone': 'Safe Zone',
      'restricted_zone': 'Restricted Zone',
      'warning_zone': 'Warning Zone',
      'latitude': 'Latitude',
      'longitude': 'Longitude',
      'description': 'Description',
      'existing_geo_fences': 'Existing Geo-fences',
      'no_geo_fences_created': 'No geo-fences have been created yet',
      'delete': 'Delete',
      'confirm_delete_geo_fence': 'Are you sure you want to delete this geo-fence?',
      'geo_fence_created_successfully': 'Geo-fence created successfully',
      'error_creating_geo_fence': 'Error creating geo-fence',
      'geo_fence_deleted_successfully': 'Geo-fence deleted successfully',
      'error_deleting_geo_fence': 'Error deleting geo-fence',
      'alert_updated_successfully': 'Alert updated successfully',
      'error_updating_alert': 'Error updating alert',
      'error_loading_data': 'Error loading data',
      'new_emergency_alert': 'New Emergency Alert',

      // Status
      'active': 'Active',
      'investigating': 'Investigating',
      'resolved': 'Resolved',
      'high': 'High',
      'medium': 'Medium',
      'low': 'Low'
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
        logout: 'Cerrar Sesión',
        login: 'Iniciar Sesión',
        register: 'Registrarse'
      },
      common: {
        loading: 'Cargando...',
        save: 'Guardar',
        cancel: 'Cancelar',
        refresh: 'Actualizar'
      },
      login: {
        title: 'Inicia sesión en tu cuenta',
        subtitle: 'Mantente seguro con monitoreo en tiempo real',
        tourist: 'Turista',
        police: 'Oficial de Policía',
        email: 'Correo electrónico',
        password: 'Contraseña',
        signIn: 'Iniciar Sesión',
        success: '¡Inicio de sesión exitoso!',
        error: 'Error al iniciar sesión. Verifica tus credenciales.'
      },
      dashboard: {
        welcome: 'Bienvenido a ViajeSeguro',
        subtitle: 'Tu seguridad es nuestra prioridad. Monitorea tu ubicación y mantente conectado.',
        location: 'Ubicación',
        enabled: 'Habilitado',
        disabled: 'Deshabilitado'
      },

      // Registro
      'create_account': 'Crear Cuenta',
      'sign_in_existing': 'inicia sesión en tu cuenta existente',
      'full_name': 'Nombre Completo',
      'passport_number': 'Número de Pasaporte',
      'nationality': 'Nacionalidad',
      'account_type': 'Tipo de Cuenta',
      'select_account_type': 'Selecciona el tipo de cuenta que deseas crear',
      'tourist': 'Turista',
      'police_officer': 'Oficial de Policía',
      'confirm_password': 'Confirmar Contraseña',
      'passwords_do_not_match': 'Las contraseñas no coinciden',
      'password_min_length': 'La contraseña debe tener al menos 6 caracteres',
      'registration_successful': 'Registro exitoso',
      'registration_failed': 'Error en el registro',
      'creating_account': 'Creando cuenta...',
      'by_signing_up': 'Al registrarte, aceptas nuestros',
      'terms_of_service': 'Términos de Servicio',
      'and': 'y',
      'privacy_policy': 'Política de Privacidad',

      // Panel de Policía
      'police_dashboard': 'Panel de Policía',
      'police_dashboard_subtitle': 'Monitorea la seguridad turística y responde a emergencias',
      'total_tourists': 'Total de Turistas',
      'active_alerts': 'Alertas Activas',
      'resolved_today': 'Resueltas Hoy',
      'avg_response_time': 'Tiempo Prom. Respuesta',
      'loading_dashboard': 'Cargando panel...',
      'emergency_alerts': 'Alertas de Emergencia',
      'tourist_map': 'Mapa de Turistas',
      'qr_scanner': 'Escáner QR',
      'geo_fences': 'Geo-cercas',
      'no_active_alerts': 'No hay alertas activas en este momento',
      'priority': 'Prioridad',
      'investigate': 'Investigar',
      'resolve': 'Resolver',
      'last_seen': 'Última vez visto',
      'type': 'Tipo',
      'radius': 'Radio',
      'enter_qr_code': 'Ingresar Código QR',
      'qr_code_placeholder': 'Ingresa código QR para escanear información del turista',
      'scan': 'Escanear',
      'tourist_information': 'Información del Turista',
      'qr_generated': 'QR Generado',
      'please_enter_qr_code': 'Por favor ingresa un código QR',
      'qr_code_scanned_successfully': 'Código QR escaneado exitosamente',
      'invalid_qr_code': 'Código QR inválido',
      'error_scanning_qr_code': 'Error al escanear código QR',
      'create_geo_fence': 'Crear Geo-cerca',
      'safe_zone': 'Zona Segura',
      'restricted_zone': 'Zona Restringida',
      'warning_zone': 'Zona de Advertencia',
      'latitude': 'Latitud',
      'longitude': 'Longitud',
      'description': 'Descripción',
      'existing_geo_fences': 'Geo-cercas Existentes',
      'no_geo_fences_created': 'No se han creado geo-cercas aún',
      'delete': 'Eliminar',
      'confirm_delete_geo_fence': '¿Estás seguro de que quieres eliminar esta geo-cerca?',
      'geo_fence_created_successfully': 'Geo-cerca creada exitosamente',
      'error_creating_geo_fence': 'Error al crear geo-cerca',
      'geo_fence_deleted_successfully': 'Geo-cerca eliminada exitosamente',
      'error_deleting_geo_fence': 'Error al eliminar geo-cerca',
      'alert_updated_successfully': 'Alerta actualizada exitosamente',
      'error_updating_alert': 'Error al actualizar alerta',
      'error_loading_data': 'Error al cargar datos',
      'new_emergency_alert': 'Nueva Alerta de Emergencia',

      // Estado
      'active': 'Activo',
      'investigating': 'Investigando',
      'resolved': 'Resuelto',
      'high': 'Alto',
      'medium': 'Medio',
      'low': 'Bajo'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    
    interpolation: {
      escapeValue: false // react already does escaping
    },
    
    react: {
      useSuspense: false
    }
  });

export default i18n;