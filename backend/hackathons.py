from datetime import datetime
from typing import Optional
from flask import Blueprint, jsonify, request
from pymongo import MongoClient, ASCENDING, DESCENDING
from bson import ObjectId
from urllib.parse import quote_plus
import os
import jwt

# Shared DB setup (reuse same env vars as auth)
MONGODB_PASSWORD = "darshan"
DEFAULT_ATLAS_URI = f"mongodb+srv://dar:{quote_plus(MONGODB_PASSWORD) if MONGODB_PASSWORD else '<db_password>'}@cluster0.g3jy5p4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
MONGODB_URI = os.environ.get('MONGODB_URI', DEFAULT_ATLAS_URI)
MONGODB_DB = os.environ.get('MONGODB_DB', 'inovatehub')
JWT_SECRET = os.environ.get('JWT_SECRET', 'change_me_dev_secret')

mongo_client = MongoClient(MONGODB_URI)
db = mongo_client[MONGODB_DB]
hackathons_col = db['hackathons']
registrations_col = db['registrations']

hackathons_col.create_index([('created_at', DESCENDING)])
registrations_col.create_index([('user_id', ASCENDING), ('hackathon_id', ASCENDING)], unique=True)

hackathons_bp = Blueprint('hackathons', __name__)


def decode_jwt(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
    except Exception:
        return None


@hackathons_bp.route('/list', methods=['GET'])
def list_hackathons():
    docs = list(hackathons_col.find({}).sort('created_at', DESCENDING))
    def to_public(h):
        return {
            'id': str(h['_id']),
            'name': h.get('name', ''),
            'theme': h.get('theme', ''),
            'date': h.get('date', ''),
            'rounds': h.get('rounds', []),
            'prize': h.get('prize', 0),
            'locationType': h.get('locationType', 'online'),
            'image': h.get('image', ''),
            'hint': h.get('hint', ''),
            'description': h.get('description', ''),
            'tracks': h.get('tracks', []),
            'rules': h.get('rules', ''),
            'prizes': h.get('prizes', ''),
            'sponsors': h.get('sponsors', []),
            'faq': h.get('faq', []),
        }
    return jsonify({'hackathons': [to_public(h) for h in docs]}), 200


@hackathons_bp.route('/get/<hackathon_id>', methods=['GET'])
def get_hackathon(hackathon_id: str):
    try:
        doc = hackathons_col.find_one({'_id': ObjectId(hackathon_id)})
    except Exception:
        doc = None
    if not doc:
        return jsonify({'message': 'Hackathon not found'}), 404
    # Return public-safe fields only
    public = {
        'id': str(doc['_id']),
        'name': doc.get('name', ''),
        'theme': doc.get('theme', ''),
        'date': doc.get('date', ''),
        'rounds': doc.get('rounds', []),
        'prize': doc.get('prize', 0),
        'locationType': doc.get('locationType', 'online'),
        'location': doc.get('location'),
        'image': doc.get('image', ''),
        'hint': doc.get('hint', ''),
        'description': doc.get('description', ''),
        'tracks': doc.get('tracks', []),
        'rules': doc.get('rules', ''),
        'team_size': doc.get('team_size', 0),
    }
    return jsonify(public), 200


@hackathons_bp.route('/create', methods=['POST'])
def create_hackathon():
    data = request.get_json(force=True) or {}
    token = data.get('token')
    hack = data.get('hackathon') or {}
    decoded = decode_jwt(token or '')
    if not decoded:
        return jsonify({'message': 'Unauthorized'}), 401
    if (decoded.get('user_type') or '') != 'organizer':
        return jsonify({'message': 'Only organizers can create hackathons'}), 403

    required = ['name', 'description', 'theme', 'locationType']
    if any(not hack.get(k) for k in required):
        return jsonify({'message': 'Missing required fields'}), 400

    doc = {
        'name': hack['name'],
        'description': hack['description'],
        'theme': hack['theme'],
        'locationType': hack['locationType'],  # 'online' | 'offline'
        'location': hack.get('location'),
        'date': hack.get('date', ''),
        'rounds': hack.get('rounds', []),
        'prize': hack.get('prize', 0),
        'image': hack.get('image', 'https://placehold.co/1200x600.png'),
        'hint': hack.get('hint', 'hackathon banner'),
        'tracks': hack.get('tracks', []),
        'rules': hack.get('rules', ''),
        'prizes': hack.get('prizes', ''),
        'sponsors': hack.get('sponsors', []),
        'faq': hack.get('faq', []),
        'team_size': int(hack.get('team_size', 0) or 0),
        'organizer_id': ObjectId(decoded['sub']),
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow(),
    }
    res = hackathons_col.insert_one(doc)
    return jsonify({'message': 'Hackathon created', 'id': str(res.inserted_id)}), 201


@hackathons_bp.route('/update/<hackathon_id>', methods=['POST'])
def update_hackathon(hackathon_id: str):
    data = request.get_json(force=True) or {}
    token = data.get('token')
    hack = data.get('hackathon') or {}
    decoded = decode_jwt(token or '')
    if not decoded:
        return jsonify({'message': 'Unauthorized'}), 401
    try:
        doc = hackathons_col.find_one({'_id': ObjectId(hackathon_id)})
    except Exception:
        doc = None
    if not doc:
        return jsonify({'message': 'Not found'}), 404
    if str(doc.get('organizer_id')) != decoded.get('sub'):
        return jsonify({'message': 'Forbidden'}), 403

    allowed = {'name','description','theme','locationType','location','date','rounds','prize','image','hint','tracks','rules','prizes','sponsors','faq','team_size'}
    updates = {k: v for k, v in hack.items() if k in allowed}
    updates['updated_at'] = datetime.utcnow()
    hackathons_col.update_one({'_id': ObjectId(hackathon_id)}, {'$set': updates})
    return jsonify({'message': 'Hackathon updated'}), 200


@hackathons_bp.route('/delete/<hackathon_id>', methods=['POST'])
def delete_hackathon(hackathon_id: str):
    data = request.get_json(force=True) or {}
    token = data.get('token')
    decoded = decode_jwt(token or '')
    if not decoded:
        return jsonify({'message': 'Unauthorized'}), 401
    try:
        doc = hackathons_col.find_one({'_id': ObjectId(hackathon_id)})
    except Exception:
        doc = None
    if not doc:
        return jsonify({'message': 'Not found'}), 404
    if str(doc.get('organizer_id')) != decoded.get('sub'):
        return jsonify({'message': 'Forbidden'}), 403

    hackathons_col.delete_one({'_id': ObjectId(hackathon_id)})
    registrations_col.delete_many({'hackathon_id': ObjectId(hackathon_id)})
    return jsonify({'message': 'Hackathon deleted'}), 200


@hackathons_bp.route('/register/<hackathon_id>', methods=['POST'])
def register(hackathon_id: str):
    data = request.get_json(force=True) or {}
    token = data.get('token')
    decoded = decode_jwt(token or '')
    if not decoded:
        return jsonify({'message': 'Unauthorized'}), 401
    try:
        hack = hackathons_col.find_one({'_id': ObjectId(hackathon_id)})
    except Exception:
        hack = None
    if not hack:
        return jsonify({'message': 'Hackathon not found'}), 404

    try:
        registrations_col.insert_one({
            'hackathon_id': ObjectId(hackathon_id),
            'user_id': ObjectId(decoded['sub']),
            'created_at': datetime.utcnow(),
        })
    except Exception:
        return jsonify({'message': 'Already registered'}), 200
    return jsonify({'message': 'Registered'}), 201


@hackathons_bp.route('/my-registrations', methods=['POST'])
def my_registrations():
    data = request.get_json(force=True) or {}
    token = data.get('token')
    decoded = decode_jwt(token or '')
    if not decoded:
        return jsonify({'message': 'Unauthorized'}), 401

    regs = list(registrations_col.find({'user_id': ObjectId(decoded['sub'])}))
    hack_ids = [r['hackathon_id'] for r in regs]
    hacks = list(hackathons_col.find({'_id': {'$in': hack_ids}}))
    return jsonify({'hackathons': [{
        'id': str(h['_id']),
        'name': h.get('name',''),
        'theme': h.get('theme',''),
        'date': h.get('date',''),
        'rounds': h.get('rounds',[]),
        'prize': h.get('prize',0),
        'locationType': h.get('locationType','online'),
        'image': h.get('image',''),
        'hint': h.get('hint',''),
        'description': h.get('description',''),
        'registrationStatus': 'Confirmed',
    } for h in hacks]}), 200


