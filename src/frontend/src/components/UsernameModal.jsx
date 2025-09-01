import React, { useState } from 'react';
import { authService } from '../services/authService';

const UsernameModal = ({ isOpen, onClose, sessionId, suggestedUsername, onSuccess }) => {
  const [username, setUsername] = useState(suggestedUsername || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [useDefault, setUseDefault] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate username
    if (username.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }

    setLoading(true);

    try {
      // Only update if user chose a different username
      if (username !== suggestedUsername) {
        const response = await authService.updateUsername(sessionId, username);
        console.log('Username update response:', response);
        onSuccess(response);
      } else {
        // Use default username, proceed to next step
        onSuccess({ 
          message: 'Using default username',
          user: { username: suggestedUsername },
          session_id: sessionId 
        });
      }
    } catch (error) {
      console.error('Username update error:', error);
      setError(error.response?.data?.error || error.error || 'Username update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setUsername(suggestedUsername || '');
    setError('');
    setUseDefault(true);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Choose Your Username</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-4">
              Choose a username for your account. You can use our suggestion or create your own.
            </p>
            
            {/* Default Username Option */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={useDefault}
                  onChange={() => {
                    setUseDefault(true);
                    setUsername(suggestedUsername);
                  }}
                  className="mr-2"
                />
                <span className="text-sm">
                  <strong>Use suggested:</strong> <span className="font-mono bg-blue-100 px-2 py-1 rounded">{suggestedUsername}</span>
                </span>
              </label>
            </div>

            {/* Custom Username Option */}
            <div className="mb-4">
              <label className="flex items-center mb-2">
                <input
                  type="radio"
                  checked={!useDefault}
                  onChange={() => setUseDefault(false)}
                  className="mr-2"
                />
                <span className="text-sm"><strong>Create custom username:</strong></span>
              </label>
              
              {!useDefault && (
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your preferred username"
                  minLength="3"
                  pattern="[a-z0-9_]+"
                  title="Username can only contain lowercase letters, numbers, and underscores"
                />
              )}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Continue'}
            </button>
          </div>
        </form>

        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
          <p className="text-sm text-green-700">
            <strong>✅ Auto-Approved:</strong> Your Google account has been automatically approved for GovSol access.
          </p>
        </div>

        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-xs text-yellow-700">
            <strong>Next steps:</strong> After choosing your username, you'll create a password and set up 2FA security.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UsernameModal;
