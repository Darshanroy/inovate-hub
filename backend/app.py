from flask import Flask
from flask_cors import CORS
from auth import auth_bp
from hackathons import hackathons_bp

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'  # Replace with a strong secret key
# Enable CORS for all routes (auth + hackathons)
CORS(app, resources={r"/*": {"origins": "*"}}, methods=["GET","POST","OPTIONS"], allow_headers=["Content-Type","Authorization"])

# Register the authentication blueprint
app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(hackathons_bp, url_prefix='/hackathons')

@app.route('/')
def index():
    return "Flask app is running!"

if __name__ == '__main__':
    app.run(debug=True)