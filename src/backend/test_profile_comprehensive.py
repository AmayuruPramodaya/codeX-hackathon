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

def test_various_scenarios():
    print("=== Testing Profile Update Scenarios ===\n")
    
    # Get a user
    user = User.objects.get(id=11)  # yasiru8
    print(f'Testing with user: {user.username}')
    print(f'Current national_id: {repr(user.national_id)}')

    # Create API client and authenticate
    client = APIClient()
    refresh = RefreshToken.for_user(user)
    access_token = refresh.access_token
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')

    # Test 1: Update with valid unique national_id
    print("\n--- Test 1: Valid unique national_id ---")
    update_data = {
        'national_id': '199901234567'  # New unique ID
    }
    
    response = client.put('/api/auth/profile/', data=json.dumps(update_data), content_type='application/json')
    print(f'Status Code: {response.status_code}')
    
    if response.status_code == 200:
        print("✅ Successfully updated with unique national_id")
        updated_user = User.objects.get(id=11)
        print(f'Updated national_id: {updated_user.national_id}')
    else:
        print(f"❌ Failed: {response.data if hasattr(response, 'data') else response.content.decode()}")

    # Test 2: Try to update with duplicate national_id
    print("\n--- Test 2: Duplicate national_id (should fail gracefully) ---")
    update_data = {
        'national_id': '2345124323'  # This should conflict with user ID 9
    }

    response = client.put('/api/auth/profile/', data=json.dumps(update_data), content_type='application/json')
    print(f'Status Code: {response.status_code}')
    
    if response.status_code == 400:
        print("✅ Correctly rejected duplicate national_id")
        print(f"Error message: {response.data.get('national_id', ['No specific error'])[0]}")
    else:
        print(f"❌ Unexpected response: {response.data if hasattr(response, 'data') else response.content.decode()}")

    # Test 3: Update with empty string (should convert to None)
    print("\n--- Test 3: Empty string national_id (should convert to None) ---")
    update_data = {
        'national_id': ''
    }
    
    response = client.put('/api/auth/profile/', data=json.dumps(update_data), content_type='application/json')
    print(f'Status Code: {response.status_code}')
    
    if response.status_code == 200:
        print("✅ Successfully handled empty string")
        updated_user = User.objects.get(id=11)
        print(f'Final national_id: {repr(updated_user.national_id)}')
    else:
        print(f"❌ Failed: {response.data if hasattr(response, 'data') else response.content.decode()}")

    # Test 4: Update same user with their current national_id (should work)
    print("\n--- Test 4: Update with same user's current national_id ---")
    current_user = User.objects.get(id=11)
    update_data = {
        'national_id': current_user.national_id,
        'first_name': 'Updated Name'
    }
    
    response = client.put('/api/auth/profile/', data=json.dumps(update_data), content_type='application/json')
    print(f'Status Code: {response.status_code}')
    
    if response.status_code == 200:
        print("✅ Successfully updated user with their own national_id")
    else:
        print(f"❌ Failed: {response.data if hasattr(response, 'data') else response.content.decode()}")

    print("\n=== All Tests Completed ===")

if __name__ == '__main__':
    test_various_scenarios()
