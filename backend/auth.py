from datetime import datetime, timedelta, timezone
import os
from typing import Optional

from flask import Blueprint, jsonify, request
from pymongo import MongoClient, ASCENDING
from pymongo.errors import DuplicateKeyError
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from bson import ObjectId


# Blueprint for auth routes
auth_bp = Blueprint('auth', __name__)


# --- Configuration ---
MONGODB_URI = os.environ.get('MONGODB_URI', 'mongodb://localhost:27017')
MONGODB_DB = os.environ.get('MONGODB_DB', 'inovatehub')
JWT_SECRET = os.environ.get('JWT_SECRET', 'change_me_dev_secret')
JWT_EXPIRES_MINUTES = int(os.environ.get('JWT_EXPIRES_MINUTES', '60'))


# --- Database Setup ---
mongo_client = MongoClient(MONGODB_URI)
db = mongo_client[MONGODB_DB]
users_col = db['users']
profiles_col = db['profiles']

# Ensure unique index on email for users, and unique user_id for profiles
users_col.create_index([('email', ASCENDING)], unique=True)
profiles_col.create_index([('user_id', ASCENDING)], unique=True)


def create_jwt(user_id: str, email: str, user_type: str, name: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        'sub': user_id,
        'email': email,
        'user_type': user_type,
        'name': name,
        'iat': int(now.timestamp()),
        'exp': int((now + timedelta(minutes=JWT_EXPIRES_MINUTES)).timestamp()),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')


def decode_jwt(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
    except Exception:
        return None


@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json(force=True) or {}
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    user_type = data.get('user_type', 'participant')

    if not name or not email or not password:
        return jsonify({'message': 'Name, email and password are required'}), 400

    hashed = generate_password_hash(password)

    try:
        user_doc = {
            'name': name,
            'email': email.lower().strip(),
            'password_hash': hashed,
            'user_type': user_type,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
        }
        result = users_col.insert_one(user_doc)
        user_id = str(result.inserted_id)
    except DuplicateKeyError:
        return jsonify({'message': 'Email already registered'}), 409

    token = create_jwt(user_id=user_id, email=email, user_type=user_type, name=name)
    return jsonify({
        'message': 'Account created successfully',
        'token': token,
        'user_type': user_type,
        'email': email,
        'name': name,
        'user_id': user_id,
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json(force=True) or {}
    email = (data.get('email') or '').lower().strip()
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400

    user = users_col.find_one({'email': email})
    if not user or not check_password_hash(user.get('password_hash', ''), password):
        return jsonify({'message': 'Invalid email or password'}), 401

    token = create_jwt(user_id=str(user['_id']), email=user['email'], user_type=user.get('user_type', 'participant'), name=user.get('name', ''))
    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user_type': user.get('user_type', 'participant'),
        'email': user['email'],
        'name': user.get('name', ''),
        'user_id': str(user['_id']),
    }), 200


@auth_bp.route('/verify', methods=['POST'])
def verify():
    data = request.get_json(force=True) or {}
    token = data.get('token')
    if not token:
        return jsonify({'message': 'Token is required'}), 400

    decoded = decode_jwt(token)
    if not decoded:
        return jsonify({'message': 'Invalid or expired token'}), 401

    return jsonify({
        'valid': True,
        'user_id': decoded.get('sub'),
        'email': decoded.get('email'),
        'user_type': decoded.get('user_type'),
        'name': decoded.get('name'),
    }), 200


@auth_bp.route('/logout', methods=['POST'])
def logout():
    # Stateless JWT logout handled on client by clearing cookie
    return jsonify({'message': 'Logged out'}), 200


@auth_bp.route('/profile/get', methods=['POST'])
def get_profile():
    data = request.get_json(force=True) or {}
    token = data.get('token')
    if not token:
        return jsonify({'message': 'Token is required'}), 400

    decoded = decode_jwt(token)
    if not decoded:
        return jsonify({'message': 'Invalid or expired token'}), 401

    user_id = decoded.get('sub')
    try:
        prof = profiles_col.find_one({'user_id': ObjectId(user_id)})
    except Exception:
        prof = None

    profile_data = (prof or {}).get('data') or {}
    exists = bool(profile_data)
    return jsonify({'profile': profile_data, 'exists': exists}), 200


@auth_bp.route('/profile/update', methods=['POST'])
def update_profile():
    data = request.get_json(force=True) or {}
    token = data.get('token')
    profile = data.get('profile') or {}

    if not token:
        return jsonify({'message': 'Token is required'}), 400

    decoded = decode_jwt(token)
    if not decoded:
        return jsonify({'message': 'Invalid or expired token'}), 401

    user_id = decoded.get('sub')
    # Basic server-side validation to prevent empty saves
    if not isinstance(profile, dict) or not profile:
        return jsonify({'message': 'Profile data is required'}), 400

    # Determine role and enforce allowed fields (server-side whitelist)
    try:
        user_doc = users_col.find_one({'_id': ObjectId(user_id)})
    except Exception:
        user_doc = None

    role = (profile.get('role') or (user_doc or {}).get('user_type') or 'participant').lower()
    allowed_fields_by_role = {
        'participant': {'name', 'tagline', 'location', 'bio', 'skills', 'linkedin', 'github'},
        'organizer': {'name', 'organization', 'location', 'bio', 'contact_email', 'website', 'linkedin'},
        'judge': {'name', 'specialization', 'bio', 'linkedin'},
    }
    allowed_fields = allowed_fields_by_role.get(role, allowed_fields_by_role['participant'])
    filtered_profile = {k: v for k, v in profile.items() if k in allowed_fields}

    if 'name' not in filtered_profile or not str(filtered_profile['name']).strip():
        return jsonify({'message': 'Name is required'}), 400

    now = datetime.utcnow()
    try:
        profiles_col.update_one(
            {'user_id': ObjectId(user_id)},
            {
                '$set': {'data': filtered_profile, 'role': role, 'updated_at': now},
                '$setOnInsert': {'created_at': now, 'user_id': ObjectId(user_id)},
            },
            upsert=True,
        )
        users_col.update_one({'_id': ObjectId(user_id)}, {'$set': {'profile_completed': True, 'updated_at': now}})
    except Exception as e:
        return jsonify({'message': f'Failed to update profile: {e}'}), 500

    return jsonify({'message': 'Profile updated successfully'}), 200
