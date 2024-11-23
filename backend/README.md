 $env:FLASK_APP = "server.py"

 to run flask, create an env var in the command line
 so paste line 1 thingy

 next, run poetry run flask run --debug
^ that will give u url like localhost:5000

then nav to that and click the link it will log u in

when you get the redirect you will get the link that will take u to react
and then you will be interacting with spotify under the user that has logged in

**always have flask running and native react running at the same time**
**AND make sure you are cd into backend when doing poetry run flask run --debug**

goal - display a playlist and see if you can display songs in playlist
after that youll be good to go



update 9/2/2024
to run open two terminals 
the first terminal should be cd into backend and then type: poetry run flask run --debug
the second terminal should be cd into first project and then type expo start


update 11/21/2024
https://af66-104-145-72-23.ngrok-free.app/spotify-login


update 11/23/2024
expo start - backend
poetry run flask run --debug - frontend
