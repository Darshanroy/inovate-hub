from datetime import datetime
from typing import Optional
from flask import Blueprint, jsonify, request
from pymongo import MongoClient, ASCENDING, DESCENDING
from bson import ObjectId
from urllib.parse import quote_plus
import os
import jwt
from auth import users_col, profiles_col

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
teams_col = db['teams']
team_requests_col = db['team_requests']
submissions_col = db['submissions']

# Create indexes
hackathons_col.create_index([('created_at', DESCENDING)])
registrations_col.create_index([('user_id', ASCENDING), ('hackathon_id', ASCENDING)], unique=True)
teams_col.create_index([('hackathon_id', ASCENDING), ('name', ASCENDING)], unique=True)
teams_col.create_index([('hackathon_id', ASCENDING), ('code', ASCENDING)], unique=True)
team_requests_col.create_index([('team_id', ASCENDING), ('user_id', ASCENDING)], unique=True)
team_requests_col.create_index([('hackathon_id', ASCENDING), ('user_id', ASCENDING)])
submissions_col.create_index([('hackathon_id', ASCENDING)])
submissions_col.create_index([('team_id', ASCENDING)])

# Add team messages collection
team_messages_col = db['team_messages']
team_messages_col.create_index([('team_id', ASCENDING), ('created_at', DESCENDING)])

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
        # Normalize rounds to include 'start'/'end' if only 'date' exists
        rounds = []
        for r in (h.get('rounds', []) or []):
            if isinstance(r, dict):
                rounds.append({
                    'name': r.get('name', ''),
                    'description': r.get('description', ''),
                    'start': r.get('start') or r.get('date') or '',
                    'end': r.get('end') or '',
                })
        
        return {
            'id': str(h['_id']),
            'name': h.get('name', ''),
            'theme': h.get('theme', ''),
            'date': h.get('date', ''),
            'start_date': h.get('start_date', h.get('date', '')),
            'end_date': h.get('end_date', ''),
            'rounds': rounds,
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
    reg_count = registrations_col.count_documents({'hackathon_id': ObjectId(hackathon_id)})
    team_count = teams_col.count_documents({'hackathon_id': ObjectId(hackathon_id)})
    # Normalize rounds to include 'start'/'end' if only 'date' exists
    rounds = []
    for r in (doc.get('rounds', []) or []):
        if isinstance(r, dict):
            rounds.append({
                'name': r.get('name', ''),
                'description': r.get('description', ''),
                'start': r.get('start') or r.get('date') or '',
                'end': r.get('end') or '',
            })

    public = {
        'id': str(doc['_id']),
        'name': doc.get('name', ''),
        'theme': doc.get('theme', ''),
        'date': doc.get('date', ''),
        'start_date': doc.get('start_date', doc.get('date', '')),
        'end_date': doc.get('end_date', ''),
        'rounds': rounds,
        'prize': doc.get('prize', 0),
        'locationType': doc.get('locationType', 'online'),
        'location': doc.get('location'),
        'image': doc.get('image', ''),
        'hint': doc.get('hint', ''),
        'description': doc.get('description', ''),
        'tracks': doc.get('tracks', []),
        'rules': doc.get('rules', ''),
        'team_size': doc.get('team_size', 0),
        'prizes': doc.get('prizes', ''),
        'sponsors': doc.get('sponsors', []),
        'faq': doc.get('faq', []),
        'registration_count': reg_count,
        'team_count': team_count,
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
        'date': hack.get('date', ''),  # legacy single date support
        'start_date': hack.get('start_date', hack.get('date', '')),
        'end_date': hack.get('end_date', ''),
        'rounds': hack.get('rounds', []),  # each round may have start/end
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
    teams_col.delete_many({'hackathon_id': ObjectId(hackathon_id)})
    team_requests_col.delete_many({'hackathon_id': ObjectId(hackathon_id)})
    return jsonify({'message': 'Hackathon deleted'}), 200


# Alias delete route used by organizer dashboard client
@hackathons_bp.route('/organizer/delete/<hackathon_id>', methods=['POST', 'DELETE'])
def organizer_delete_hackathon(hackathon_id: str):
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
    teams_col.delete_many({'hackathon_id': ObjectId(hackathon_id)})
    team_requests_col.delete_many({'hackathon_id': ObjectId(hackathon_id)})
    return jsonify({'message': 'Hackathon deleted'}), 200


@hackathons_bp.route('/register/<hackathon_id>', methods=['POST'])
def register(hackathon_id: str):
    data = request.get_json(force=True) or {}
    token = data.get('token')
    details = data.get('details') or {}
    decoded = decode_jwt(token or '')
    if not decoded:
        return jsonify({'message': 'Unauthorized'}), 401
    try:
        hack = hackathons_col.find_one({'_id': ObjectId(hackathon_id)})
    except Exception:
        hack = None
    if not hack:
        return jsonify({'message': 'Hackathon not found'}), 404

    now = datetime.utcnow()
    looking_for_team = not bool(details.get('hasTeam'))
    motivation = (details.get('motivation') or '').strip()
    team_code = (details.get('teamCode') or '').strip()
    portfolio_link = (details.get('portfolio') or '').strip()
    # Optional richer participant profile
    full_name = (details.get('fullName') or '').strip()
    role = (details.get('role') or '').strip()
    skills = details.get('skills') or []
    experience_level = (details.get('experienceLevel') or '').strip()
    github = (details.get('github') or '').strip()
    linkedin = (details.get('linkedin') or '').strip()
    resume_link = (details.get('resumeLink') or '').strip()

    res = registrations_col.update_one(
        {'hackathon_id': ObjectId(hackathon_id), 'user_id': ObjectId(decoded['sub'])},
        {
            '$setOnInsert': {
                'created_at': now,
            },
            '$set': {
                'motivation': motivation,
                'looking_for_team': looking_for_team,
                'team_code': team_code,
                'portfolio_link': portfolio_link,
                'full_name': full_name,
                'role': role,
                'skills': skills,
                'experience_level': experience_level,
                'github': github,
                'linkedin': linkedin,
                'resume_link': resume_link,
                'status': 'Confirmed',
                'updated_at': now,
            },
        },
        upsert=True,
    )

    if res.upserted_id is not None:
        return jsonify({'message': 'Registered'}), 201
    return jsonify({'message': 'Registration updated'}), 200


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


# Team Management Routes
@hackathons_bp.route('/teams/create/<hackathon_id>', methods=['POST'])
def create_team(hackathon_id: str):
    data = request.get_json(force=True) or {}
    token = data.get('token')
    team_data = data.get('team') or {}
    decoded = decode_jwt(token or '')
    if not decoded:
        return jsonify({'message': 'Unauthorized'}), 401
    
    # Check if user is registered for this hackathon
    reg = registrations_col.find_one({
        'hackathon_id': ObjectId(hackathon_id),
        'user_id': ObjectId(decoded['sub'])
    })
    if not reg:
        return jsonify({'message': 'You must register for this hackathon first'}), 400

    name = (team_data.get('name') or '').strip()
    description = (team_data.get('description') or '').strip()
    
    if not name:
        return jsonify({'message': 'Team name is required'}), 400

    # Generate unique team code
    import random
    import string
    code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    
    # Ensure code is unique
    while teams_col.find_one({'code': code}):
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

    now = datetime.utcnow()
    # Fixed team size limit of 5 members (including leader)
    max_members = 5
    team_doc = {
        'hackathon_id': ObjectId(hackathon_id),
        'name': name,
        'description': description,
        'code': code,
        'leader_id': ObjectId(decoded['sub']),
        'members': [ObjectId(decoded['sub'])],  # Leader is first member
        'max_members': max_members,
        'created_at': now,
        'updated_at': now,
    }
    
    try:
        res = teams_col.insert_one(team_doc)
        return jsonify({
            'message': 'Team created successfully',
            'team_id': str(res.inserted_id),
            'code': code
        }), 201
    except Exception as e:
        return jsonify({'message': f'Failed to create team: {str(e)}'}), 500


@hackathons_bp.route('/teams/list/<hackathon_id>', methods=['GET'])
def list_teams(hackathon_id: str):
    try:
        teams = list(teams_col.find({'hackathon_id': ObjectId(hackathon_id)}))
        
        # Get user details for team members
        team_list = []
        for team in teams:
            member_ids = team.get('members', [])
            users = list(users_col.find({'_id': {'$in': member_ids}}))
            user_map = {str(u['_id']): u for u in users}
            
            team_info = {
                'id': str(team['_id']),
                'name': team.get('name', ''),
                'description': team.get('description', ''),
                'code': team.get('code', ''),
                'leader_id': str(team.get('leader_id', '')),
                'members': [
                    {
                        'id': str(member_id),
                        'name': user_map.get(str(member_id), {}).get('name', 'Unknown'),
                        'email': user_map.get(str(member_id), {}).get('email', '')
                    }
                    for member_id in member_ids
                ],
                'max_members': 5,
                'created_at': team.get('created_at', ''),
            }
            team_list.append(team_info)
        
        return jsonify({'teams': team_list}), 200
    except Exception as e:
        return jsonify({'message': f'Failed to list teams: {str(e)}'}), 500


@hackathons_bp.route('/teams/join/<hackathon_id>', methods=['POST'])
def join_team(hackathon_id: str):
    data = request.get_json(force=True) or {}
    token = data.get('token')
    team_code = (data.get('team_code') or '').strip()
    decoded = decode_jwt(token or '')
    if not decoded:
        return jsonify({'message': 'Unauthorized'}), 401
    
    if not team_code:
        return jsonify({'message': 'Team code is required'}), 400

    # Check if user is registered for this hackathon
    reg = registrations_col.find_one({
        'hackathon_id': ObjectId(hackathon_id),
        'user_id': ObjectId(decoded['sub'])
    })
    if not reg:
        return jsonify({'message': 'You must register for this hackathon first'}), 400

    # Find team by code
    team = teams_col.find_one({
        'hackathon_id': ObjectId(hackathon_id),
        'code': team_code
    })
    if not team:
        return jsonify({'message': 'Invalid team code'}), 404

    # Check if user is already in the team
    if ObjectId(decoded['sub']) in team.get('members', []):
        return jsonify({'message': 'You are already a member of this team'}), 400

    # Check if team is full (prefer team's saved max_members; fallback to hackathon team_size)
    try:
        hack = hackathons_col.find_one({'_id': ObjectId(hackathon_id)})
    except Exception:
        hack = None
    # Enforce fixed maximum size of 5
    effective_max = 5
    if len(team.get('members', [])) >= effective_max:
        return jsonify({'message': 'Team is full'}), 400

    # Add user to team
    teams_col.update_one(
        {'_id': team['_id']},
        {
            '$addToSet': {'members': ObjectId(decoded['sub'])},
            '$set': {'updated_at': datetime.utcnow()}
        }
    )

    return jsonify({'message': 'Successfully joined team'}), 200


@hackathons_bp.route('/teams/request/<hackathon_id>', methods=['POST'])
def request_join_team(hackathon_id: str):
    data = request.get_json(force=True) or {}
    token = data.get('token')
    team_id = data.get('team_id')
    message = (data.get('message') or '').strip()
    decoded = decode_jwt(token or '')
    if not decoded:
        return jsonify({'message': 'Unauthorized'}), 401
    
    if not team_id:
        return jsonify({'message': 'Team ID is required'}), 400

    # Check if user is registered for this hackathon
    reg = registrations_col.find_one({
        'hackathon_id': ObjectId(hackathon_id),
        'user_id': ObjectId(decoded['sub'])
    })
    if not reg:
        return jsonify({'message': 'You must register for this hackathon first'}), 400

    # Check if team exists
    team = teams_col.find_one({'_id': ObjectId(team_id)})
    if not team:
        return jsonify({'message': 'Team not found'}), 404

    # Check if request already exists
    existing_request = team_requests_col.find_one({
        'team_id': ObjectId(team_id),
        'user_id': ObjectId(decoded['sub'])
    })
    if existing_request:
        return jsonify({'message': 'Request already sent'}), 400

    # Create request
    now = datetime.utcnow()
    request_doc = {
        'hackathon_id': ObjectId(hackathon_id),
        'team_id': ObjectId(team_id),
        'user_id': ObjectId(decoded['sub']),
        'message': message,
        'status': 'pending',  # pending, approved, rejected
        'created_at': now,
        'updated_at': now,
    }
    
    team_requests_col.insert_one(request_doc)
    return jsonify({'message': 'Request sent successfully'}), 201


@hackathons_bp.route('/teams/requests/<hackathon_id>', methods=['POST'])
def get_team_requests(hackathon_id: str):
    data = request.get_json(force=True) or {}
    token = data.get('token')
    decoded = decode_jwt(token or '')
    if not decoded:
        return jsonify({'message': 'Unauthorized'}), 401

    # Get teams where user is leader
    user_teams = list(teams_col.find({
        'hackathon_id': ObjectId(hackathon_id),
        'leader_id': ObjectId(decoded['sub'])
    }))
    
    team_ids = [team['_id'] for team in user_teams]
    
    # Get requests for these teams
    requests = list(team_requests_col.find({
        'team_id': {'$in': team_ids},
        'status': 'pending'
    }))
    
    # Get user details
    user_ids = [req['user_id'] for req in requests]
    users = list(users_col.find({'_id': {'$in': user_ids}}))
    user_map = {str(u['_id']): u for u in users}
    
    request_list = []
    for req in requests:
        request_info = {
            'id': str(req['_id']),
            'team_id': str(req['team_id']),
            'user_id': str(req['user_id']),
            'user_name': user_map.get(str(req['user_id']), {}).get('name', 'Unknown'),
            'user_email': user_map.get(str(req['user_id']), {}).get('email', ''),
            'message': req.get('message', ''),
            'status': req.get('status', 'pending'),
            'created_at': req.get('created_at', ''),
        }
        request_list.append(request_info)
    
    return jsonify({'requests': request_list}), 200


@hackathons_bp.route('/teams/requests/respond', methods=['POST'])
def respond_to_request():
    data = request.get_json(force=True) or {}
    token = data.get('token')
    request_id = data.get('request_id')
    action = data.get('action')  # 'approve' or 'reject'
    decoded = decode_jwt(token or '')
    if not decoded:
        return jsonify({'message': 'Unauthorized'}), 401
    
    if not request_id or action not in ['approve', 'reject']:
        return jsonify({'message': 'Invalid request'}), 400

    # Get the request
    req = team_requests_col.find_one({'_id': ObjectId(request_id)})
    if not req:
        return jsonify({'message': 'Request not found'}), 404

    # Check if user is the team leader
    team = teams_col.find_one({'_id': req['team_id']})
    if not team or str(team.get('leader_id')) != decoded.get('sub'):
        return jsonify({'message': 'Forbidden'}), 403

    if action == 'approve':
        # Check if team is full (fixed at 5)
        if len(team.get('members', [])) >= 5:
            return jsonify({'message': 'Team is full'}), 400
        
        # Add user to team
        teams_col.update_one(
            {'_id': req['team_id']},
            {
                '$addToSet': {'members': req['user_id']},
                '$set': {'updated_at': datetime.utcnow()}
            }
        )
        
        # Update request status
        team_requests_col.update_one(
            {'_id': ObjectId(request_id)},
            {
                '$set': {
                    'status': 'approved',
                    'updated_at': datetime.utcnow()
                }
            }
        )
        
        return jsonify({'message': 'Request approved'}), 200
    else:
        # Reject request
        team_requests_col.update_one(
            {'_id': ObjectId(request_id)},
            {
                '$set': {
                    'status': 'rejected',
                    'updated_at': datetime.utcnow()
                }
            }
        )
        
        return jsonify({'message': 'Request rejected'}), 200


@hackathons_bp.route('/teams/invitations/list', methods=['POST'])
def list_invitations():
    data = request.get_json(force=True) or {}
    token = data.get('token')
    decoded = decode_jwt(token or '')
    if not decoded:
        return jsonify({'message': 'Unauthorized'}), 401

    # Find pending invitations for the user
    requests = list(team_requests_col.find({
        'user_id': ObjectId(decoded['sub']),
        'status': 'pending',
        'invited_by_leader': True,
    }).sort('created_at', DESCENDING))

    # Load team info
    team_ids = [req['team_id'] for req in requests]
    teams = list(teams_col.find({'_id': {'$in': team_ids}})) if team_ids else []
    team_map = {str(t['_id']): t for t in teams}

    invitation_list = []
    for req in requests:
        team = team_map.get(str(req['team_id'])) or {}
        invitation_list.append({
            'id': str(req['_id']),
            'hackathon_id': str(req.get('hackathon_id', '')),
            'team_id': str(req['team_id']),
            'team_name': team.get('name', ''),
            'team_code': team.get('code', ''),
            'message': req.get('message', ''),
            'created_at': req.get('created_at', ''),
        })

    return jsonify({'invitations': invitation_list}), 200


@hackathons_bp.route('/teams/invitations/respond', methods=['POST'])
def respond_invitation():
    data = request.get_json(force=True) or {}
    token = data.get('token')
    request_id = data.get('request_id')
    action = data.get('action')  # 'accept' or 'reject'
    decoded = decode_jwt(token or '')
    if not decoded:
        return jsonify({'message': 'Unauthorized'}), 401

    if not request_id or action not in ['accept', 'reject']:
        return jsonify({'message': 'Invalid request'}), 400

    req = team_requests_col.find_one({'_id': ObjectId(request_id)})
    if not req or str(req.get('user_id')) != decoded.get('sub'):
        return jsonify({'message': 'Forbidden'}), 403

    team = teams_col.find_one({'_id': req['team_id']})
    if not team:
        return jsonify({'message': 'Team not found'}), 404

    if action == 'accept':
        # Ensure user not already in another team for this hackathon
        existing = teams_col.find_one({'hackathon_id': team['hackathon_id'], 'members': ObjectId(decoded['sub'])})
        if existing:
            return jsonify({'message': 'You are already in a team for this hackathon'}), 400
        # Check capacity
        if len(team.get('members', [])) >= 5:
            return jsonify({'message': 'Team is full'}), 400
        # Add member
        teams_col.update_one(
            {'_id': team['_id']},
            {'$addToSet': {'members': ObjectId(decoded['sub'])}, '$set': {'updated_at': datetime.utcnow()}}
        )
        # Mark as approved
        team_requests_col.update_one(
            {'_id': ObjectId(request_id)},
            {'$set': {'status': 'approved', 'updated_at': datetime.utcnow()}}
        )
        return jsonify({'message': 'Invitation accepted'}), 200
    else:
        team_requests_col.update_one(
            {'_id': ObjectId(request_id)},
            {'$set': {'status': 'rejected', 'updated_at': datetime.utcnow()}}
        )
        return jsonify({'message': 'Invitation rejected'}), 200


# Organizer Dashboard Routes
@hackathons_bp.route('/organizer/hackathons', methods=['POST'])
def organizer_hackathons():
    data = request.get_json(force=True) or {}
    token = data.get('token')
    decoded = decode_jwt(token or '')
    if not decoded:
        return jsonify({'message': 'Unauthorized'}), 401
    
    if decoded.get('user_type') != 'organizer':
        return jsonify({'message': 'Forbidden'}), 403

    hackathons = list(hackathons_col.find({'organizer_id': ObjectId(decoded['sub'])}).sort('created_at', DESCENDING))
    
    hackathon_list = []
    for hack in hackathons:
        # Count registrations
        reg_count = registrations_col.count_documents({'hackathon_id': hack['_id']})
        
        # Count teams
        team_count = teams_col.count_documents({'hackathon_id': hack['_id']})
        
        # Normalize rounds
        rounds = []
        for r in (hack.get('rounds', []) or []):
            if isinstance(r, dict):
                rounds.append({
                    'name': r.get('name', ''),
                    'description': r.get('description', ''),
                    'start': r.get('start') or r.get('date') or '',
                    'end': r.get('end') or '',
                })

        hack_info = {
            'id': str(hack['_id']),
            'name': hack.get('name', ''),
            'theme': hack.get('theme', ''),
            'date': hack.get('date', ''),
            'start_date': hack.get('start_date', hack.get('date', '')),
            'end_date': hack.get('end_date', ''),
            'rounds': rounds,
            'prize': hack.get('prize', 0),
            'locationType': hack.get('locationType', 'online'),
            'image': hack.get('image', ''),
            'hint': hack.get('hint', ''),
            'description': hack.get('description', ''),
            'registration_count': reg_count,
            'team_count': team_count,
            'created_at': hack.get('created_at', ''),
        }
        hackathon_list.append(hack_info)
    
    return jsonify({'hackathons': hackathon_list}), 200


@hackathons_bp.route('/organizer/participants/<hackathon_id>', methods=['POST'])
def organizer_participants(hackathon_id: str):
    data = request.get_json(force=True) or {}
    token = data.get('token')
    decoded = decode_jwt(token or '')
    if not decoded:
        return jsonify({'message': 'Unauthorized'}), 401
    
    if decoded.get('user_type') != 'organizer':
        return jsonify({'message': 'Forbidden'}), 403

    # Check if hackathon belongs to organizer
    hack = hackathons_col.find_one({'_id': ObjectId(hackathon_id)})
    if not hack or str(hack.get('organizer_id')) != decoded.get('sub'):
        return jsonify({'message': 'Forbidden'}), 403

    # Get all registrations for this hackathon
    registrations = list(registrations_col.find({'hackathon_id': ObjectId(hackathon_id)}))
    
    # Get user details
    user_ids = [reg['user_id'] for reg in registrations]
    users = list(users_col.find({'_id': {'$in': user_ids}}))
    user_map = {str(u['_id']): u for u in users}
    
    # Get team information
    teams = list(teams_col.find({'hackathon_id': ObjectId(hackathon_id)}))
    team_map = {}
    for team in teams:
        for member_id in team.get('members', []):
            team_map[str(member_id)] = {
                'team_id': str(team['_id']),
                'team_name': team.get('name', ''),
                'team_code': team.get('code', ''),
            }
    
    participant_list = []
    for reg in registrations:
        user = user_map.get(str(reg['user_id']), {})
        team_info = team_map.get(str(reg['user_id']))
        
        participant_info = {
            'id': str(reg['user_id']),
            'name': reg.get('full_name') or user.get('name', 'Unknown'),
            'email': user.get('email', ''),
            'motivation': reg.get('motivation', ''),
            'portfolio_link': reg.get('portfolio_link', ''),
            'looking_for_team': reg.get('looking_for_team', True),
            'team_code': reg.get('team_code', ''),
            'role': reg.get('role', ''),
            'skills': reg.get('skills', []),
            'experience_level': reg.get('experience_level', ''),
            'github': reg.get('github', ''),
            'linkedin': reg.get('linkedin', ''),
            'resume_link': reg.get('resume_link', ''),
            'registration_date': (reg.get('created_at').isoformat() if hasattr(reg.get('created_at'), 'isoformat') else str(reg.get('created_at') or '')),
            'team': team_info,
        }
        participant_list.append(participant_info)
    
    return jsonify({'participants': participant_list}), 200


@hackathons_bp.route('/participants/public/<hackathon_id>', methods=['GET'])
def participants_public(hackathon_id: str):
    """Public-safe list of participants for a hackathon used by Find Team page.
    Does not require organizer privileges and returns limited fields.
    """
    try:
        registrations = list(registrations_col.find({'hackathon_id': ObjectId(hackathon_id)}))
    except Exception:
        registrations = []

    # user details
    user_ids = [reg.get('user_id') for reg in registrations if reg.get('user_id')]
    users = list(users_col.find({'_id': {'$in': user_ids}})) if user_ids else []
    user_map = {str(u['_id']): u for u in users}

    # team info map
    teams = list(teams_col.find({'hackathon_id': ObjectId(hackathon_id)}))
    team_map = {}
    for team in teams:
        for member_id in team.get('members', []):
            team_map[str(member_id)] = {
                'team_id': str(team['_id']),
                'team_name': team.get('name', ''),
                'team_code': team.get('code', ''),
            }

    participant_list = []
    for reg in registrations:
        uid = str(reg.get('user_id')) if reg.get('user_id') else ''
        user = user_map.get(uid, {})
        team_info = team_map.get(uid)
        participant_info = {
            'id': uid,
            'name': reg.get('full_name') or user.get('name', 'Unknown'),
            'looking_for_team': reg.get('looking_for_team', True),
            'skills': reg.get('skills', []),
            'role': reg.get('role', ''),
            'motivation': reg.get('motivation', ''),
            'portfolio_link': reg.get('portfolio_link', ''),
            'team': team_info,
        }
        participant_list.append(participant_info)

    return jsonify({'participants': participant_list}), 200


@hackathons_bp.route('/teams/invite/<hackathon_id>', methods=['POST'])
def invite_participant(hackathon_id: str):
    data = request.get_json(force=True) or {}
    token = data.get('token')
    user_id = data.get('user_id')
    message = (data.get('message') or '').strip()
    decoded = decode_jwt(token or '')
    if not decoded:
        return jsonify({'message': 'Unauthorized'}), 401

    if not user_id:
        return jsonify({'message': 'User ID is required'}), 400

    # Ensure inviter is leader of a team in this hackathon
    leader_team = teams_col.find_one({
        'hackathon_id': ObjectId(hackathon_id),
        'leader_id': ObjectId(decoded['sub'])
    })
    if not leader_team:
        return jsonify({'message': 'Only team leaders can invite participants'}), 403

    # Ensure the invited user is registered for this hackathon
    reg = registrations_col.find_one({
        'hackathon_id': ObjectId(hackathon_id),
        'user_id': ObjectId(user_id)
    })
    if not reg:
        return jsonify({'message': 'User is not registered for this hackathon'}), 400

    # Prevent inviting users already in a team in this hackathon
    existing_team = teams_col.find_one({
        'hackathon_id': ObjectId(hackathon_id),
        'members': ObjectId(user_id)
    })
    if existing_team:
        return jsonify({'message': 'User is already in a team'}), 400

    # Create or upsert an invitation request (reuse team_requests)
    now = datetime.utcnow()
    try:
        team_requests_col.update_one(
            {
                'team_id': leader_team['_id'],
                'user_id': ObjectId(user_id)
            },
            {
                '$setOnInsert': {
                    'hackathon_id': ObjectId(hackathon_id),
                    'created_at': now,
                },
                '$set': {
                    'message': message or 'Team invitation',
                    'status': 'pending',  # pending until user accepts/leader approves
                    'invited_by_leader': True,
                    'updated_at': now,
                }
            },
            upsert=True,
        )
    except Exception as e:
        return jsonify({'message': f'Failed to send invitation: {str(e)}'}), 500

    return jsonify({'message': 'Invitation sent'}), 200


# Team Messages and Updates
@hackathons_bp.route('/teams/messages/<hackathon_id>', methods=['POST'])
def get_team_messages(hackathon_id: str):
    data = request.get_json(force=True) or {}
    token = data.get('token')
    decoded = decode_jwt(token or '')
    if not decoded:
        return jsonify({'message': 'Unauthorized'}), 401

    # Find user's team
    user_teams = list(teams_col.find({
        'hackathon_id': ObjectId(hackathon_id),
        'members': ObjectId(decoded['sub'])
    }))
    
    if not user_teams:
        return jsonify({'message': 'Not part of any team'}), 404
    
    team = user_teams[0]
    
    # Get team messages
    messages = list(team_messages_col.find({
        'team_id': team['_id']
    }).sort('created_at', DESCENDING).limit(50))
    
    # Get user details for messages
    user_ids = [msg['sender_id'] for msg in messages]
    users = list(users_col.find({'_id': {'$in': user_ids}}))
    user_map = {str(u['_id']): u for u in users}
    
    message_list = []
    for msg in messages:
        user = user_map.get(str(msg['sender_id']), {})
        message_info = {
            'id': str(msg['_id']),
            'sender_id': str(msg['sender_id']),
            'sender_name': user.get('name', 'Unknown'),
            'message': msg.get('message', ''),
            'timestamp': msg.get('created_at', '').isoformat() if msg.get('created_at') else '',
        }
        message_list.append(message_info)
    
    return jsonify({'messages': message_list}), 200


@hackathons_bp.route('/teams/messages/send/<hackathon_id>', methods=['POST'])
def send_team_message(hackathon_id: str):
    data = request.get_json(force=True) or {}
    token = data.get('token')
    message_text = (data.get('message') or '').strip()
    decoded = decode_jwt(token or '')
    if not decoded:
        return jsonify({'message': 'Unauthorized'}), 401
    
    if not message_text:
        return jsonify({'message': 'Message is required'}), 400

    # Find user's team
    user_teams = list(teams_col.find({
        'hackathon_id': ObjectId(hackathon_id),
        'members': ObjectId(decoded['sub'])
    }))
    
    if not user_teams:
        return jsonify({'message': 'Not part of any team'}), 404
    
    team = user_teams[0]
    
    # Create message
    now = datetime.utcnow()
    message_doc = {
        'team_id': team['_id'],
        'sender_id': ObjectId(decoded['sub']),
        'message': message_text,
        'created_at': now,
    }
    
    res = team_messages_col.insert_one(message_doc)
    return jsonify({'message': 'Message sent', 'id': str(res.inserted_id)}), 201


@hackathons_bp.route('/teams/update/<hackathon_id>', methods=['POST'])
def update_team(hackathon_id: str):
    data = request.get_json(force=True) or {}
    token = data.get('token')
    updates = data.get('updates') or {}
    decoded = decode_jwt(token or '')
    if not decoded:
        return jsonify({'message': 'Unauthorized'}), 401

    # Find user's team where they are leader
    user_teams = list(teams_col.find({
        'hackathon_id': ObjectId(hackathon_id),
        'leader_id': ObjectId(decoded['sub'])
    }))
    
    if not user_teams:
        return jsonify({'message': 'Not team leader'}), 403
    
    team = user_teams[0]
    
    # Allowed updates
    allowed_updates = {}
    if 'description' in updates:
        allowed_updates['description'] = str(updates['description']).strip()
    
    if not allowed_updates:
        return jsonify({'message': 'No valid updates provided'}), 400
    
    allowed_updates['updated_at'] = datetime.utcnow()
    
    teams_col.update_one({'_id': team['_id']}, {'$set': allowed_updates})
    return jsonify({'message': 'Team updated'}), 200


@hackathons_bp.route('/teams/my-team/<hackathon_id>', methods=['POST'])
def get_my_team(hackathon_id: str):
    data = request.get_json(force=True) or {}
    token = data.get('token')
    decoded = decode_jwt(token or '')
    if not decoded:
        return jsonify({'message': 'Unauthorized'}), 401

    # Find user's team
    user_teams = list(teams_col.find({
        'hackathon_id': ObjectId(hackathon_id),
        'members': ObjectId(decoded['sub'])
    }))
    
    if not user_teams:
        return jsonify({'team': None}), 200
    
    team = user_teams[0]
    
    # Get user details for team members
    member_ids = team.get('members', [])
    users = list(users_col.find({'_id': {'$in': member_ids}}))
    user_map = {str(u['_id']): u for u in users}
    
    team_info = {
        'id': str(team['_id']),
        'name': team.get('name', ''),
        'description': team.get('description', ''),
        'code': team.get('code', ''),
        'leader_id': str(team.get('leader_id', '')),
        'members': [
            {
                'id': str(member_id),
                'name': user_map.get(str(member_id), {}).get('name', 'Unknown'),
                'email': user_map.get(str(member_id), {}).get('email', ''),
                'isLeader': str(member_id) == str(team.get('leader_id', ''))
            }
            for member_id in member_ids
        ],
        'max_members': 5,
        'created_at': team.get('created_at', '').isoformat() if team.get('created_at') else '',
    }
    
    return jsonify({'team': team_info}), 200


@hackathons_bp.route('/teams/remove-member/<hackathon_id>', methods=['POST'])
def remove_team_member(hackathon_id: str):
    data = request.get_json(force=True) or {}
    token = data.get('token')
    member_id = data.get('member_id')
    decoded = decode_jwt(token or '')
    if not decoded:
        return jsonify({'message': 'Unauthorized'}), 401
    
    if not member_id:
        return jsonify({'message': 'Member ID is required'}), 400

    # Find user's team where they are leader
    user_teams = list(teams_col.find({
        'hackathon_id': ObjectId(hackathon_id),
        'leader_id': ObjectId(decoded['sub'])
    }))
    
    if not user_teams:
        return jsonify({'message': 'Not team leader'}), 403
    
    team = user_teams[0]
    
    # Cannot remove leader
    if str(member_id) == str(team.get('leader_id')):
        return jsonify({'message': 'Cannot remove team leader'}), 400
    
    # Remove member
    teams_col.update_one(
        {'_id': team['_id']},
        {
            '$pull': {'members': ObjectId(member_id)},
            '$set': {'updated_at': datetime.utcnow()}
        }
    )
    
    return jsonify({'message': 'Member removed'}), 200



# Submissions (minimal endpoints for organizer manage and view pages)
@hackathons_bp.route('/submissions/list/<hackathon_id>', methods=['POST'])
def list_submissions(hackathon_id: str):
    data = request.get_json(force=True) or {}
    token = data.get('token')
    decoded = decode_jwt(token or '')
    if not decoded:
        return jsonify({'message': 'Unauthorized'}), 401

    # Ensure requester is the organizer of this hackathon
    try:
        hack = hackathons_col.find_one({'_id': ObjectId(hackathon_id)})
    except Exception:
        hack = None
    if not hack:
        return jsonify({'message': 'Hackathon not found'}), 404
    if str(hack.get('organizer_id')) != decoded.get('sub'):
        return jsonify({'message': 'Forbidden'}), 403

    docs = list(submissions_col.find({'hackathon_id': ObjectId(hackathon_id)}).sort('created_at', DESCENDING))

    def to_public(s):
        def to_iso(val):
            return (val.isoformat() if hasattr(val, 'isoformat') else (val or ''))
        return {
            'id': str(s['_id']),
            'hackathon_id': str(s.get('hackathon_id', '')),
            'team_id': str(s.get('team_id', '')),
            'team_name': s.get('team_name', ''),
            'project_title': s.get('project_title', ''),
            'project_description': s.get('project_description', ''),
            'tech_stack': s.get('tech_stack', []),
            'github_link': s.get('github_link'),
            'video_link': s.get('video_link'),
            'files': s.get('files', []),
            'status': s.get('status', 'draft'),
            'score': s.get('score'),
            'feedback': s.get('feedback'),
            'submitted_at': to_iso(s.get('submitted_at') or s.get('created_at') or ''),
            'updated_at': to_iso(s.get('updated_at') or ''),
            'created_at': to_iso(s.get('created_at') or ''),
        }

    return jsonify({'submissions': [to_public(s) for s in docs]}), 200


@hackathons_bp.route('/submissions/get/<submission_id>', methods=['GET'])
def get_submission(submission_id: str):
    try:
        s = submissions_col.find_one({'_id': ObjectId(submission_id)})
    except Exception:
        s = None
    if not s:
        return jsonify({'message': 'Submission not found'}), 404

    def to_iso(val):
        return (val.isoformat() if hasattr(val, 'isoformat') else (val or ''))
    public = {
        'id': str(s['_id']),
        'hackathon_id': str(s.get('hackathon_id', '')),
        'team_id': str(s.get('team_id', '')),
        'team_name': s.get('team_name', ''),
        'project_title': s.get('project_title', ''),
        'project_description': s.get('project_description', ''),
        'tech_stack': s.get('tech_stack', []),
        'github_link': s.get('github_link'),
        'video_link': s.get('video_link'),
        'files': s.get('files', []),
        'status': s.get('status', 'draft'),
        'score': s.get('score'),
        'feedback': s.get('feedback'),
        'submitted_at': to_iso(s.get('submitted_at') or s.get('created_at') or ''),
        'updated_at': to_iso(s.get('updated_at') or ''),
        'created_at': to_iso(s.get('created_at') or ''),
    }
    return jsonify({'submission': public}), 200


@hackathons_bp.route('/submissions/my/<hackathon_id>', methods=['POST'])
def my_submission(hackathon_id: str):
    data = request.get_json(force=True) or {}
    token = data.get('token')
    decoded = decode_jwt(token or '')
    if not decoded:
        return jsonify({'message': 'Unauthorized'}), 401

    # find user's team in this hackathon
    user_id = ObjectId(decoded['sub'])
    team = teams_col.find_one({'hackathon_id': ObjectId(hackathon_id), 'members': user_id})
    if not team:
        return jsonify({'submission': None}), 200

    # find submission by team
    s = submissions_col.find_one({'hackathon_id': ObjectId(hackathon_id), 'team_id': team['_id']})
    if not s:
        return jsonify({'submission': None}), 200

    def to_iso(val):
        return (val.isoformat() if hasattr(val, 'isoformat') else (val or ''))
    public = {
        'id': str(s['_id']),
        'hackathon_id': str(s.get('hackathon_id', '')),
        'team_id': str(s.get('team_id', '')),
        'team_name': s.get('team_name', ''),
        'project_title': s.get('project_title', ''),
        'project_description': s.get('project_description', ''),
        'tech_stack': s.get('tech_stack', []),
        'github_link': s.get('github_link'),
        'video_link': s.get('video_link'),
        'files': s.get('files', []),
        'status': s.get('status', 'draft'),
        'score': s.get('score'),
        'feedback': s.get('feedback'),
        'submitted_at': to_iso(s.get('submitted_at') or s.get('created_at') or ''),
        'updated_at': to_iso(s.get('updated_at') or ''),
        'created_at': to_iso(s.get('created_at') or ''),
    }
    return jsonify({'submission': public}), 200
