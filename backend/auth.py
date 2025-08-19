import firebase_admin
from firebase_admin import credentials
from firebase_admin import auth
from flask import Flask, request, jsonify

# Initialize Firebase Admin SDK
# Replace 'path/to/your/serviceAccountKey.json' with the actual path to your Firebase service account key file
try:
    cred = credentials.Certificate('inovatehub-1bfed-firebase-adminsdk-fbsvc-44d0b994c1.json')
    firebase_admin.initialize_app(cred)
except Exception as e:
    print(f"Error initializing Firebase Admin SDK: {e}")
    exit()


app = Flask(__name__)

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400

    try:
        user = auth.create_user(
            email=email,
            password=password
        )
        return jsonify({'message': 'Successfully created new user', 'uid': user.uid}), 201
    except Exception as e:
        return jsonify({'message': f'Error creating user: {e}'}), 400

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password') # Note: For security, client-side Firebase SDK should handle password login and send ID token

    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400

    # Note: Direct password login on the backend is not recommended for security.
    # It's better to use the Firebase client SDK to sign in and verify the ID token on the backend.
    # This is a basic example and does not include ID token verification.

    try:
        # This part is illustrative and not how you'd typically handle password login on the backend with Admin SDK
        # The recommended approach is client-side sign-in and backend ID token verification.
        # You would typically receive an ID token from the client after they authenticate.
        # Example of verifying an ID token:
        # id_token = data.get('idToken')
        # decoded_token = auth.verify_id_token(id_token)
        # uid = decoded_token['uid']
        # return jsonify({'message': 'Successfully logged in', 'uid': uid}), 200

        return jsonify({'message': 'Backend password login is not recommended. Use client-side authentication and send ID token for verification.'}), 400

    except Exception as e:
         return jsonify({'message': f'Error during login: {e}'}), 401

if __name__ == '__main__':
    # In a production environment, use a production-ready WSGI server like Gunicorn or uWSGI
    app.run(debug=True)