import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { register } from '../services/api';

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('create_account')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('or')}{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              {t('sign_in_existing')}
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            {/* Name */}
            <div>
              <label htmlFor="name" className="sr-only">
                {t('full_name')}
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder={t('full_name')}
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            
            {/* Email */}
            <div>
              <label htmlFor="email" className="sr-only">
                {t('email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder={t('email')}
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            {/* Phone */}
            <div>
              <label htmlFor="phone" className="sr-only">
                {t('phone')}
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder={t('phone')}
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            
            {/* Passport */}
            <div>
              <label htmlFor="passport" className="sr-only">
                {t('passport_number')}
              </label>
              <input
                id="passport"
                name="passport"
                type="text"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder={t('passport_number')}
                value={formData.passport}
                onChange={handleChange}
              />
            </div>
            
            {/* Nationality */}
            <div>
              <label htmlFor="nationality" className="sr-only">
                {t('nationality')}
              </label>
              <input
                id="nationality"
                name="nationality"
                type="text"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder={t('nationality')}
                value={formData.nationality}
                onChange={handleChange}
              />
            </div>
            
            {/* Emergency Contact */}
            <div>
              <label htmlFor="emergencyContact" className="sr-only">
                {t('emergency_contact')}
              </label>
              <input
                id="emergencyContact"
                name="emergencyContact"
                type="tel"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder={t('emergency_contact')}
                value={formData.emergencyContact}
                onChange={handleChange}
              />
            </div>
            
            {/* Password */}
            <div>
              <label htmlFor="password" className="sr-only">
                {t('password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder={t('password')}
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            
            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                {t('confirm_password')}
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder={t('confirm_password')}
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* User Type Selection */}
          <div>
            <label className="text-base font-medium text-gray-900">
              {t('account_type')}
            </label>
            <p className="text-sm leading-5 text-gray-500">
              {t('select_account_type')}
            </p>
            <fieldset className="mt-4">
              <legend className="sr-only">{t('account_type')}</legend>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    id="tourist"
                    name="userType"
                    type="radio"
                    value="tourist"
                    checked={formData.userType === 'tourist'}
                    onChange={handleChange}
                    className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"
                  />
                  <label htmlFor="tourist" className="ml-3 block text-sm font-medium text-gray-700">
                    {t('tourist')}
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="police"
                    name="userType"
                    type="radio"
                    value="police"
                    checked={formData.userType === 'police'}
                    onChange={handleChange}
                    className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"
                  />
                  <label htmlFor="police" className="ml-3 block text-sm font-medium text-gray-700">
                    {t('police_officer')}
                  </label>
                </div>
              </div>
            </fieldset>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="spinner w-4 h-4 mr-2"></div>
                  {t('creating_account')}
                </div>
              ) : (
                t('create_account')
              )}
            </button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            {t('by_signing_up')}{' '}
            <a href="#" className="text-primary-600 hover:text-primary-500">
              {t('terms_of_service')}
            </a>{' '}
            {t('and')}{' '}
            <a href="#" className="text-primary-600 hover:text-primary-500">
              {t('privacy_policy')}
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;