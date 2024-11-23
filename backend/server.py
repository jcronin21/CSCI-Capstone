from flask import Flask, render_template, redirect, request, session, jsonify
from flask_cors import CORS
from authlib.integrations.flask_client import OAuth
from dotenv import load_dotenv
import os
from uuid import uuid4
import requests


load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "https://af66-104-145-72-23.ngrok-free.app"}})

#Use the secret key from .env for session management
app.secret_key = os.getenv("FLASK_SECRET_KEY", "aOY+DIo1RZ0uQylPU7uzTDthtqr8PvHv")

#Session cookie config
app.config.update(
    SESSION_COOKIE_SAMESITE="Lax",  #Make sure that cookies are sent with cross-site requests
    SESSION_COOKIE_SECURE=True,    #True if you're using HTTPS
    SESSION_PERMANENT=False        #False for non-permanent sessions
)

#Auth0 configuration
AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN")
AUTH0_CLIENT_ID = os.getenv("AUTH0_CLIENT_ID")
AUTH0_CLIENT_SECRET = os.getenv("AUTH0_CLIENT_SECRET")
AUTH0_CALLBACK_URL = os.getenv("AUTH0_CALLBACK_URL")
AUTH0_LOGOUT_URL = f"https://{AUTH0_DOMAIN}/v2/logout?client_id={AUTH0_CLIENT_ID}&returnTo=https://af66-104-145-72-23.ngrok-free.app"

#Spotify configuration
SPOTIFY_REDIRECT_URI = os.getenv("SPOTIFY_REDIRECT_URI")

oauth = OAuth(app)
auth0 = oauth.register(
    'auth0',
    client_id=AUTH0_CLIENT_ID,
    client_secret=AUTH0_CLIENT_SECRET,
    server_metadata_url=f'https://{AUTH0_DOMAIN}/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid profile email',
    }
)

def get_spotify_token():
    CLIENT_ID = "b6ff98053c404aae853a4a1da8ac29ef"
    CLIENT_SECRET = "a481a1a519c44ab28f288639b3163702"
    
    
    auth_str = f"{CLIENT_ID}:{CLIENT_SECRET}"
    b64_auth_str = base64.b64encode(auth_str.encode()).decode()

    #sending to api
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


token = get_spotify_token()
print("Token:", token)


def search_spotify_tracks(query, token):
    url = "https://api.spotify.com/v1/search"
    headers = {"Authorization": f"Bearer {token}"}
    params = {"q": query, "type": "track", "limit": 10}

    response = requests.get(url, headers=headers, params=params)
    if response.status_code == 200:
        return response.json()
    else:
        print("Failed to fetch tracks:", response.status_code, response.json())
        return None

#example
token = get_spotify_token()
tracks = search_spotify_tracks("Imagine Dragons", token)
print(tracks)


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

#Auth0 login
@app.route('/auth0-login')
def auth0_login():
    state = str(uuid4())
    session['oauth_state'] = state

    #Redirect to Auth0
    return auth0.authorize_redirect(
        redirect_uri=AUTH0_CALLBACK_URL,
        state=state
    )


#Auth0 Callback
@app.route('/auth0-callback')
def auth0_callback():
    if request.args.get('state') != session.get('oauth_state'):
        return jsonify({"error": "Invalid state parameter"}), 400

    try:
        token = auth0.authorize_access_token()
        session['access_token'] = token.get('access_token')
        session['refresh_token'] = token.get('refresh_token')

        #fetch Spotify user profile using access token
        headers = {
            'Authorization': f"Bearer {session['access_token']}",
            'Content-Type': 'application/json',
        }
        spotify_profile = requests.get('https://api.spotify.com/v1/me', headers=headers).json()

        #Store user info
        session['user'] = spotify_profile

        #redirect
        return redirect("http://localhost:19006/dashboard")
    except Exception as e:
        print(f"Auth0 Callback Error: {e}")
        return jsonify({"error": str(e)}), 500




@app.route('/api/profile-data', methods=['GET'])
def get_profile_data():
    if 'user' not in session:
        return jsonify({"error": "Unauthorized"}), 401

    return jsonify({
        "auth0_user": session['user'],
        "spotify_profile": session.get('spotify_profile', {})
    })

@app.route('/dashboard')
def dashboard():
    if 'auth0_token' not in session:
        return redirect('/auth0-login')

    user = session['user']
    return f"Welcome {user['name']}! You are logged in."

#Auth0 logout
@app.route('/logout')
def logout():
    session.clear()
    return redirect(AUTH0_LOGOUT_URL)

#Spotify Callback
@app.route('/callback/spotify')
def process_token_spotify():
    code = request.args.get('code')
    if not code:
        return jsonify({"error": "Missing authorization code"}), 400

    CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
    CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
    REDIRECT_URI = os.getenv("SPOTIFY_REDIRECT_URI")

    #Exchange authorization code for tokens
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

    #Redirect back to the app's dashboard
    return redirect("http://localhost:19006/profile")


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
