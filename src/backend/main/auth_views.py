from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth import authenticate
from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone
from google.oauth2 import id_token
from google.auth.transport import requests
import qrcode
import io
import base64
from twilio.rest import Client
import random
import string

from .models import User, GoogleAuthUser, OTPVerification, LoginAttempt
from .serializers import UserSerializer
from rest_framework_simplejwt.tokens import RefreshToken


def get_client_ip(request):
    """Get client IP address from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth(request):
    """
    Handle Google OAuth authentication
    Expected payload: {'credential': 'google_id_token'}
    """
    try:
        token = request.data.get('credential')
        if not token:
            return Response(
                {'error': 'Google ID token is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verify Google ID token
        idinfo = id_token.verify_oauth2_token(
            token, 
            requests.Request(), 
            settings.GOOGLE_OAUTH2_CLIENT_ID
        )

        google_id = idinfo['sub']
        email = idinfo['email']
        name = idinfo.get('name', '')
        picture = idinfo.get('picture', '')

        # Log login attempt
        login_attempt = LoginAttempt.objects.create(
            email=email,
            google_id=google_id,
            ip_address=get_client_ip(request),
            is_successful=False,
            otp_verified=False
        )

        # Check if user exists with Google auth
        try:
            google_user = GoogleAuthUser.objects.get(google_id=google_id)
            user = google_user.user
            
            # Check if Google user has set up a password
            if not user.has_usable_password():
                # First time Google user - require password setup
                return Response({
                    'message': 'Password setup required for your Google account',
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'user_type': user.user_type,
                    },
                    'google_verified': True,
                    'requires_password': True,  # Changed from password_required for consistency
                    'session_id': login_attempt.id
                }, status=status.HTTP_200_OK)
                
        except GoogleAuthUser.DoesNotExist:
            # For Google sign-up, always create new account with Google
            # Check if user exists with this email
            print(f"DEBUG: Checking for existing user with email: {email}")  # Debug log
            try:
                existing_user = User.objects.get(email=email)
                print(f"DEBUG: Found existing user: {existing_user.username}")  # Debug log
                
                # If user exists but wants to use Google sign-up, 
                # provide their existing username for traditional login
                error_response = {
                    'error': 'You already have an account! Please use traditional login below.',
                    'message': 'Account already exists - please use traditional login',
                    'existing_email': True,
                    'existing_username': existing_user.username,
                    'user_details': {
                        'username': existing_user.username,
                        'email': existing_user.email,
                        'user_type': existing_user.user_type,
                        'is_approved': existing_user.is_approved
                    },
                    'suggestion': 'Use traditional login with your existing username and password'
                }
                print(f"DEBUG: Returning error response: {error_response}")  # Debug log
                return Response(error_response, status=status.HTTP_400_BAD_REQUEST)
                
            except User.DoesNotExist:
                # Create new user for Google sign-up
                username = email.split('@')[0]
                # Ensure username is unique
                counter = 1
                original_username = username
                while User.objects.filter(username=username).exists():
                    username = f"{original_username}{counter}"
                    counter += 1

                user = User.objects.create_user(
                    username=username,
                    email=email,
                    first_name=name.split(' ')[0] if name else '',
                    last_name=' '.join(name.split(' ')[1:]) if len(name.split(' ')) > 1 else '',
                    user_type='citizen',
                    is_approved=True  # Auto-approve Google sign-up users
                )
                # Don't set password yet - require user to set it
                
                google_user = GoogleAuthUser.objects.create(
                    user=user,
                    google_id=google_id,
                    google_email=email
                )
                
                return Response({
                    'message': 'Account created - Complete your profile setup',
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'user_type': user.user_type,
                        'is_approved': user.is_approved,
                    },
                    'suggested_username': username,
                    'google_verified': True,
                    'requires_password': True,
                    'allow_username_change': True,  # Allow user to change username
                    'session_id': login_attempt.id
                }, status=status.HTTP_200_OK)

        # Update login attempt
        login_attempt.is_successful = True
        login_attempt.save()

        # Return user info and request OTP setup/verification
        return Response({
            'message': 'Google authentication successful',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'user_type': user.user_type,
            },
            'google_verified': True,
            'otp_required': True,  # Require OTP for additional security
            'session_id': login_attempt.id  # Use this for OTP verification
        }, status=status.HTTP_200_OK)

    except ValueError as e:
        return Response(
            {'error': f'Invalid Google token: {str(e)}'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'error': f'Authentication failed: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def setup_otp(request):
    """
    Setup OTP for a user after Google authentication
    Expected payload: {'session_id': int, 'otp_type': 'email'|'sms'|'google_auth'}
    """
    try:
        session_id = request.data.get('session_id')
        otp_type = request.data.get('otp_type')
        
        if not session_id or not otp_type:
            return Response(
                {'error': 'Session ID and OTP type are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get login attempt
        try:
            login_attempt = LoginAttempt.objects.get(
                id=session_id, 
                is_successful=True, 
                otp_verified=False
            )
        except LoginAttempt.DoesNotExist:
            return Response(
                {'error': 'Invalid session'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get user
        try:
            google_user = GoogleAuthUser.objects.get(google_id=login_attempt.google_id)
            user = google_user.user
        except GoogleAuthUser.DoesNotExist:
            return Response(
                {'error': 'User not found'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create OTP verification
        otp_verification = OTPVerification.objects.create(
            user=user,
            otp_type=otp_type
        )

        if otp_type == 'email':
            # Send email OTP
            try:
                send_mail(
                    'GovSol - Your OTP Code',
                    f'Your OTP code is: {otp_verification.otp_code}. This code will expire in 10 minutes.',
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                    fail_silently=False,
                )
                return Response({
                    'message': 'OTP sent to your email',
                    'otp_id': otp_verification.id
                }, status=status.HTTP_200_OK)
            except Exception as e:
                return Response(
                    {'error': f'Failed to send email: {str(e)}'}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        elif otp_type == 'sms':
            # Send SMS OTP
            if not user.phone:
                return Response(
                    {'error': 'Phone number not provided'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            try:
                client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
                message = client.messages.create(
                    body=f'Your GovSol OTP code is: {otp_verification.otp_code}',
                    from_=settings.TWILIO_PHONE_NUMBER,
                    to=user.phone
                )
                return Response({
                    'message': 'OTP sent to your phone',
                    'otp_id': otp_verification.id
                }, status=status.HTTP_200_OK)
            except Exception as e:
                return Response(
                    {'error': f'Failed to send SMS: {str(e)}'}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        elif otp_type == 'google_auth':
            # Generate QR code for Google Authenticator
            qr_uri = otp_verification.get_qr_code_url()
            
            # Generate QR code image
            qr = qrcode.QRCode(version=1, box_size=10, border=5)
            qr.add_data(qr_uri)
            qr.make(fit=True)
            
            img = qr.make_image(fill_color="black", back_color="white")
            buffer = io.BytesIO()
            img.save(buffer, format='PNG')
            buffer.seek(0)
            
            qr_code_base64 = base64.b64encode(buffer.getvalue()).decode()
            
            return Response({
                'message': 'Scan QR code with Google Authenticator',
                'qr_code': f'data:image/png;base64,{qr_code_base64}',
                'secret_key': otp_verification.secret_key,
                'otp_id': otp_verification.id
            }, status=status.HTTP_200_OK)

        else:
            return Response(
                {'error': 'Invalid OTP type'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    except Exception as e:
        return Response(
            {'error': f'OTP setup failed: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    """
    Verify OTP and complete login
    Expected payload: {'session_id': int, 'otp_id': int, 'otp_code': '123456'}
    """
    try:
        print(f"Received OTP verification request: {request.data}")  # Debug log
        
        session_id = request.data.get('session_id')
        otp_id = request.data.get('otp_id')
        otp_code = request.data.get('otp_code')
        
        print(f"Parsed data - session_id: {session_id}, otp_id: {otp_id}, otp_code: {otp_code}")  # Debug log
        
        if not session_id or not otp_id or not otp_code:
            print("Missing required fields")  # Debug log
            return Response(
                {'error': 'Session ID, OTP ID, and OTP code are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get login attempt
        try:
            print(f"Looking for login attempt with id: {session_id}")  # Debug log
            login_attempt = LoginAttempt.objects.get(
                id=session_id, 
                is_successful=True, 
                otp_verified=False
            )
            print(f"Found login attempt: {login_attempt}")  # Debug log
        except LoginAttempt.DoesNotExist:
            print("Login attempt not found")  # Debug log
            return Response(
                {'error': 'Invalid session'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get OTP verification
        try:
            print(f"Looking for OTP verification with id: {otp_id}")  # Debug log
            otp_verification = OTPVerification.objects.get(
                id=otp_id, 
                is_used=False
            )
            print(f"Found OTP verification: {otp_verification}")  # Debug log
        except OTPVerification.DoesNotExist:
            print("OTP verification not found or already used")  # Debug log
            return Response(
                {'error': 'Invalid OTP ID'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verify OTP
        if otp_verification.verify_otp(otp_code):
            # Mark login attempt as OTP verified
            login_attempt.otp_verified = True
            login_attempt.save()
            
            # Generate JWT tokens
            user = otp_verification.user
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'message': 'Login successful',
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh),
                'user': UserSerializer(user).data
            }, status=status.HTTP_200_OK)
        else:
            return Response(
                {'error': 'Invalid or expired OTP'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    except Exception as e:
        return Response(
            {'error': f'OTP verification failed: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def resend_otp(request):
    """
    Resend OTP code
    Expected payload: {'otp_id': int}
    """
    try:
        otp_id = request.data.get('otp_id')
        
        if not otp_id:
            return Response(
                {'error': 'OTP ID is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            otp_verification = OTPVerification.objects.get(id=otp_id)
        except OTPVerification.DoesNotExist:
            return Response(
                {'error': 'Invalid OTP ID'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Generate new OTP code
        if otp_verification.otp_type == 'google_auth':
            return Response(
                {'error': 'Google Authenticator OTP cannot be resent'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generate new OTP
        otp_verification.otp_code = ''.join(random.choices(string.digits, k=6))
        otp_verification.expires_at = timezone.now() + timezone.timedelta(minutes=10)
        otp_verification.is_used = False
        otp_verification.save()

        if otp_verification.otp_type == 'email':
            send_mail(
                'GovSol - Your New OTP Code',
                f'Your new OTP code is: {otp_verification.otp_code}. This code will expire in 10 minutes.',
                settings.DEFAULT_FROM_EMAIL,
                [otp_verification.user.email],
                fail_silently=False,
            )
        elif otp_verification.otp_type == 'sms':
            client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            client.messages.create(
                body=f'Your new GovSol OTP code is: {otp_verification.otp_code}',
                from_=settings.TWILIO_PHONE_NUMBER,
                to=otp_verification.user.phone
            )

        return Response({
            'message': 'New OTP sent successfully'
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'error': f'Failed to resend OTP: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def setup_password(request):
    """
    Set up password for Google OAuth users
    Expected payload: {'session_id': int, 'password': 'new_password'}
    """
    try:
        session_id = request.data.get('session_id')
        password = request.data.get('password')
        
        print(f"Password setup request - Session ID: {session_id}")  # Debug log
        
        if not session_id or not password:
            return Response(
                {'error': 'Session ID and password are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get login attempt (don't require is_successful=True for password setup)
        try:
            login_attempt = LoginAttempt.objects.get(id=session_id)
            print(f"Found login attempt - Email: {login_attempt.email}, Google ID: {login_attempt.google_id}")  # Debug log
        except LoginAttempt.DoesNotExist:
            print(f"No login attempt found for session ID: {session_id}")  # Debug log
            return Response(
                {'error': 'Invalid session'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get user via Google auth
        try:
            google_user = GoogleAuthUser.objects.get(google_id=login_attempt.google_id)
            user = google_user.user
            print(f"Found user: {user.username} ({user.email})")  # Debug log
        except GoogleAuthUser.DoesNotExist:
            print(f"No GoogleAuthUser found for google_id: {login_attempt.google_id}")  # Debug log
            return Response(
                {'error': 'User not found'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Set password
        user.set_password(password)
        user.save()

        # Mark login attempt as successful now that password is set
        login_attempt.is_successful = True
        login_attempt.save()

        return Response({
            'message': 'Password set successfully. Please complete 2FA setup.',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'user_type': user.user_type,
            },
            'otp_required': True,
            'session_id': session_id
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'error': f'Password setup failed: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_password(request):
    """
    Verify password for existing users linking Google account
    Expected payload: {'session_id': int, 'password': 'user_password'}
    """
    try:
        session_id = request.data.get('session_id')
        password = request.data.get('password')
        
        if not session_id or not password:
            return Response(
                {'error': 'Session ID and password are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get login attempt
        try:
            login_attempt = LoginAttempt.objects.get(id=session_id)
        except LoginAttempt.DoesNotExist:
            return Response(
                {'error': 'Invalid session'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get user by email
        try:
            user = User.objects.get(email=login_attempt.email)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verify password
        if not user.check_password(password):
            return Response(
                {'error': 'Invalid password'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Link Google account
        GoogleAuthUser.objects.get_or_create(
            user=user,
            google_id=login_attempt.google_id,
            defaults={'google_email': login_attempt.email}
        )

        # Update login attempt
        login_attempt.is_successful = True
        login_attempt.save()

        return Response({
            'message': 'Password verified and Google account linked. Please complete 2FA setup.',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'user_type': user.user_type,
            },
            'google_verified': True,
            'otp_required': True,
            'session_id': session_id
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'error': f'Password verification failed: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def update_username(request):
    """
    Update username for Google OAuth users during setup
    Expected payload: {'session_id': int, 'username': 'new_username'}
    """
    try:
        session_id = request.data.get('session_id')
        new_username = request.data.get('username')
        
        if not session_id or not new_username:
            return Response(
                {'error': 'Session ID and username are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate username
        if len(new_username) < 3:
            return Response(
                {'error': 'Username must be at least 3 characters long'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if username is already taken
        if User.objects.filter(username=new_username).exists():
            return Response(
                {'error': 'Username is already taken'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get login attempt
        try:
            login_attempt = LoginAttempt.objects.get(id=session_id)
        except LoginAttempt.DoesNotExist:
            return Response(
                {'error': 'Invalid session'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get user via Google auth
        try:
            google_user = GoogleAuthUser.objects.get(google_id=login_attempt.google_id)
            user = google_user.user
        except GoogleAuthUser.DoesNotExist:
            return Response(
                {'error': 'User not found'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Update username
        user.username = new_username
        user.save()

        return Response({
            'message': 'Username updated successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'user_type': user.user_type,
                'is_approved': user.is_approved,
            },
            'session_id': session_id
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'error': f'Username update failed: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def check_email_exists(request):
    """Check if email exists and return username if found"""
    email = request.data.get('email', '').strip().lower()
    
    if not email:
        return Response({
            'error': 'Email is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(email=email)
        return Response({
            'exists': True,
            'username': user.username,
            'email': user.email,
            'user_type': user.user_type,
            'is_approved': user.is_approved,
            'message': f'Account found for {email}'
        }, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({
            'exists': False,
            'message': 'No account found with this email'
        }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def test_existing_user_error(request):
    """Test endpoint to simulate existing user error for debugging"""
    email = request.data.get('email', 'test@example.com')
    
    try:
        existing_user = User.objects.get(email=email)
        return Response({
            'error': 'You already have an account! Please use traditional login below.',
            'message': 'Account already exists - please use traditional login',
            'existing_email': True,
            'existing_username': existing_user.username,
            'user_details': {
                'username': existing_user.username,
                'email': existing_user.email,
                'user_type': existing_user.user_type,
                'is_approved': existing_user.is_approved
            },
            'suggestion': 'Use traditional login with your existing username and password'
        }, status=status.HTTP_400_BAD_REQUEST)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
