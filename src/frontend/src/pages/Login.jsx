import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../contexts';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  UserIcon,
  LockClosedIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();
  const { t } = useLanguage();
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      return t('usernameRequired');
    }
    if (!formData.password) {
      return t('passwordRequired');
    }
    if (formData.password.length < 6) {
      return t('passwordMinLength');
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    
    try {
      await login(formData.username, formData.password);
      addToast(t('loginSuccess'), 'success');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || t('loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-md w-full bg-white/90 backdrop-blur-lg glass-effect rounded-2xl shadow-2xl p-8 sm:p-12 mx-4">
        {/* Logo/Header */}
        <div className="text-center mb-8 fade-in-up">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-slate-800 to-slate-900 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <UserIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text-primary">GovSol</h1>
          <h2 className="text-lg font-medium text-slate-600 mt-1">{t('governmentSolutionSystem')}</h2>
          <p className="text-sm text-slate-500 mt-2">{t('signInToAccount')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 fade-in-up">
          {/* Username Field */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-2">
              {t('username')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                name="username"
                id="username"
                autoComplete="username"
                value={formData.username}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 text-slate-900"
                placeholder={t('enterUsername')}
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
              {t('password')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                className="block w-full pl-10 pr-10 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 text-slate-900"
                placeholder={t('enterPassword')}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-600 text-sm font-medium text-center fade-in-up">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-xl shadow-lg text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                {t('loading')}
              </div>
            ) : (
              <>
                {t('signIn')}
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </>
            )}
          </button>

          {/* Forgot Password Link */}
          <div className="text-center">
            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline"
            >
              {t('forgotPassword')}
            </Link>
          </div>
        </form>

        {/* Register Link */}
        <div className="mt-8 text-center text-slate-600 text-sm border-t border-slate-200 pt-6">
          {t('dontHaveAccount')}{' '}
          <Link
            to="/register"
            className="text-blue-600 font-semibold hover:text-blue-800 hover:underline"
          >
            {t('register')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;