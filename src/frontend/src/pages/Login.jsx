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
import GoogleSignInButton from '../components/GoogleSignInButton';
import OTPVerificationModal from '../components/OTPVerificationModal';
import PasswordModal from '../components/PasswordModal';
import UsernameModal from '../components/UsernameModal';
import { authService } from '../services/authService';

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
  const [isUsernamePrefilled, setIsUsernamePrefilled] = useState(false);
  
  // Google Auth + OTP states
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [googleSessionId, setGoogleSessionId] = useState(null);
  const [_googleUser, setGoogleUser] = useState(null); // Using _ prefix to indicate intentionally unused
  
  // Username modal states
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [suggestedUsername, setSuggestedUsername] = useState('');
  
  // Password modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingGoogleAuth, setPendingGoogleAuth] = useState(null);

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

  const handleGoogleSignIn = async (credential) => {
    setLoading(true);
    setError('');
    
    try {
      // First, extract email from Google credential to check if user exists
      const payload = JSON.parse(atob(credential.split('.')[1])); // Decode JWT payload
      const email = payload.email;
      
      console.log('Google sign-in email:', email);
      
      // Check if email already exists in our system
      try {
        const emailCheckResponse = await authService.checkEmailExists(email);
        
        if (emailCheckResponse.exists) {
          // User already exists - pre-fill username and show helpful message
          setFormData(prev => ({
            ...prev,
            username: emailCheckResponse.username
          }));
          
          // Mark username as pre-filled
          setIsUsernamePrefilled(true);
          
          // Show helpful message
          setError(`✅ Account found! We've filled in your username "${emailCheckResponse.username}". Please enter your password below to sign in.`);
          
          // Add a toast message
          addToast(`Welcome back! Please use traditional login with username: ${emailCheckResponse.username}`, 'info');
          
          // Focus on password field
          setTimeout(() => {
            const passwordField = document.querySelector('input[name="password"]');
            if (passwordField) {
              passwordField.focus();
            }
          }, 100);
          
          setLoading(false);
          return; // Don't proceed with Google OAuth flow
        }
      } catch (emailCheckError) {
        console.log('Email check failed, proceeding with Google OAuth:', emailCheckError);
        // Continue with normal Google OAuth flow if email check fails
      }
      
      // If email doesn't exist, proceed with normal Google OAuth
      const response = await authService.googleAuth(credential);
      
      // Handle password requirements for Google sign-up
      if (response.requires_password && response.allow_username_change) {
        // New Google user - first choose username
        setPendingGoogleAuth(response);
        setGoogleSessionId(response.session_id);
        setGoogleUser(response.user);
        setSuggestedUsername(response.suggested_username);
        setShowUsernameModal(true);
        return;
      }
      
      if (response.requires_password) {
        // New Google user needs to set up a password (username already set)
        setPendingGoogleAuth(response);
        setGoogleSessionId(response.session_id);
        setGoogleUser(response.user);
        setShowPasswordModal(true);
        return;
      }
      
      if (response.otp_required) {
        // Password already set, proceed to OTP
        setGoogleSessionId(response.session_id);
        setGoogleUser(response.user);
        setShowOTPModal(true);
      } else {
        // Direct login (if OTP is not required)
        addToast('Login successful!', 'success');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Google auth error:', error);
      console.log('Error object:', JSON.stringify(error, null, 2)); // Debug log
      
      // Handle specific error for existing email
      if (error.existing_email && error.existing_username) {
        console.log('Handling existing user case with username:', error.existing_username); // Debug log
        // Pre-fill the username field with existing username
        setFormData(prev => ({
          ...prev,
          username: error.existing_username
        }));
        
        // Mark username as pre-filled
        setIsUsernamePrefilled(true);
        
        // Show a helpful message
        setError(`✅ Account found! We've filled in your username "${error.existing_username}". Please enter your password below.`);
        
        // Add a toast message
        addToast(`Welcome back! Please enter your password for "${error.existing_username}"`, 'info');
      } else if (error.existing_email) {
        console.log('Handling existing email case'); // Debug log
        setError(error.error || 'This email is already registered. Please use traditional login below.');
      } else {
        setError(error.error || 'Google authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignInError = (error) => {
    console.error('Google Sign-In error:', error);
    setError(error.error || 'Google Sign-In failed');
  };

  const handleOTPSuccess = (authResponse) => {
    // Store tokens and user data compatible with AuthContext
    if (authResponse.access_token) {
      localStorage.setItem('token', authResponse.access_token); // For AuthContext compatibility
      localStorage.setItem('access_token', authResponse.access_token);
      localStorage.setItem('refresh_token', authResponse.refresh_token);
      localStorage.setItem('user', JSON.stringify(authResponse.user));
      
      // Update AuthContext state
      // You might need to trigger a context update here
    }
    
    addToast('Login successful with 2FA!', 'success');
    navigate('/dashboard');
  };

  const handleOTPModalClose = () => {
    setShowOTPModal(false);
    setGoogleSessionId(null);
    setGoogleUser(null);
    setLoading(false);
  };

  const handlePasswordSuccess = (response) => {
    setShowPasswordModal(false);
    
    if (response.otp_required) {
      // Password verified/set, now proceed to OTP
      setGoogleSessionId(response.session_id);
      setGoogleUser(response.user || pendingGoogleAuth?.user);
      setShowOTPModal(true);
    } else {
      // Direct login
      addToast('Login successful!', 'success');
      navigate('/dashboard');
    }
  };

  const handlePasswordModalClose = () => {
    setShowPasswordModal(false);
    setPendingGoogleAuth(null);
    setGoogleSessionId(null);
    setLoading(false);
  };

  const handleUsernameSuccess = (response) => {
    setShowUsernameModal(false);
    
    // Update user info and proceed to password setup
    if (response.user) {
      setGoogleUser(response.user);
    }
    
    // Now show password modal
    setShowPasswordModal(true);
  };

  const handleUsernameModalClose = () => {
    setShowUsernameModal(false);
    setSuggestedUsername('');
    setPendingGoogleAuth(null);
    setGoogleSessionId(null);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#001F54] via-blue-900 to-[#001F54]">
      <div className="max-w-md w-full bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 sm:p-12 mx-4">
        {/* Logo/Header */}
        <div className="text-center mb-8 fade-in-up">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <UserIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#001F54]">Civic<span className="text-orange-500">Resolve</span></h1>
          <h2 className="text-lg font-medium text-gray-600 mt-1">{t('governmentSolutionSystem')}</h2>
          <p className="text-sm text-gray-500 mt-2">{t('signInToAccount')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 fade-in-up">
          {/* Existing Users Header */}
          <div className="text-center border-b border-slate-200 pb-4 mb-6">
            <h3 className="text-lg font-semibold text-slate-700">Existing Users</h3>
            <p className="text-sm text-slate-500 mt-1">Sign in with your username and password</p>
          </div>

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
                onChange={(e) => {
                  handleChange(e);
                  if (isUsernamePrefilled) {
                    setIsUsernamePrefilled(false); // Clear pre-filled status when user edits
                  }
                }}
                className={`block w-full pl-10 ${isUsernamePrefilled ? 'pr-12' : 'pr-3'} py-3 border ${isUsernamePrefilled 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-slate-300'
                } rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 text-slate-900`}
                placeholder={t('enterUsername')}
                required
              />
              {isUsernamePrefilled && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
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
            className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-xl shadow-lg text-lg font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
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

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500">New to GovSol?</span>
            </div>
          </div>

          {/* Google Sign-Up Section */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <p className="text-sm text-slate-600 text-center mb-3">
              <strong>Sign in with Google:</strong> We'll check if you're a new or existing user
            </p>
            <GoogleSignInButton
              onSuccess={handleGoogleSignIn}
              onError={handleGoogleSignInError}
              className="w-full"
            />
            
            {/* Test Button for Debugging */}

            
            <p className="text-xs text-slate-500 text-center mt-2">
              <strong>Existing users:</strong> We'll fill your username automatically
            </p>
            <p className="text-xs text-blue-600 text-center mt-1">
              <strong>New users:</strong> You'll create a password after Google verification
            </p>
          </div>

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

      {/* OTP Verification Modal */}
      <OTPVerificationModal
        isOpen={showOTPModal}
        onClose={handleOTPModalClose}
        sessionId={googleSessionId}
        onSuccess={handleOTPSuccess}
      />

      {/* Username Selection Modal */}
      <UsernameModal
        isOpen={showUsernameModal}
        onClose={handleUsernameModalClose}
        sessionId={googleSessionId}
        suggestedUsername={suggestedUsername}
        onSuccess={handleUsernameSuccess}
      />

      {/* Password Modal */}
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={handlePasswordModalClose}
        sessionId={googleSessionId}
        onSuccess={handlePasswordSuccess}
      />
    </div>
  );
};

export default Login;