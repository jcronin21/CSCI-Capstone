from flask import Flask, render_template, redirect, request, session, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import requests
import base64

load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "http://localhost:19006"}})

#Use the secret key from .env for session management
app.secret_key = os.getenv("FLASK_SECRET_KEY", "aOY+DIo1RZ0uQylPU7uzTDthtqr8PvHv")

#Session cookie config
app.config.update(
    SESSION_COOKIE_SAMESITE="Lax",  #Make sure that cookies are sent with cross-site requests
    SESSION_COOKIE_SECURE=True,    #True if you're using HTTPS
    SESSION_PERMANENT=False        #False for non-permanent sessions
)

#Spotify configuration
SPOTIFY_REDIRECT_URI = os.getenv("SPOTIFY_REDIRECT_URI", "http://localhost:19006/callback")

def get_spotify_token():
    CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
    CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")

    auth_str = f"{CLIENT_ID}:{CLIENT_SECRET}"
    b64_auth_str = base64.b64encode(auth_str.encode()).decode()

    token_url = "https://accounts.spotify.com/api/token"
    headers = {
        "Authorization": f"Basic {b64_auth_str}",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    payload = {"grant_type": "client_credentials"}

    response = requests.post(token_url, headers=headers, data=payload)
    if response.status_code == 200:
        token_data = response.json()
        return token_data["access_token"]
    else:
        print("Failed to fetch token:", response.status_code, response.json())
        return None

@app.route('/spotify-login')
def spotify_login():
    CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
    REDIRECT_URI = os.getenv("SPOTIFY_REDIRECT_URI")
    SCOPES = "user-read-email user-read-private"

    spotify_auth_url = (
        f"https://accounts.spotify.com/authorize?client_id={CLIENT_ID}"
        f"&response_type=code&redirect_uri={REDIRECT_URI}"
        f"&scope={SCOPES.replace(' ', '%20')}"
    )
    return redirect(spotify_auth_url)

@app.route('/callback/spotify')
def process_token_spotify():
    code = request.args.get('code')
    if not code:
        return jsonify({"error": "Missing authorization code"}), 400

    CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
    CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
    REDIRECT_URI = os.getenv("SPOTIFY_REDIRECT_URI")

    token_url = "https://accounts.spotify.com/api/token"
    payload = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": REDIRECT_URI,
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
    }

    response = requests.post(token_url, data=payload)
    if response.status_code != 200:
        return jsonify({"error": "Failed to fetch tokens", "details": response.json()}), response.status_code

    token_data = response.json()
    session['access_token'] = token_data.get("access_token")
    session['refresh_token'] = token_data.get("refresh_token")

    return redirect("http://localhost:19006/")

@app.route('/api/playlists')
def get_user_playlists():
    token = session.get('access_token')
    if not token:
        return {'unauthorized': "You need to log in."}

    headers = {"Authorization": f"Bearer {token}"}
    url = 'https://api.spotify.com/v1/me/playlists'
    response = requests.get(url, headers=headers)

    if response.ok:
        return response.json()
    return {'error': 'Error fetching playlists from Spotify API'}, response.status_code

@app.route('/api/recently-played')
def get_recently_played():
    token = session.get('access_token')
    if not token:
        return {'unauthorized': "You need to log in."}

    headers = {"Authorization": f"Bearer {token}"}
    url = 'https://api.spotify.com/v1/me/player/recently-played'
    response = requests.get(url, headers=headers)

    if response.ok:
        return response.json()
    return {'error': 'Error fetching recently played tracks from Spotify API'}, response.status_code

if __name__ == '__main__':
    app.run(debug=True)

#user data
@app.route('/api/profile-data')
def get_profile_data():
    access_token = session.get('access_token')
    if not access_token:
        return jsonify({"error": "User not authenticated"}), 401

    profile_url = "https://api.spotify.com/v1/me"
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(profile_url, headers=headers)

    if response.status_code != 200:
        return jsonify({"error": "Failed to fetch user profile"}), response.status_code

    return jsonify(response.json())



#refresh the token 
def refresh_spotify_token():
    refresh_token = session.get('refresh_token')
    if not refresh_token:
        return None

    CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
    CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")

    token_url = "https://accounts.spotify.com/api/token"
    token_data = {
        "grant_type": "refresh_token",
        "refresh_token": refresh_token,
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
    }

    response = requests.post(token_url, data=token_data)
    if response.status_code != 200:
        return None

    token_info = response.json()
    session['access_token'] = token_info.get("access_token")
    session['expires_in'] = token_info.get("expires_in")
    return token_info.get("access_token")
