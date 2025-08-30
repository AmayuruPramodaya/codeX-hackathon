import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  BellIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  GlobeAltIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);

  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const { currentLanguage, changeLanguage, t, languages } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      addToast('Logged out successfully', 'success');
      navigate('/');
      setUserMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
      addToast('Error logging out', 'error');
    }
  };

  const navigation = [
    { name: t('home'), href: '/' },
    { name: t('publicIssues'), href: '/public-issues' },
    { name: t('submitIssue'), href: '/submit-issue' },
  ];

  const userNavigation = user ? [
    { name: t('dashboard'), href: '/dashboard' },
    { name: t('myIssues'), href: '/my-issues' },
    ...(user.user_type && ['grama_niladhari', 'divisional_secretary', 'district_secretary', 'provincial_ministry', 'national_ministry', 'prime_minister', 'admin'].includes(user.user_type) 
      ? [{ name: t('escalatedIssues'), href: '/escalated-issues' }] 
      : []
    ),
    { name: t('profile'), href: '/profile' },
  ] : [];

  return (
    <header className="bg-white shadow-lg border-b border-slate-200 backdrop-blur-sm z-999">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center group">
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-3 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <span className="text-white font-bold text-xl">GS</span>
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold gradient-text-primary">GovSol</h1>
                <p className="text-sm text-slate-500 font-medium">Government Solutions</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-slate-700 hover:text-slate-900 px-4 py-2 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-all duration-300"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                className="flex items-center space-x-2 text-sm text-slate-700 hover:text-slate-900 px-4 py-2 rounded-xl hover:bg-slate-50 transition-all duration-300 border border-slate-200"
              >
                <GlobeAltIcon className="h-4 w-4" />
                <span>{languages.find(lang => lang.code === currentLanguage)?.flag}</span>
                <span className="hidden sm:block font-medium">{languages.find(lang => lang.code === currentLanguage)?.name}</span>
                <ChevronDownIcon className="h-3 w-3" />
              </button>

              {languageMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => {
                        changeLanguage(language.code);
                        setLanguageMenuOpen(false);
                      }}
                      className={`flex items-center w-full px-4 py-3 text-sm hover:bg-slate-50 transition-colors duration-200 ${
                        currentLanguage === language.code ? 'bg-slate-50 text-slate-900 font-semibold' : 'text-slate-700'
                      }`}
                    >
                      <span className="mr-3">{language.flag}</span>
                      <span>{language.name}</span>
                      {currentLanguage === language.code && (
                        <span className="ml-auto text-slate-600">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {user ? (
              <>
                {/* Notifications */}
                {/* <button className="relative p-3 text-slate-500 hover:text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-300 border border-slate-200">
                  <BellIcon className="h-5 w-5" />
                  <span className="absolute top-1 right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></span>
                </button> */}

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-3 text-sm text-slate-700 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-50 transition-all duration-300"
                  >
                    <div className="w-9 h-9 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full flex items-center justify-center border border-slate-300">
                      <UserCircleIcon className="w-5 h-5 text-slate-600" />
                    </div>
                    <span className="font-semibold">{user.first_name || user.username}</span>
                    <ChevronDownIcon className="h-3 w-3" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-slate-200">
                        <p className="text-sm font-semibold text-slate-900">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-xs text-slate-500 font-medium">
                          {user.user_type?.replace('_', ' ').toUpperCase()}
                        </p>
                      </div>
                      
                      {userNavigation.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 font-medium transition-colors duration-200"
                        >
                          {item.name}
                        </Link>
                      ))}

                      <Link
                        to="/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 font-medium transition-colors duration-200"
                      >
                        <Cog6ToothIcon className="h-4 w-4 mr-3" />
                        {t('settings')}
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 font-medium transition-colors duration-200"
                      >
                        <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                        {t('signOut')}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-slate-700 hover:text-slate-900 px-4 py-2 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-all duration-300"
                >
                  {t('signIn')}
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-slate-800 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {t('register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-700 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-50 transition-all duration-300"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-6 bg-slate-50/50 backdrop-blur-sm">
            <div className="space-y-2">
              {/* Language Switcher Mobile */}
              <div className="px-4 py-3">
                <p className="text-sm font-semibold text-slate-700 mb-3">{t('language')}</p>
                <div className="grid grid-cols-3 gap-2">
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => {
                        changeLanguage(language.code);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center justify-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                        currentLanguage === language.code 
                          ? 'bg-slate-800 text-white shadow-lg' 
                          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <span className="mr-1">{language.flag}</span>
                      <span className="text-xs">{language.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-base font-semibold text-slate-700 hover:text-slate-900 hover:bg-white rounded-xl mx-2 transition-all duration-300"
                >
                  {item.name}
                </Link>
              ))}

              {user ? (
                <>
                  <div className="border-t border-slate-200 pt-6 mt-6">
                    <div className="px-4 py-3 bg-white rounded-xl mx-2 mb-3">
                      <p className="text-base font-bold text-slate-900">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-sm text-slate-500 font-medium">
                        {user.user_type?.replace('_', ' ').toUpperCase()}
                      </p>
                    </div>
                    
                    {userNavigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-4 py-3 text-base font-semibold text-slate-700 hover:text-slate-900 hover:bg-white rounded-xl mx-2 transition-all duration-300"
                      >
                        {item.name}
                      </Link>
                    ))}

                    <Link
                      to="/settings"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 text-base font-semibold text-slate-700 hover:text-slate-900 hover:bg-white rounded-xl mx-2 transition-all duration-300"
                    >
                      {t('settings')}
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-3 text-base font-semibold text-slate-700 hover:text-slate-900 hover:bg-white rounded-xl mx-2 transition-all duration-300"
                    >
                      {t('signOut')}
                    </button>
                  </div>
                </>
              ) : (
                <div className="border-t border-slate-200 pt-6 mt-6 space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-base font-semibold text-slate-700 hover:text-slate-900 hover:bg-white rounded-xl mx-2 transition-all duration-300"
                  >
                    {t('signIn')}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-base font-semibold bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl mx-2 shadow-lg"
                  >
                    {t('register')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close dropdowns */}
      {(userMenuOpen || languageMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setUserMenuOpen(false);
            setLanguageMenuOpen(false);
          }}
        ></div>
      )}
    </header>
  );
};

export default Header;
