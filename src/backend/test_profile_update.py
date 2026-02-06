#!/usr/bin/env python
import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.test import Client
from main.models import User
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
import json

def test_profile_update():
    # Get a user
    user = User.objects.get(id=11)  # yasiru8
    print(f'Testing with user: {user.username}, current national_id: {user.national_id}')

    # Create API client and authenticate
    client = APIClient()
    refresh = RefreshToken.for_user(user)
    access_token = refresh.access_token
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')

    # Try to update with duplicate national_id
    update_data = {
        'national_id': '2345124323'  # This should conflict with user ID 9
    }

    print('Testing profile update with duplicate national_id...')
    response = client.put('/api/auth/profile/', data=json.dumps(update_data), content_type='application/json')
    print(f'Status Code: {response.status_code}')
    
    if hasattr(response, 'data'):
        print(f'Response: {response.data}')
    else:
        print(f'Response: {response.content.decode()}')

    # Test with empty string national_id (should convert to None)
    print('\nTesting with empty string national_id...')
    update_data2 = {
        'national_id': ''
    }
    
    response2 = client.put('/api/auth/profile/', data=json.dumps(update_data2), content_type='application/json')
    print(f'Status Code: {response2.status_code}')
    
    if hasattr(response2, 'data'):
        print(f'Response: {response2.data}')
    else:
        print(f'Response: {response2.content.decode()}')

if __name__ == '__main__':
    test_profile_update()
