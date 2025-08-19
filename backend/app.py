from flask import Flask
from flask_cors import CORS
from auth import auth_bp

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'  # Replace with a strong secret key
CORS(app, resources={r"/auth/*": {"origins": "*"}})

# Register the authentication blueprint
app.register_blueprint(auth_bp, url_prefix='/auth')

@app.route('/')
def index():
    return "Flask app is running!"

if __name__ == '__main__':
    app.run(debug=True)