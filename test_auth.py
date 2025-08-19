#!/usr/bin/env python3
"""
Simple test script to verify the authentication system
"""

import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def test_signup():
    """Test user signup"""
    print("Testing signup...")
    
    signup_data = {
        "name": "Test User",
        "email": "test@example.com",
        "password": "password123",
        "user_type": "participant"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/signup", json=signup_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 201:
            print("✅ Signup successful!")
            return response.json().get('token')
        else:
            print("❌ Signup failed!")
            return None
    except Exception as e:
        print(f"❌ Error during signup: {e}")
        return None

def test_login():
    """Test user login"""
    print("\nTesting login...")
    
    login_data = {
        "email": "test@example.com",
        "password": "password123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            print("✅ Login successful!")
            return response.json().get('token')
        else:
            print("❌ Login failed!")
            return None
    except Exception as e:
        print(f"❌ Error during login: {e}")
        return None

def test_verify_token(token):
    """Test token verification"""
    if not token:
        print("❌ No token to verify!")
        return
    
    print(f"\nTesting token verification...")
    
    verify_data = {
        "token": token
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/verify", json=verify_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            print("✅ Token verification successful!")
        else:
            print("❌ Token verification failed!")
    except Exception as e:
        print(f"❌ Error during token verification: {e}")

def test_logout():
    """Test logout"""
    print("\nTesting logout...")
    
    try:
        response = requests.post(f"{BASE_URL}/auth/logout")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            print("✅ Logout successful!")
        else:
            print("❌ Logout failed!")
    except Exception as e:
        print(f"❌ Error during logout: {e}")

def main():
    print("🧪 Testing Authentication System")
    print("=" * 40)
    
    # Test signup
    token = test_signup()
    
    # Test login
    login_token = test_login()
    
    # Test token verification
    test_verify_token(login_token or token)
    
    # Test logout
    test_logout()
    
    print("\n" + "=" * 40)
    print("🏁 Authentication system test completed!")

if __name__ == "__main__":
    main()
