import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiArrowLeft, FiShield } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { authAPI, setAuthToken, setUserData } from '../services/api';
import socketService from '../services/socket';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';

const Login = () => {
  const [searchParams] = useSearchParams();
  const loginType = searchParams.get('type') || 'user';
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: loginType === 'admin' ? 'police' : 'tourist'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Update userType when loginType changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      userType: loginType === 'admin' ? 'police' : 'tourist'
    }));
  }, [loginType]);

  const getPageTitle = () => {
    if (loginType === 'admin') {
      return t('login.adminTitle', 'Admin Login');
    }
    return t('login.userTitle', 'Tourist Login');
  };

  const getPageSubtitle = () => {
    if (loginType === 'admin') {
      return t('login.adminSubtitle', 'Access administrative dashboard');
    }
    return t('login.userSubtitle', 'Stay safe with real-time monitoring');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authAPI.login(formData);
      const { data, token } = response.data;

      // Store auth data
      setAuthToken(token);
      setUserData(data);

      // Connect to socket
      socketService.connect(data);

      toast.success(t('login.success', 'Login successful!'));

      // Redirect based on user type
      if (data.userType === 'tourist') {
        navigate('/dashboard');
      } else {
        navigate('/police-dashboard');
      }

    } catch (error) {
      console.error('Login error:', error);
      toast.error(
        error.response?.data?.message || 
        t('login.error', 'Login failed. Please check your credentials.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoLogin = () => {
    // Set demo auth in localStorage using keys used by services/api.js
    localStorage.setItem('authToken', 'demo-token');
    localStorage.setItem('userData', JSON.stringify({ userType: formData.userType, email: formData.userType === 'tourist' ? 'tourist@demo.com' : 'admin@demo.com' }));
    socketService.connect({ userType: formData.userType });
    navigate(formData.userType === 'tourist' ? '/dashboard' : '/police-dashboard');
    toast.success('Auto logged in (demo)');
  };

  return (
    <div className="min-h-screen bg-gradient-aurora relative overflow-hidden flex flex-col justify-center py-6 px-4 sm:py-12 sm:px-6 lg:px-8">
      <Navbar />
      
      <div className="relative z-10 mx-auto w-full max-w-sm sm:max-w-md">
        <div className="text-center">
          {/* Back Button */}
          <button
            onClick={() => navigate('/login-selection')}
            className="btn-glassmorphism inline-flex items-center text-sm mb-6 sm:mb-8 transition-all duration-300"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Back to selection
          </button>
          
          {/* Trāṇa Branding */}
          <div className="mb-6 sm:mb-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 premium-glass-enhanced rounded-2xl flex items-center justify-center">
              <FiShield size={24} className="premium-text-gold sm:hidden" />
              <FiShield size={30} className="premium-text-gold hidden sm:block" />
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold gradient-text-primary">
              {getPageTitle()}
            </h2>
            <p className="mt-2 sm:mt-3 text-base sm:text-lg premium-text">
              Welcome to <span className="font-bold premium-text-gold">Trāṇa (त्राण)</span>
            </p>
            <p className="text-xs sm:text-sm premium-text-secondary">
              {getPageSubtitle()}
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="premium-glass-enhanced p-8 rounded-3xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* User Type Display - Read Only */}
            <div>
              <label className="block text-sm font-medium premium-text mb-3 sm:mb-4">
                {t('login.loginAs', 'Logging in as:')}
              </label>
              <div className={`premium-glass-enhanced p-3 sm:p-4 text-sm font-medium rounded-2xl transition-all duration-300 ${
                loginType === 'admin'
                  ? 'border-purple-400/50 bg-purple-500/20 text-purple-100'
                  : 'border-blue-400/50 bg-blue-500/20 text-blue-100'
              }`}>
                <div className="flex items-center justify-center">
                  <FiUser className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 drop-shadow" />
                  <span className="text-sm sm:text-base drop-shadow">
                    {loginType === 'admin' 
                      ? t('login.admin', 'Administrator') 
                      : t('login.tourist', 'Tourist')
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2 sm:mb-3 drop-shadow">
                {t('login.email', 'Email address')}
              </label>
              <div className="relative group">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="glass w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 rounded-xl border border-white/20 text-white placeholder-white/50 focus:border-sapphire-400 focus:glow-sapphire transition-all duration-300 bg-white/5 touch-manipulation text-base"
                  placeholder={t('login.emailPlaceholder', 'Enter your email')}
                />
                <FiMail className="h-4 w-4 sm:h-5 sm:w-5 text-white/60 absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 group-focus-within:text-sapphire-400 transition-colors" />
              </div>
            </div>

            {/* Password Field */}
            <div className="animate-slide-in" style={{animationDelay: '1s'}}>
              <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2 sm:mb-3">
                {t('login.password', 'Password')}
              </label>
              <div className="relative group">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="glass w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 rounded-xl border border-white/20 text-white placeholder-white/50 focus:border-sapphire-400 focus:glow-sapphire transition-all duration-300 bg-white/5 touch-manipulation text-base"
                  placeholder={t('login.passwordPlaceholder', 'Enter your password')}
                />
                <FiLock className="h-4 w-4 sm:h-5 sm:w-5 text-white/60 absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 group-focus-within:text-sapphire-400 transition-colors" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-sapphire-400 transition-colors touch-manipulation"
                >
                  {showPassword ? <FiEyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <FiEye className="h-4 w-4 sm:h-5 sm:w-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="animate-slide-in" style={{animationDelay: '1.2s'}}>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-premium w-full py-3 sm:py-4 text-base sm:text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
              >
                {isLoading ? (
                  <>
                    <div className="spinner w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3"></div>
                    {t('login.signingIn', 'Signing in...')}
                  </>
                ) : (
                  t('login.signIn', 'Sign in')
                )}
              </button>
            </div>

            {/* Register Link */}
            <div className="text-center animate-slide-in" style={{animationDelay: '1.4s'}}>
              <span className="text-xs sm:text-sm text-white/70">
                {t('login.noAccount', "Don't have an account?")} {' '}
                <Link
                  to="/register"
                  className="font-semibold text-sapphire-400 hover:text-sapphire-300 glow-sapphire-subtle transition-all duration-300 touch-manipulation"
                >
                  {t('login.signUp', 'Sign up')}
                </Link>
              </span>
            </div>
          </form>

            {/* Demo Credentials */}
            <div className="glass p-4 sm:p-6 rounded-xl border border-white/10 animate-slide-in" style={{animationDelay: '1.6s'}}>
              <h4 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-accent-400 rounded-full mr-2 sm:mr-3 animate-pulse"></div>
                {t('login.demo.title', 'Demo Credentials:')}
              </h4>
              <div className="text-xs sm:text-sm text-white/80 space-y-2 mb-3 sm:mb-4">
                {loginType === 'admin' ? (
                  <div className="glass p-2 sm:p-3 rounded-lg bg-gold-500/10 border border-gold-400/20">
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <strong className="text-gold-300 text-xs sm:text-sm">{t('login.demo.admin', 'Admin')}:</strong> 
                      <span className="text-white/90 text-xs sm:text-sm sm:ml-2 break-all">admin@demo.com / admin123</span>
                    </div>
                  </div>
                ) : (
                  <div className="glass p-2 sm:p-3 rounded-lg bg-sapphire-500/10 border border-sapphire-400/20">
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <strong className="text-sapphire-300 text-xs sm:text-sm">{t('login.demo.tourist', 'Tourist')}:</strong> 
                      <span className="text-white/90 text-xs sm:text-sm sm:ml-2 break-all">tourist@demo.com / password123</span>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <button
                  onClick={handleAutoLogin}
                  className="btn-glass w-full py-2.5 sm:py-3 text-xs sm:text-sm font-semibold hover:glow-emerald transition-all duration-300 touch-manipulation"
                >
                  <span className="flex items-center justify-center">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-400 rounded-full mr-1.5 sm:mr-2 animate-pulse"></div>
                    Auto Login (Demo)
                  </span>
                </button>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;