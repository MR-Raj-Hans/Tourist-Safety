import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiPhone, FiGlobe, FiShield, FiLock, FiEye, FiEyeOff, FiUserCheck } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { register } from '../services/api';
import Navbar from '../components/Navbar';

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    passport: '',
    nationality: '',
    emergencyContact: '',
    userType: 'tourist'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error(t('passwords_do_not_match'));
      return;
    }

    if (formData.password.length < 6) {
      toast.error(t('password_min_length'));
      return;
    }

    setLoading(true);

    try {
      const response = await register(formData);
      
      if (response.success) {
        toast.success(t('registration_successful'));
        navigate('/login');
      } else {
        toast.error(response.message || t('registration_failed'));
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || t('registration_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-aurora relative overflow-hidden">
      <Navbar />
      
      {/* Main Content */}
      <div className="relative z-10 pt-4">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-3xl premium-glass-enhanced flex items-center justify-center shadow-lg">
                <FiShield className="text-lg sm:text-xl premium-text-gold" />
              </div>
              <div className="ml-2 sm:ml-3">
                <h1 className="text-xl sm:text-2xl font-bold premium-text-bold">
                  Trāṇa (त्राण)
                </h1>
                <p className="text-xs sm:text-sm premium-text-secondary">Join Your Safety Guardian</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full">
          
          {/* Welcome Section */}
          <div className="text-center mb-6 sm:mb-8 animate-slide-in">
            <h2 className="text-2xl sm:text-3xl font-bold premium-text-bold mb-3 sm:mb-4">
              Create Your Protection Account
            </h2>
            <p className="text-sm sm:text-base premium-text mb-1 sm:mb-2">
              Join thousands of travelers protected by Trāṇa
            </p>
            <p className="text-xs sm:text-sm premium-text-secondary">
              Already have an account?{' '}
              <Link to="/login" className="premium-text-gold hover:text-yellow-300 font-medium touch-manipulation">
                Sign in here
              </Link>
            </p>
          </div>
          
          {/* Registration Form */}
          <div className="premium-glass-enhanced p-6 sm:p-8 rounded-3xl animate-slide-in" style={{animationDelay: '0.2s'}}>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Personal Information Section */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-bold premium-text-bold flex items-center gap-2 mb-3 sm:mb-4">
                  <FiUser className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                  <span className="text-sm sm:text-base">Personal Information</span>
                </h3>
                
                {/* Name & Email Row */}
                <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="relative">
                    <FiUser className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 premium-text-secondary" />
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      className="w-full pl-10 sm:pl-12 pr-4 py-3 premium-glass-enhanced border border-white/20 rounded-2xl premium-text placeholder-white/50 focus:border-emerald-500 transition-all duration-300 touch-manipulation text-base"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="relative">
                    <FiMail className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 premium-text-secondary" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="w-full pl-10 sm:pl-12 pr-4 py-3 premium-glass-enhanced border border-white/20 rounded-2xl premium-text placeholder-white/50 focus:border-emerald-500 transition-all duration-300 touch-manipulation text-base"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                {/* Phone & Passport Row */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="relative">
                    <FiPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 premium-text-secondary" />
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      className="w-full pl-12 pr-4 py-3 premium-glass-enhanced border border-white/20 rounded-2xl premium-text placeholder-white/50 focus:border-emerald-500 transition-all duration-300"
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="relative">
                    <FiGlobe className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 premium-text-secondary" />
                    <input
                      id="passport"
                      name="passport"
                      type="text"
                      required
                      className="w-full pl-12 pr-4 py-3 premium-glass-enhanced border border-white/20 rounded-2xl premium-text placeholder-white/50 focus:border-emerald-500 transition-all duration-300"
                      placeholder="Passport Number"
                      value={formData.passport}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                {/* Nationality & Emergency Contact Row */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="relative">
                    <FiGlobe className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 premium-text-secondary" />
                    <input
                      id="nationality"
                      name="nationality"
                      type="text"
                      required
                      className="w-full pl-12 pr-4 py-3 premium-glass-enhanced border border-white/20 rounded-2xl premium-text placeholder-white/50 focus:border-emerald-500 transition-all duration-300"
                      placeholder="Nationality"
                      value={formData.nationality}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="relative">
                    <FiPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 premium-text-secondary" />
                    <input
                      id="emergencyContact"
                      name="emergencyContact"
                      type="tel"
                      required
                      className="w-full pl-12 pr-4 py-3 premium-glass-enhanced border border-white/20 rounded-2xl premium-text placeholder-white/50 focus:border-emerald-500 transition-all duration-300"
                      placeholder="Emergency Contact"
                      value={formData.emergencyContact}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Security Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold premium-text-bold flex items-center gap-2 mb-4">
                  <FiLock className="w-5 h-5 text-blue-400" />
                  Security
                </h3>
                
                {/* Password Row */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 premium-text-secondary" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      className="w-full pl-12 pr-12 py-3 premium-glass-enhanced border border-white/20 rounded-2xl premium-text placeholder-white/50 focus:border-blue-500 transition-all duration-300"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 premium-text-secondary hover:premium-text"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 premium-text-secondary" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      className="w-full pl-12 pr-12 py-3 premium-glass-enhanced border border-white/20 rounded-2xl premium-text placeholder-white/50 focus:border-blue-500 transition-all duration-300"
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 premium-text-secondary hover:premium-text"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Account Type Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold premium-text-bold flex items-center gap-2 mb-4">
                  <FiUserCheck className="w-5 h-5 text-purple-400" />
                  Account Type
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <label 
                    className={`premium-glass-enhanced p-4 rounded-2xl cursor-pointer border-2 transition-all duration-300 ${
                      formData.userType === 'tourist' ? 'border-emerald-500' : 'border-white/20'
                    }`}
                  >
                    <input
                      type="radio"
                      name="userType"
                      value="tourist"
                      checked={formData.userType === 'tourist'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        formData.userType === 'tourist' ? 'border-emerald-500 bg-emerald-500' : 'border-white/40'
                      }`}>
                        {formData.userType === 'tourist' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                      <FiUser className="w-5 h-5 text-emerald-400" />
                      <div>
                        <p className="font-bold premium-text">Tourist</p>
                        <p className="text-xs premium-text-secondary">Personal safety dashboard</p>
                      </div>
                    </div>
                  </label>
                  
                  <label 
                    className={`premium-glass-enhanced p-4 rounded-2xl cursor-pointer border-2 transition-all duration-300 ${
                      formData.userType === 'police' ? 'border-purple-500' : 'border-white/20'
                    }`}
                  >
                    <input
                      type="radio"
                      name="userType"
                      value="police"
                      checked={formData.userType === 'police'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        formData.userType === 'police' ? 'border-purple-500 bg-purple-500' : 'border-white/40'
                      }`}>
                        {formData.userType === 'police' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                      <FiShield className="w-5 h-5 text-purple-400" />
                      <div>
                        <p className="font-bold premium-text">Police Officer</p>
                        <p className="text-xs premium-text-secondary">Administrative control</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-glassmorphism w-full py-4 px-6 font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <FiUserCheck className="w-5 h-5" />
                    <span>Create Protection Account</span>
                  </div>
                )}
              </button>

              {/* Terms & Privacy */}
              <div className="text-center">
                <p className="text-xs premium-text-secondary">
                  By creating an account, you agree to our{' '}
                  <a href="#" className="premium-text-gold hover:text-yellow-300 underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="premium-text-gold hover:text-yellow-300 underline">
                    Privacy Policy
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;