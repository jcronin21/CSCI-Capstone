'''
To understand this workflow better, read this article:
    * https://developer.spotify.com/documentation/web-api/tutorials/code-flow
'''
import base64
import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

SPOTIFY_URL_AUTH = 'https://accounts.spotify.com/authorize/?'
SPOTIFY_URL_TOKEN = 'https://accounts.spotify.com/api/token/'

CLIENT_ID = os.environ.get("SPOTIFY_CLIENT_ID")
CLIENT_SECRET = os.environ.get("SPOTIFY_CLIENT_SECRET")
REDIRECT_URI = os.environ.get("SPOTIFY_REDIRECT_URI")
print(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)

# https://developer.spotify.com/documentation/web-api/concepts/scopes
scopes = [
    "user-read-private",
    "user-read-email",
    "user-read-recently-played",
    "user-library-read",
    "playlist-read-private"
]
SCOPE = ' '.join(scopes)


def get_spotify_auth_url():
    url = "{0}client_id={1}&response_type=code&redirect_uri={2}&scope={3}".format(
        SPOTIFY_URL_AUTH,
        CLIENT_ID,
        REDIRECT_URI,
        SCOPE
    )
    return url


def get_spotify_credentials(code):
    body = {
        "grant_type": 'authorization_code',
        "code": code,
        "redirect_uri": REDIRECT_URI,
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET
    }

    id_secret = "{}:{}".format(CLIENT_ID, CLIENT_SECRET)
    encoded_bytes = base64.b64encode(id_secret.encode('utf-8'))
    headers = {
        "Content-Type": 'application/x-www-form-urlencoded',
        "Authorization": f"Basic {encoded_bytes.decode('utf-8')}"
    }

    post = requests.post(SPOTIFY_URL_TOKEN, params=body, headers=headers)
    response = json.loads(post.text)
    # print(response)
    return response
