setup() {   
    pip3 install -U flask
    pip3 install -U flask-cors
}
export FLASK_APP=backend
export FLASK_ENV=development
flask run
