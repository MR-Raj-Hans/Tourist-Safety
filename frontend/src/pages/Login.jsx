import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { authAPI, setAuthToken, setUserData } from '../services/api';
import socketService from '../services/socket';
import { toast } from 'react-toastify';

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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          {/* Back Button */}
          <button
            onClick={() => navigate('/login-selection')}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Back to selection
          </button>
          
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {getPageTitle()}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {getPageSubtitle()}
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Type Display - Read Only */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t('login.loginAs', 'Logging in as:')}
              </label>
              <div className={`p-3 text-sm font-medium rounded-lg border ${
                loginType === 'admin'
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-blue-500 bg-blue-50 text-blue-700'
              }`}>
                <div className="flex items-center justify-center">
                  <FiUser className="h-5 w-5 mr-2" />
                  {loginType === 'admin' 
                    ? t('login.admin', 'Administrator') 
                    : t('login.tourist', 'Tourist')
                  }
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t('login.email', 'Email address')}
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder={t('login.emailPlaceholder', 'Enter your email')}
                />
                <FiMail className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t('login.password', 'Password')}
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-10 pr-10"
                  placeholder={t('login.passwordPlaceholder', 'Enter your password')}
                />
                <FiLock className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <div className="spinner w-4 h-4 mr-2"></div>
                    {t('login.signingIn', 'Signing in...')}
                  </>
                ) : (
                  t('login.signIn', 'Sign in')
                )}
              </button>
            </div>

            {/* Register Link */}
            <div className="text-center">
              <span className="text-sm text-gray-600">
                {t('login.noAccount', "Don't have an account?")} {' '}
                <Link
                  to="/register"
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  {t('login.signUp', 'Sign up')}
                </Link>
              </span>
            </div>
          </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-800 mb-2">
                {t('login.demo.title', 'Demo Credentials:')}
              </h4>
              <div className="text-xs text-gray-600 space-y-1">
                {loginType === 'admin' ? (
                  <div>
                    <strong>{t('login.demo.admin', 'Admin')}:</strong> admin@demo.com / admin123
                  </div>
                ) : (
                  <div>
                    <strong>{t('login.demo.tourist', 'Tourist')}:</strong> tourist@demo.com / password123
                  </div>
                )}
              </div>
              <div className="mt-3">
                <button
                  onClick={handleAutoLogin}
                  className="w-full px-4 py-2 rounded-md bg-primary-600 text-white text-sm font-medium hover:bg-primary-700"
                >
                  Auto Login (Demo)
                </button>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;