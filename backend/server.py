from flask import Flask, render_template, redirect, request, session, jsonify
from flask_cors import CORS
from authlib.integrations.flask_client import OAuth
import os
from uuid import uuid4
import requests
import spotify_auth as spotify_auth

app = Flask(__name__)
CORS(app, supports_credentials=True)

#Use the secret key from .env for session management
app.secret_key = os.getenv("FLASK_SECRET_KEY", "aOY+DIo1RZ0uQylPU7uzTDthtqr8PvHv")

#Session cookie configuration
app.config.update(
    SESSION_COOKIE_SAMESITE="Lax",  #make sure that cookies are sent with cross-site requests
    SESSION_COOKIE_SECURE=False,    #true if you're using HTTPS
    SESSION_PERMANENT=False         #False for non permanent sessions
)

#Auth0 configuration
AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN")
AUTH0_CLIENT_ID = os.getenv("AUTH0_CLIENT_ID")
AUTH0_CLIENT_SECRET = os.getenv("AUTH0_CLIENT_SECRET")
AUTH0_CALLBACK_URL = os.getenv("AUTH0_CALLBACK_URL")
AUTH0_LOGOUT_URL = f"https://{AUTH0_DOMAIN}/v2/logout?client_id={AUTH0_CLIENT_ID}&returnTo=http://localhost:5000/"

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

access_token = None
refresh_token = None
unauthorized_message = "You need to log in. Go to the login site and then try again: '/spotify-login."

@app.route('/')
def hello_world():
    return render_template('index.html')

@app.route('/spotify-login')
def login_spotify():
    response = spotify_auth.get_spotify_auth_url()
    return redirect(response)

#Auth0 login
@app.route('/auth0-login')
def auth0_login():
    state = str(uuid4())
    session['oauth_state'] = state
    return auth0.authorize_redirect(redirect_uri=AUTH0_CALLBACK_URL, state=state)

#Auth0 Callback
@app.route('/auth0-callback')
def auth0_callback():
    print(f"State in request: {request.args.get('state')}")
    print(f"State in session: {session.get('oauth_state')}")

    if request.args.get('state') != session.get('oauth_state'):
        return jsonify({"error": "Invalid state parameter"})

    try:
        token = auth0.authorize_access_token() 
        session['auth0_token'] = token
        userinfo = auth0.parse_id_token(token)
        session['user'] = userinfo
        return redirect('/dashboard')
    except Exception as e:
        print(f"Auth0 Error: {e}")
        return jsonify({"error": str(e)})

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
    global access_token
    global refresh_token
    credentials = spotify_auth.get_spotify_credentials(request.args.get('code'))

    access_token = credentials.get("access_token")
    refresh_token = credentials.get("refresh_token")

    return f'<a href ="http://localhost:19006/">Go to React app!</a>'

@app.route('/api/playlists')
def get_user_playlists():
    if access_token is None:
        return {'unauthorized': unauthorized_message}
    else:
        headers = {"Authorization": f"Bearer {access_token}"}
        url = 'https://api.spotify.com/v1/me/playlists'
        data = requests.get(url, headers=headers)
        return data.json()

@app.route('/api/profile')
def get_user_profile():
    if access_token is None:
        return {'unauthorized': unauthorized_message}
    else:
        headers = {'Authorization': f"Bearer {access_token}"}
        url = 'https://api.spotify.com/v1/me'
        data = requests.get(url, headers=headers)
        return data.json()

@app.route('/api/recently-played')
def get_recently_played():
    if access_token is None:
        return {'unauthorized': unauthorized_message}
    else:
        headers = {"Authorization": f"Bearer {access_token}"}
        url = 'https://api.spotify.com/v1/me/player/recently-played'
        data = requests.get(url, headers=headers)
        return data.json()

@app.route('/api/search')
def search_spotify():
    if access_token is None:
        return {'unauthorized': unauthorized_message}

    query = request.args.get('q')
    search_type = request.args.get('type')

    if not query or not search_type:
        return {'error': 'Please enter a track to search'}

    headers = {"Authorization": f"Bearer {access_token}"}
    params = {'q': query, 'type': search_type}

    try:
        response = requests.get('https://api.spotify.com/v1/search', headers=headers, params=params)
        if response.ok:
            return response.json()
        else:
            return {'error': 'Error fetching search results from Spotify API'}
    except requests.exceptions.RequestException as e:
        return {'error': f'Error: {str(e)}'}

if __name__ == '__main__':
    app.run(debug=True)
