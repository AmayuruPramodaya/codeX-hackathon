import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export const authService = {
  // Google authentication
  async googleAuth(credential) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/google/`, {
        credential: credential
      });
      return response.data;
    } catch (error) {
      console.error('API Error:', error.response?.data); // Debug log
      console.log('Full error object:', error); // Debug log
      throw error.response?.data || { error: 'Authentication failed' };
    }
  },

  // Setup OTP
  async setupOTP(sessionId, otpType) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/setup-otp/`, {
        session_id: sessionId,
        otp_type: otpType
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'OTP setup failed' };
    }
  },

  // Verify OTP
  async verifyOTP(sessionId, otpId, otpCode) {
    try {
      const payload = {
        session_id: sessionId,
        otp_id: otpId,
        otp_code: otpCode
      };
      console.log('Sending OTP verification request:', payload); // Debug log
      
      const response = await axios.post(`${API_BASE_URL}/auth/verify-otp/`, payload);
      console.log('OTP verification response:', response.data); // Debug log
      return response.data;
    } catch (error) {
      console.error('OTP verification API error:', error.response?.data || error); // Debug log
      throw error.response?.data || { error: 'OTP verification failed' };
    }
  },

  // Resend OTP
  async resendOTP(otpId) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/resend-otp/`, {
        otp_id: otpId
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to resend OTP' };
    }
  },

  // Setup password for Google OAuth users
  async setupPassword(sessionId, password) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/setup-password/`, {
        session_id: sessionId,
        password: password
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Password setup failed' };
    }
  },

  // Verify password for existing users
  async verifyPassword(sessionId, password) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/verify-password/`, {
        session_id: sessionId,
        password: password
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Password verification failed' };
    }
  },

  // Update username for Google OAuth users
  async updateUsername(sessionId, username) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/update-username/`, {
        session_id: sessionId,
        username: username
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Username update failed' };
    }
  },

  // Test endpoint for existing user error (debugging)
  async testExistingUserError(email = 'test@example.com') {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/test-existing-user/`, {
        email: email
      });
      return response.data;
    } catch (error) {
      console.error('Test API Error:', error.response?.data); // Debug log
      throw error.response?.data || { error: 'Test failed' };
    }
  },

  // Check if email exists and get username
  async checkEmailExists(email) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/check-email/`, {
        email: email
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Email check failed' };
    }
  }
};

export default authService;
