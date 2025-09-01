import React, { useEffect, useState } from 'react';

const GoogleSignInButton = ({ onSuccess, onError, disabled = false, text = "signin_with" }) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load Google Identity Services script
    const loadGoogleScript = () => {
      if (window.google?.accounts?.id) {
        initializeGoogleSignIn();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = initializeGoogleSignIn;
      script.onerror = () => {
        console.error('Failed to load Google Identity Services');
        onError?.({ error: 'Failed to load Google Sign-In' });
      };
      document.head.appendChild(script);
    };

    const initializeGoogleSignIn = () => {
      try {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your_google_client_id_here',
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true
        });

        // Render the button
        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-button'),
          {
            theme: 'outline',
            size: 'large',
            text: text || 'signin_with',
            shape: 'rectangular'
          }
        );
      } catch (error) {
        console.error('Error initializing Google Sign-In:', error);
        onError?.({ error: 'Failed to initialize Google Sign-In' });
      }
    };

    const handleCredentialResponse = (response) => {
      setIsLoading(true);
      onSuccess?.(response.credential);
    };

    if (!disabled) {
      loadGoogleScript();
    }

    return () => {
      // Cleanup - remove any existing Google Sign-In buttons
      const existingButton = document.getElementById('google-signin-button');
      if (existingButton) {
        existingButton.innerHTML = '';
      }
    };
  }, [onSuccess, onError, disabled, text]);

  // Reset loading state when disabled changes
  useEffect(() => {
    if (disabled) {
      setIsLoading(false);
    }
  }, [disabled]);

  const handleFallbackSignIn = () => {
    if (window.google?.accounts?.id) {
      setIsLoading(true);
      window.google.accounts.id.prompt((notification) => {
        setIsLoading(false);
        if (notification.isNotDisplayed()) {
          onError?.({ error: 'Google Sign-In popup blocked or not available' });
        }
      });
    }
  };

  return (
    <div className="w-full">
      {/* Google Sign-In Button */}
      <div
        id="google-signin-button"
        className={`w-full ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
        style={{ minHeight: '48px' }}
      />
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-center justify-center mt-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Authenticating...</span>
        </div>
      )}
      
      {/* Fallback button for when Google Script doesn't load */}
      <div className="mt-2">
        <button
          type="button"
          onClick={handleFallbackSignIn}
          disabled={disabled || isLoading}
          className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {isLoading ? 'Signing in...' : 'Continue with Google'}
        </button>
      </div>
    </div>
  );
};

export default GoogleSignInButton;
