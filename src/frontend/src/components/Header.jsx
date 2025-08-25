import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  BellIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { user, logout } = useAuth();
  const { addToast } = useToast();
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
    { name: 'Home', href: '/' },
    { name: 'Public Issues', href: '/public-issues' },
    { name: 'Submit Issue', href: '/submit-issue' },
  ];

  const userNavigation = user ? [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'My Issues', href: '/my-issues' },
    ...(user.user_type && ['grama_niladhari', 'divisional_secretary', 'district_secretary', 'provincial_ministry', 'national_ministry', 'prime_minister', 'admin'].includes(user.user_type) 
      ? [{ name: 'Escalated Issues', href: '/escalated-issues' }] 
      : []
    ),
    { name: 'Profile', href: '/profile' },
  ] : [];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="bg-blue-600 rounded-lg p-2">
                <span className="text-white font-bold text-xl">GS</span>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">GovSol</h1>
                <p className="text-xs text-gray-500">Government Solutions</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {/* Notifications */}
                <button className="relative p-2 text-gray-500 hover:text-gray-700">
                  <BellIcon className="h-6 w-6" />
                  <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                </button>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserCircleIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <span>{user.first_name || user.username}</span>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {user.user_type?.replace('_', ' ').toUpperCase()}
                        </p>
                      </div>
                      
                      {userNavigation.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          {item.name}
                        </Link>
                      ))}

                      <Link
                        to="/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Cog6ToothIcon className="h-4 w-4 mr-2" />
                        Settings
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-gray-900 p-2"
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
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600"
                >
                  {item.name}
                </Link>
              ))}

              {user ? (
                <>
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="px-3 py-2">
                      <p className="text-base font-medium text-gray-900">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {user.user_type?.replace('_', ' ').toUpperCase()}
                      </p>
                    </div>
                    
                    {userNavigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600"
                      >
                        {item.name}
                      </Link>
                    ))}

                    <Link
                      to="/settings"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600"
                    >
                      Settings
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600"
                    >
                      Sign out
                    </button>
                  </div>
                </>
              ) : (
                <div className="border-t border-gray-200 pt-4 mt-4 space-y-1">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-base font-medium bg-blue-600 text-white rounded-lg mx-3"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {userMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setUserMenuOpen(false)}
        ></div>
      )}
    </header>
  );
};

export default Header;
