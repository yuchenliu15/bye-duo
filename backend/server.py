import os
from flask import Flask, request
from flask_cors import CORS
import requests
import json


def response(app, res, status):
    return app.response_class(response=res, status=status,)

# create and configure the app
app = Flask(__name__, instance_relative_config=True)
CORS(app)
app.config.from_mapping(
    SECRET_KEY="dev", DATABASE=os.path.join(app.instance_path, "flaskr.sqlite"),
)

# ensure the instance folder exists
try:
    os.makedirs(app.instance_path)
except OSError:
    pass

@app.route("/")
def home():
	return 'heyhey'

@app.route("/secret", methods=["POST"])
def secret():
    return 'helllo'
    user_url = request.form.get("secret", None)
    if not user_url:
        return response(app, {}, 400)

    user_url = user_url.lstrip("https://").split("/")
    domain = user_url[0][1:]
    key = user_url[-1]
    DUO = f"https://api{domain}/push/v2/activation/{key}?customer_protocol=1"
    try:
        secret = json.loads(requests.post(DUO).text)['response']['hotp_secret']
        status = 200
    except:
        secret = ""
        status = 400

    return response(app, secret, status)


if __name__ == "__main__":
    app.run(host='0.0.0.0')
