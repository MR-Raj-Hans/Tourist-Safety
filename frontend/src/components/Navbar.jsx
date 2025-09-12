import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiUser, FiLogOut, FiGlobe, FiShield, FiMapPin } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import { clearAuth, getUserData } from '../services/api';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const userData = getUserData();
  const isAuthenticated = !!userData;

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  return (
    <nav className="bg-primary-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center">
              <FiShield className="h-8 w-8 text-white mr-2" />
              <span className="text-white text-xl font-bold">
                {t('navbar.title', 'SafeTravel')}
              </span>
            </Link>

            {/* Desktop Navigation */}
            {isAuthenticated && (
              <div className="hidden md:block ml-10">
                <div className="flex space-x-4">
                  {userData.userType === 'tourist' ? (
                    <>
                      <Link
                        to="/dashboard"
                        className="text-white hover:bg-primary-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        {t('navbar.dashboard', 'Dashboard')}
                      </Link>
                      <Link
                        to="/qr"
                        className="text-white hover:bg-primary-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        {t('navbar.qr', 'My QR')}
                      </Link>
                      <Link
                        to="/alerts"
                        className="text-white hover:bg-primary-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        {t('navbar.alerts', 'My Alerts')}
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/police-dashboard"
                        className="text-white hover:bg-primary-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        {t('navbar.policeDashboard', 'Police Dashboard')}
                      </Link>
                      <Link
                        to="/active-alerts"
                        className="text-white hover:bg-primary-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        {t('navbar.activeAlerts', 'Active Alerts')}
                      </Link>
                      <Link
                        to="/geo-fences"
                        className="text-white hover:bg-primary-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        {t('navbar.geoFences', 'Geo-Fences')}
                      </Link>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {isAuthenticated ? (
              /* User Menu */
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center text-white hover:bg-primary-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <FiUser className="h-4 w-4 mr-1" />
                  <span className="hidden sm:block">{userData.name}</span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <FiUser className="inline h-4 w-4 mr-2" />
                      {t('navbar.profile', 'Profile')}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FiLogOut className="inline h-4 w-4 mr-2" />
                      {t('navbar.logout', 'Logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Login/Register Links */
              <div className="flex space-x-2">
                <Link
                  to="/login"
                  className="text-white hover:bg-primary-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {t('navbar.login', 'Login')}
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-primary-600 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {t('navbar.register', 'Register')}
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="text-white hover:bg-primary-700 p-2 rounded-md"
              >
                {isOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-primary-700">
              {isAuthenticated ? (
                userData.userType === 'tourist' ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="text-white hover:bg-primary-800 block px-3 py-2 rounded-md text-base font-medium"
                      onClick={() => setIsOpen(false)}
                    >
                      {t('navbar.dashboard', 'Dashboard')}
                    </Link>
                    <Link
                      to="/qr"
                      className="text-white hover:bg-primary-800 block px-3 py-2 rounded-md text-base font-medium"
                      onClick={() => setIsOpen(false)}
                    >
                      {t('navbar.qr', 'My QR')}
                    </Link>
                    <Link
                      to="/alerts"
                      className="text-white hover:bg-primary-800 block px-3 py-2 rounded-md text-base font-medium"
                      onClick={() => setIsOpen(false)}
                    >
                      {t('navbar.alerts', 'My Alerts')}
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/police-dashboard"
                      className="text-white hover:bg-primary-800 block px-3 py-2 rounded-md text-base font-medium"
                      onClick={() => setIsOpen(false)}
                    >
                      {t('navbar.policeDashboard', 'Police Dashboard')}
                    </Link>
                    <Link
                      to="/active-alerts"
                      className="text-white hover:bg-primary-800 block px-3 py-2 rounded-md text-base font-medium"
                      onClick={() => setIsOpen(false)}
                    >
                      {t('navbar.activeAlerts', 'Active Alerts')}
                    </Link>
                    <Link
                      to="/geo-fences"
                      className="text-white hover:bg-primary-800 block px-3 py-2 rounded-md text-base font-medium"
                      onClick={() => setIsOpen(false)}
                    >
                      {t('navbar.geoFences', 'Geo-Fences')}
                    </Link>
                  </>
                )
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-white hover:bg-primary-800 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    {t('navbar.login', 'Login')}
                  </Link>
                  <Link
                    to="/register"
                    className="text-white hover:bg-primary-800 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    {t('navbar.register', 'Register')}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;