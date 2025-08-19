#!/usr/bin/env python3
"""
Test script to verify organizer authentication
"""

import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def test_organizer_signup():
    """Test organizer signup"""
    print("Testing organizer signup...")
    
    signup_data = {
        "name": "Test Organizer",
        "email": "organizer@example.com",
        "password": "password",
        "user_type": "organizer"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/signup", json=signup_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 201:
            print("✅ Organizer signup successful!")
            return response.json().get('token')
        else:
            print("❌ Organizer signup failed!")
            return None
    except Exception as e:
        print(f"❌ Error during organizer signup: {e}")
        return None

def test_organizer_login():
    """Test organizer login"""
    print("\nTesting organizer login...")
    
    login_data = {
        "email": "organizer@example.com",
        "password": "password"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            print("✅ Organizer login successful!")
            return response.json().get('token')
        else:
            print("❌ Organizer login failed!")
            return None
    except Exception as e:
        print(f"❌ Error during organizer login: {e}")
        return None

def test_judge_signup():
    """Test judge signup"""
    print("\nTesting judge signup...")
    
    signup_data = {
        "name": "Test Judge",
        "email": "judge@example.com",
        "password": "password",
        "user_type": "judge"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/signup", json=signup_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 201:
            print("✅ Judge signup successful!")
            return response.json().get('token')
        else:
            print("❌ Judge signup failed!")
            return None
    except Exception as e:
        print(f"❌ Error during judge signup: {e}")
        return None

def test_judge_login():
    """Test judge login"""
    print("\nTesting judge login...")
    
    login_data = {
        "email": "judge@example.com",
        "password": "password"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            print("✅ Judge login successful!")
            return response.json().get('token')
        else:
            print("❌ Judge login failed!")
            return None
    except Exception as e:
        print(f"❌ Error during judge login: {e}")
        return None

def main():
    print("🧪 Testing Organizer & Judge Authentication")
    print("=" * 50)
    
    # Test organizer signup and login
    organizer_token = test_organizer_signup()
    organizer_login_token = test_organizer_login()
    
    # Test judge signup and login
    judge_token = test_judge_signup()
    judge_login_token = test_judge_login()
    
    print("\n" + "=" * 50)
    print("🏁 Organizer & Judge authentication test completed!")
    
    if organizer_login_token:
        print("✅ Organizer login is working!")
    else:
        print("❌ Organizer login is NOT working!")
        
    if judge_login_token:
        print("✅ Judge login is working!")
    else:
        print("❌ Judge login is NOT working!")

if __name__ == "__main__":
    main()
