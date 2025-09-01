# GovSol Authentication System - User Guide

## Overview
The GovSol system now supports two authentication methods:
1. **Traditional Login** - For existing users with username/password
2. **Google Sign-Up** - For new users who want to create accounts using Google

## Current Application Status

### Servers Running
- **Backend**: http://127.0.0.1:8000/
- **Frontend**: http://localhost:3001/

## Authentication Methods

### 1. Traditional Login (Existing Users)

**For users who already have accounts:**

1. Navigate to http://localhost:3001/
2. In the "Existing Users" section:
   - Enter your **username** (not email)
   - Enter your **password**
   - Click "Sign In"
3. You'll be redirected to the dashboard upon successful login

**Features:**
- ✅ Username/password authentication
- ✅ JWT token generation
- ✅ Session management
- ✅ Dashboard redirect

### 2. Google Sign-Up (New Users)

**For new users creating accounts:**

1. Navigate to http://localhost:3001/
2. In the "New to GovSol?" section:
   - Click "Sign in with Google" button
   - Complete Google OAuth verification
3. **Security Steps** (Required for all Google users):
   - **Step 1**: Set up a password (security requirement)
   - **Step 2**: Choose 2FA method (Email, SMS, or Google Authenticator)
   - **Step 3**: Verify OTP code
4. You'll be redirected to the dashboard upon completion

**Features:**
- ✅ Google OAuth integration
- ✅ Automatic account creation
- ✅ Mandatory password setup (security enhancement)
- ✅ Multi-factor authentication (Email/SMS/Google Auth)
- ✅ JWT token generation

## Security Features

### Enhanced Password Security
- **All users must have passwords** - even Google users
- **New Google users**: Must set up password after Google auth
- **Existing users**: Must verify password before linking Google account
- **Password requirements**: Minimum 6 characters

### Multi-Factor Authentication (2FA)
1. **Email OTP**: Receive code via email
2. **SMS OTP**: Receive code via SMS (requires Twilio configuration)
3. **Google Authenticator**: Scan QR code and use authenticator app

### Account Linking Security
- Existing users with same email must verify password before Google account linking
- Prevents unauthorized account takeover through Google OAuth

## User Interface Features

### Clear Separation of Flows
- **Top Section**: Traditional login for existing users
- **Bottom Section**: Google sign-up for new users with clear messaging
- **Visual Indicators**: Different sections with borders and backgrounds

### User-Friendly Messages
- **Password Setup**: Explains why passwords are required for Google users
- **Account Linking**: Guides existing users through Google account linking
- **Security Information**: Educational content about 2FA benefits

## Testing Scenarios

### Scenario 1: New Google User
1. Click "Sign in with Google"
2. Complete Google authentication
3. Set up password (required)
4. Choose 2FA method
5. Verify OTP
6. ✅ Successfully logged in

### Scenario 2: Existing User Traditional Login
1. Enter username and password
2. Click "Sign In"
3. ✅ Successfully logged in

### Scenario 3: Existing User + Google Linking
1. User with email test@example.com exists
2. Tries "Sign in with Google" with same email
3. System requires password verification
4. Enter existing password
5. Google account gets linked
6. Complete 2FA verification
7. ✅ Successfully logged in with linked account

## Environment Configuration Required

### Backend (.env)
```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Twilio (for SMS OTP)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone

# Email (for Email OTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password
```

### Frontend (.env)
```bash
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_API_URL=http://localhost:8000/api
```

### Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select your project
3. Enable Google Identity Services API
4. Create OAuth 2.0 credentials
5. Add authorized origins:
   - `http://localhost:3001` (for development)
   - Your production domain (for production)

## API Endpoints

### Traditional Authentication
- `POST /api/auth/login/` - Username/password login
- `POST /api/auth/register/` - User registration
- `GET /api/auth/profile/` - Get user profile

### Google OAuth + Enhanced Security
- `POST /api/auth/google/` - Google OAuth verification
- `POST /api/auth/setup-password/` - Password setup for Google users
- `POST /api/auth/verify-password/` - Password verification for account linking
- `POST /api/auth/setup-otp/` - OTP method setup
- `POST /api/auth/verify-otp/` - OTP verification
- `POST /api/auth/resend-otp/` - Resend OTP code

## Success Indicators

### Traditional Login ✅
- Username/password form works
- JWT tokens generated
- Dashboard redirect successful
- User session maintained

### Google Sign-Up ✅
- Google OAuth working
- Password setup modal appears
- OTP verification modal appears
- All 2FA methods functional
- JWT tokens generated
- Dashboard redirect successful

### Security Features ✅
- Password required for all Google users
- Account linking requires password verification
- Multi-factor authentication working
- Session management working

## Next Steps for Production

1. **Environment Variables**: Set up production environment variables
2. **Google Cloud Console**: Add production domains to authorized origins
3. **SSL Certificates**: Ensure HTTPS for production
4. **Database**: Configure production database
5. **Email/SMS**: Configure production email and SMS services

## Troubleshooting

### Common Issues
1. **Google OAuth Error**: Check VITE_GOOGLE_CLIENT_ID in frontend .env
2. **CORS Issues**: Ensure backend allows frontend origin
3. **Token Issues**: Check JWT configuration in Django settings
4. **OTP Issues**: Verify email/SMS service configurations

### Debug Information
- Check browser console for frontend errors
- Check Django server logs for backend errors
- Verify environment variables are loaded correctly

The application is now ready for testing with both authentication methods fully functional!
