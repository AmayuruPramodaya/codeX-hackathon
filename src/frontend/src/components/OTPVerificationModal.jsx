import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import OTPInput from './OTPInput';
import authService from '../services/authService';

const OTPVerificationModal = ({ 
  isOpen, 
  onClose, 
  sessionId, 
  onSuccess
}) => {
  const [step, setStep] = useState('select'); // 'select', 'setup', 'verify'
  const [selectedOtpType, setSelectedOtpType] = useState('');
  const [otpId, setOtpId] = useState(null);
  const [qrCode, setQrCode] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false); // Prevent multiple verification attempts

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const otpTypes = [
    {
      type: 'email',
      title: 'Email OTP',
      description: 'Receive a 6-digit code via email',
      icon: '📧'
    },
    {
      type: 'google_auth',
      title: 'Google Authenticator',
      description: 'Use Google Authenticator app for TOTP',
      icon: '🔐'
    }
  ];

  const handleOtpTypeSelect = async (otpType) => {
    setIsLoading(true);
    setError('');
    setSelectedOtpType(otpType);
    
    try {
      const response = await authService.setupOTP(sessionId, otpType);
      setOtpId(response.otp_id);
      
      if (otpType === 'google_auth') {
        setQrCode(response.qr_code);
        setSecretKey(response.secret_key);
      }
      
      setStep('verify');
    } catch (err) {
      setError(err.error || 'Failed to setup OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpComplete = async (code) => {
    if (isVerifying) return; // Prevent multiple calls
    await verifyOtp(code);
  };

  const verifyOtp = async (code) => {
    if (isVerifying) return; // Prevent multiple calls
    
    setIsVerifying(true);
    setIsLoading(true);
    setError('');
    
    try {
      console.log('Verifying OTP:', { sessionId, otpId, code }); // Debug log
      const response = await authService.verifyOTP(sessionId, otpId, code);
      console.log('OTP verification success:', response); // Debug log
      onSuccess(response);
      onClose();
    } catch (err) {
      console.error('OTP verification error:', err); // Debug log
      setError(err.error || 'Invalid OTP code');
    } finally {
      setIsLoading(false);
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      await authService.resendOTP(otpId);
      setResendCooldown(30);
    } catch (err) {
      setError(err.error || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const resetModal = () => {
    setStep('select');
    setSelectedOtpType('');
    setOtpId(null);
    setQrCode('');
    setSecretKey('');
    setError('');
    setResendCooldown(0);
    setIsVerifying(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Two-Factor Authentication
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {step === 'select' && (
            <div>
              <p className="text-gray-600 mb-6">
                Choose your preferred method for two-factor authentication:
              </p>
              
              <div className="space-y-3">
                {otpTypes.map((type) => (
                  <button
                    key={type.type}
                    onClick={() => handleOtpTypeSelect(type.type)}
                    disabled={isLoading}
                    className="w-full p-4 border border-gray-300 rounded-lg text-left hover:border-blue-500 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{type.icon}</span>
                      <div>
                        <div className="font-medium text-gray-900">{type.title}</div>
                        <div className="text-sm text-gray-600">{type.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'verify' && (
            <div>
              {selectedOtpType === 'email' && (
                <div className="text-center">
                  <div className="text-4xl mb-4">📧</div>
                  <h3 className="text-lg font-medium mb-2">Check your email</h3>
                  <p className="text-gray-600 mb-6">
                    We've sent a 6-digit code to your email address.
                  </p>
                </div>
              )}

              {selectedOtpType === 'google_auth' && (
                <div className="text-center">
                  <div className="text-4xl mb-4">🔐</div>
                  <h3 className="text-lg font-medium mb-2">Scan QR Code</h3>
                  <p className="text-gray-600 mb-4">
                    Scan this QR code with Google Authenticator app:
                  </p>
                  
                  {qrCode && (
                    <div className="mb-4 flex justify-center">
                      <img src={qrCode} alt="QR Code" className="border rounded" />
                    </div>
                  )}
                  
                  <div className="mb-4 p-3 bg-gray-100 rounded text-sm">
                    <p className="font-medium mb-1">Manual entry key:</p>
                    <code className="break-all">{secretKey}</code>
                  </div>
                  
                  <p className="text-gray-600 mb-6 text-sm">
                    After adding the account, enter the 6-digit code from the app:
                  </p>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter verification code:
                </label>
                <OTPInput
                  length={6}
                  onComplete={handleOtpComplete}
                  disabled={isLoading}
                  autoFocus={true}
                />
              </div>

              {selectedOtpType !== 'google_auth' && (
                <div className="text-center">
                  <button
                    onClick={handleResendOtp}
                    disabled={isLoading || resendCooldown > 0}
                    className="text-blue-600 hover:text-blue-800 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resendCooldown > 0 
                      ? `Resend code in ${resendCooldown}s` 
                      : 'Resend code'
                    }
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-center justify-center mt-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-600">Processing...</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t rounded-b-lg">
          <div className="flex justify-between">
            {step === 'verify' && (
              <button
                onClick={() => setStep('select')}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Back
              </button>
            )}
            
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationModal;
