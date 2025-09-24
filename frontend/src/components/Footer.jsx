import React from 'react';
import { Link } from 'react-router-dom';
import { FiShield, FiHeart, FiMail, FiPhone, FiMapPin, FiGithub, FiTwitter, FiLinkedin, FiInstagram } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="premium-glass-enhanced mt-auto border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="mb-4 inline-flex items-center space-x-3">
              <div className="w-12 h-12 rounded-3xl premium-glass-enhanced flex items-center justify-center">
                <FiShield size={20} className="premium-text-gold" />
              </div>
              <div className="flex flex-col">
                <div className="text-2xl font-bold premium-text-bold">
                  Trāṇa
                </div>
                <div className="text-sm premium-text-secondary">
                  त्राण • Tourist Safety & Management
                </div>
              </div>
            </Link>
            
            <p className="premium-text mb-6 max-w-md leading-relaxed">
              {t('footer.description', 'Advanced tourist safety platform providing real-time protection, emergency response, and intelligent risk assessment for safer journeys across India.')}
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              <a 
                href="https://github.com/MR-Raj-Hans/Tourist-Safety" 
                target="_blank" 
                rel="noopener noreferrer"
                className="premium-glass-enhanced p-3 rounded-2xl transition-all duration-300 hover:scale-110 premium-text-gold hover:premium-text-gold"
                aria-label="GitHub"
              >
                <FiGithub size={20} />
              </a>
              <a 
                href="#" 
                className="premium-glass-enhanced p-3 rounded-2xl transition-all duration-300 hover:scale-110 text-blue-400 hover:text-blue-300"
                aria-label="Twitter"
              >
                <FiTwitter size={20} />
              </a>
              <a 
                href="#" 
                className="premium-glass-enhanced p-3 rounded-2xl transition-all duration-300 hover:scale-110 text-purple-400 hover:text-purple-300"
                aria-label="LinkedIn"
              >
                <FiLinkedin size={20} />
              </a>
              <a 
                href="#" 
                className="premium-glass-enhanced p-3 rounded-2xl transition-all duration-300 hover:scale-110 text-pink-400 hover:text-pink-300"
                aria-label="Instagram"
              >
                <FiInstagram size={20} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="premium-text-bold text-lg mb-4">
              {t('footer.quickLinks', 'Quick Links')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/dashboard" 
                  className="premium-text-secondary hover:premium-text-gold transition-colors duration-300"
                >
                  {t('footer.dashboard', 'Dashboard')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/emergency" 
                  className="premium-text-secondary hover:premium-text-gold transition-colors duration-300"
                >
                  {t('footer.emergency', 'Emergency Help')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/qr-id" 
                  className="premium-text-secondary hover:premium-text-gold transition-colors duration-300"
                >
                  {t('footer.qrId', 'QR Identification')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/analytics" 
                  className="premium-text-secondary hover:premium-text-gold transition-colors duration-300"
                >
                  {t('footer.analytics', 'Safety Analytics')}
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="premium-text-bold text-lg mb-4">
              {t('footer.contact', 'Contact')}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 premium-text-secondary">
                <FiMail size={16} className="text-emerald-400" />
                <span>support@trana.gov.in</span>
              </li>
              <li className="flex items-center space-x-3 premium-text-secondary">
                <FiPhone size={16} className="text-blue-400" />
                <span>+91 112 (Emergency)</span>
              </li>
              <li className="flex items-center space-x-3 premium-text-secondary">
                <FiMapPin size={16} className="premium-text-gold" />
                <span>New Delhi, India</span>
              </li>
            </ul>
            
            {/* Emergency Badge */}
            <div className="mt-6 premium-glass-enhanced p-3 rounded-2xl border border-red-400/30">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <span className="text-red-400 text-sm font-medium">
                  {t('footer.emergency24', '24/7 Emergency Support')}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Divider */}
        <div className="border-t border-white/20 mb-6"></div>
        
        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          
          {/* Made with Love */}
          <div className="flex items-center space-x-2 premium-text-secondary">
            <span>{t('footer.madeWith', 'Made with')}</span>
            <FiHeart size={16} className="text-red-400 animate-pulse" />
            <span>{t('footer.by', 'by')}</span>
            <span className="font-semibold premium-text-gold">HOPE Team</span>
            <span>•</span>
            <span className="text-emerald-400 font-medium">
              {t('footer.sih', 'Smart India Hackathon 2025')}
            </span>
          </div>
          
          {/* Copyright */}
          <div className="flex items-center space-x-4 premium-text-secondary">
            <span className="text-sm">
              © {currentYear} Trāṇa (त्राण) • {t('footer.rights', 'Tourist Safety & Management System')}
            </span>
          </div>
        </div>
        
        {/* Hackathon Badge */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center space-x-3 premium-glass-enhanced px-6 py-3 rounded-3xl border border-yellow-400/30">
            <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
            <span className="premium-text-gold font-semibold">
              🏆 Smart India Hackathon 2025 Project
            </span>
            <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
      
      {/* Animated Background Gradient */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-50"></div>
    </footer>
  );
};

export default Footer;