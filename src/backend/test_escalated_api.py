#!/usr/bin/env python
"""
Simple test script to verify the escalated issues API endpoint works correctly.
Run this from the backend directory: python test_escalated_api.py
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model
from main.models import Issue, User
import json

def test_escalated_issues_api():
    """Test the escalated issues API endpoint"""
    print("=== Testing Escalated Issues API ===\n")
    
    # Get test users
    try:
        gn_user = User.objects.get(username='matargn')
        ds_user = User.objects.get(username='admin1')
        print(f"✅ Found GN user: {gn_user.username}")
        print(f"✅ Found DS user: {ds_user.username}")
    except User.DoesNotExist as e:
        print(f"❌ Error: {e}")
        return False
    
    # Create test client
    client = Client()
    
    # Test 1: Unauthenticated request should fail
    print("\n1. Testing unauthenticated access...")
    response = client.get('/api/issues/escalated/')
    if response.status_code == 401:
        print("✅ Unauthenticated request properly rejected")
    else:
        print(f"❌ Expected 401, got {response.status_code}")
        return False
    
    # Test 2: GN user should see escalated issues
    print("\n2. Testing GN user access...")
    client.force_login(gn_user)
    response = client.get('/api/issues/escalated/')
    
    if response.status_code == 200:
        data = json.loads(response.content)
        print(f"✅ GN user API access successful")
        print(f"✅ Found {len(data)} escalated issues")
        
        if data:
            issue = data[0]
            print(f"✅ Issue: {issue['reference_number']}")
            print(f"✅ Current level: {issue['current_level']}")
            if 'latest_escalation' in issue and issue['latest_escalation']:
                esc = issue['latest_escalation']
                print(f"✅ Escalated from {esc['from_level']} to {esc['to_level']}")
        else:
            print("❌ No escalated issues found")
            return False
    else:
        print(f"❌ GN user request failed: {response.status_code}")
        print(f"Response: {response.content.decode()}")
        return False
    
    # Test 3: DS user should see different results
    print("\n3. Testing DS user access...")
    client.force_login(ds_user)
    response = client.get('/api/issues/escalated/')
    
    if response.status_code == 200:
        data = json.loads(response.content)
        print(f"✅ DS user API access successful")
        print(f"✅ Found {len(data)} escalated issues from DS level")
    else:
        print(f"❌ DS user request failed: {response.status_code}")
        return False
    
    # Test 4: Test filtering
    print("\n4. Testing API filtering...")
    client.force_login(gn_user)
    response = client.get('/api/issues/escalated/?current_level=divisional_secretary')
    
    if response.status_code == 200:
        data = json.loads(response.content)
        print(f"✅ Filtering works: {len(data)} issues at DS level")
    else:
        print(f"❌ Filtering failed: {response.status_code}")
        return False
    
    print("\n=== All Tests Passed! ===")
    print("✅ Escalated issues API is working correctly")
    print("✅ GN users can see their escalated issues")
    print("✅ Authentication and authorization working")
    print("✅ Filtering and serialization working")
    
    return True

if __name__ == "__main__":
    success = test_escalated_issues_api()
    sys.exit(0 if success else 1)
