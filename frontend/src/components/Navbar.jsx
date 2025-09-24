import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiBell, FiMessageCircle, FiUser, FiShield, FiMenu, FiX, FiLogOut, FiSun, FiMoon, FiCpu } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import { clearAuth, getUserData } from '../services/api';
// Temporarily disable theme context to fix navbar visibility
// import { useTheme } from '../contexts/ThemeContext';

const Navbar = ({ onMenuToggle, isMenuOpen }) => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [messages, setMessages] = useState(2);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const { t } = useTranslation();

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // Apply theme to document
    if (!isDarkMode) {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
    localStorage.setItem('theme', !isDarkMode ? 'dark' : 'light');
  };
  const navigate = useNavigate();
  
  const userData = getUserData();
  const isAuthenticated = !!userData;

  useEffect(() => {
    // Initialize theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      const isDark = savedTheme === 'dark';
      setIsDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      }
    }

    // Enhanced navbar slide-in animation
    const navbar = document.querySelector('.enhanced-navbar');
    if (navbar) {
      navbar.style.transform = 'translateY(-100%)';
      navbar.style.opacity = '0';
      setTimeout(() => {
        navbar.style.transform = 'translateY(0)';
        navbar.style.opacity = '1';
      }, 300);
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/login-selection');
    setUserMenuOpen(false);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  return (
    <>
      {/* Enhanced Premium Navbar */}
      <nav className="enhanced-navbar fixed top-0 left-0 right-0 z-50 h-16 sm:h-20 transition-all duration-500 ease-out" style={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(20px)' }}>
        {/* Glassmorphism Background */}
        <div className="absolute inset-0 bg-white/5 dark:bg-black/20 backdrop-blur-2xl border-b border-white/10 dark:border-white/5" style={{ background: 'rgba(0, 0, 0, 0.2)', backdropFilter: 'blur(20px)' }}></div>
        
        <div className="relative z-10 max-w-full mx-auto px-4 sm:px-6 h-full">
          <div className="flex items-center justify-between h-full">
            
            {/* Left Section: Logo & Mobile Menu */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Mobile Menu Toggle */}
              <button
                onClick={onMenuToggle}
                className="lg:hidden p-2.5 sm:p-3 rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-white/20 dark:border-white/10 text-gray-700 dark:text-white/90 hover:text-gray-900 dark:hover:text-white hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 group touch-manipulation shadow-lg"
              >
                <div className="relative">
                  {isMenuOpen ? (
                    <FiX size={18} className="sm:w-5 sm:h-5 group-hover:rotate-90 transition-transform duration-300" />
                  ) : (
                    <FiMenu size={18} className="sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-300" />
                  )}
                </div>
              </button>

              {/* Enhanced Trāṇa Logo */}
              <Link to="/" className="flex items-center space-x-3 group cursor-pointer">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center group-hover:scale-105 transition-all duration-300 shadow-lg">
                  <FiShield size={20} className="sm:w-6 sm:h-6 text-white drop-shadow-lg" />
                </div>
                <div className="flex flex-col">
                  <div className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                    <span className="sm:hidden">Trāṇa</span>
                    <span className="hidden sm:inline">Trāṇa (त्राण)</span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 hidden sm:block font-medium">
                    Safety • Protection • Guardian
                  </div>
                </div>
              </Link>
            </div>

            {/* Center: Enhanced Search Bar */}
            <div className="hidden md:flex flex-1 max-w-xl lg:max-w-2xl mx-4 lg:mx-8">
              <form onSubmit={handleSearch} className="w-full relative group">
                <div className={`bg-white/20 dark:bg-white/5 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-2xl transition-all duration-500 shadow-lg ${
                  searchFocused ? 'border-indigo-400/50 dark:border-indigo-400/30 transform scale-105 shadow-xl' : 'hover:border-white/40 dark:hover:border-white/20'
                }`}>
                  <div className="flex items-center px-4 lg:px-6 py-3 lg:py-3.5">
                    <FiSearch 
                      size={18} 
                      className={`lg:w-5 lg:h-5 transition-all duration-300 ${
                        searchFocused ? 'text-indigo-500 dark:text-indigo-400 animate-pulse' : 'text-gray-600 dark:text-gray-400'
                      }`} 
                    />
                    <input
                      type="text"
                      placeholder={t('navbar.searchPlaceholder', 'Search locations, emergency alerts...')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => setSearchFocused(false)}
                      className="ml-3 lg:ml-4 bg-transparent border-0 outline-none text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 w-full font-medium text-sm"
                    />
                    {searchQuery && (
                      <button
                        type="submit"
                        className="ml-2 lg:ml-3 bg-indigo-500 hover:bg-indigo-600 text-white px-3 lg:px-5 py-1.5 lg:py-2 text-xs lg:text-sm font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        <FiSearch size={14} className="lg:hidden" />
                        <span className="hidden lg:flex items-center">
                          <FiSearch size={16} className="mr-2" />
                          {t('navbar.search', 'Search')}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>

            {/* Right Section: Actions & Profile */}
            <div className="flex items-center space-x-2 lg:space-x-3">
              
              {/* Theme Toggle */}
              <button 
                onClick={toggleTheme}
                className="p-2.5 sm:p-3 rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-white/20 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 shadow-lg"
              >
                {isDarkMode ? <FiSun size={16} className="sm:w-5 sm:h-5" /> : <FiMoon size={16} className="sm:w-5 sm:h-5" />}
              </button>

              {/* Language Selector */}
              <LanguageSwitcher />

              {/* Mobile Search */}
              <button className="md:hidden p-2.5 sm:p-3 rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-white/20 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 shadow-lg touch-manipulation">
                <FiSearch size={16} className="sm:w-5 sm:h-5" />
              </button>

              {/* Notifications & Messages */}
              {isAuthenticated && (
                <>
                  <button className="relative group p-2.5 sm:p-3 rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-white/20 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 shadow-lg touch-manipulation">
                    <FiBell size={16} className="sm:w-5 sm:h-5 group-hover:animate-bounce" />
                    {notifications > 0 && (
                      <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center animate-pulse font-bold shadow-lg">
                        {notifications}
                      </span>
                    )}
                  </button>

                  <button className="relative group p-2.5 sm:p-3 rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-white/20 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 shadow-lg touch-manipulation">
                    <FiMessageCircle size={16} className="sm:w-5 sm:h-5 group-hover:scale-110" />
                    {messages > 0 && (
                      <span className="absolute -top-1 -right-1 bg-gradient-to-r from-emerald-500 to-blue-500 text-white text-xs w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center animate-pulse font-bold shadow-lg">
                        {messages}
                      </span>
                    )}
                  </button>
                </>
              )}

              {/* Profile Section */}
              {isAuthenticated ? (
                <div className="relative group">
                  <button 
                    onClick={toggleUserMenu}
                    className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-2.5 rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 shadow-lg group touch-manipulation"
                  >
                    <div className="relative">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <FiUser size={14} className="sm:w-4 sm:h-4 text-white" />
                      </div>
                    </div>
                    <span className="hidden lg:block text-sm font-semibold capitalize text-gray-800 dark:text-gray-200 max-w-24 truncate">
                      {userData.name || userData.userType}
                    </span>
                  </button>
                  
                  {/* Enhanced Profile Dropdown */}
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-3 w-56 bg-white/20 dark:bg-black/40 backdrop-blur-2xl rounded-2xl p-4 border border-white/20 dark:border-white/10 shadow-2xl animate-slide-in z-50">
                      <div className="space-y-3">
                        <div className="text-center pb-3 border-b border-white/20 dark:border-white/10">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mx-auto mb-3 shadow-lg">
                            <FiUser size={20} className="text-white" />
                          </div>
                          <div className="text-sm font-bold text-gray-800 dark:text-gray-200 capitalize">
                            {userData.name || userData.userType}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 truncate px-2">
                            {userData.email}
                          </div>
                          <div className="text-xs font-semibold mt-2 px-3 py-1 rounded-xl bg-gradient-to-r from-emerald-500/20 to-blue-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                            {userData.userType === 'tourist' ? '🛡️ Protected Tourist' : '👮 Authority Access'}
                          </div>
                        </div>
                        
                        <Link
                          to="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="w-full text-left px-3 py-2.5 rounded-xl flex items-center space-x-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 touch-manipulation"
                        >
                          <FiUser size={16} />
                          <span className="text-sm font-medium">{t('navbar.profile', 'My Profile')}</span>
                        </Link>
                        
                        <Link
                          to="/qr-id"
                          onClick={() => setUserMenuOpen(false)}
                          className="w-full text-left px-3 py-2.5 rounded-xl flex items-center space-x-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 touch-manipulation"
                        >
                          <FiCpu size={16} />
                          <span className="text-sm font-medium">{t('navbar.qr', 'Digital ID')}</span>
                        </Link>
                        
                        <hr className="border-white/20 dark:border-white/10 my-2" />
                        
                        <button 
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-red-500/20 transition-all duration-300 text-red-500 dark:text-red-400 flex items-center space-x-3 font-semibold touch-manipulation"
                        >
                          <FiLogOut size={16} />
                          <span className="text-sm">{t('navbar.logout', 'Sign Out')}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex space-x-3">
                  <Link
                    to="/login-selection"
                    className="px-4 lg:px-6 py-2 lg:py-2.5 text-sm font-semibold rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-white/20 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 shadow-lg"
                  >
                    {t('navbar.login', 'Login')}
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 lg:px-6 py-2 lg:py-2.5 text-sm font-bold rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    {t('navbar.register', 'Register')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Search Overlay */}
      <div className="md:hidden fixed top-20 left-0 right-0 z-40 px-4 py-3 bg-white/20 dark:bg-black/20 backdrop-blur-xl border-b border-white/10 dark:border-white/5">
        <form onSubmit={handleSearch} className="relative">
          <div className={`bg-white/20 dark:bg-white/5 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-2xl transition-all duration-500 shadow-lg ${
            searchFocused ? 'border-indigo-400/50 dark:border-indigo-400/30' : ''
          }`}>
            <div className="flex items-center px-4 py-3">
              <FiSearch size={18} className={`transition-colors duration-300 ${searchFocused ? 'text-indigo-500 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}`} />
              <input
                type="text"
                placeholder={t('navbar.searchPlaceholder', 'Search locations, emergency...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="ml-3 bg-transparent border-0 outline-none text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 w-full text-sm font-medium"
              />
              {searchQuery && (
                <button
                  type="submit"
                  className="ml-2 p-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold transition-all duration-300 shadow-lg"
                >
                  <FiSearch size={14} />
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Click Outside to Close Dropdowns */}
      {userMenuOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setUserMenuOpen(false)}
        ></div>
      )}

      {/* Spacer for Fixed Navbar */}
      <div className="h-16 sm:h-20"></div>
      <div className="md:hidden h-16"></div>
    </>
  );
};

export default Navbar;