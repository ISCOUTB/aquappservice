"""
    This script creates a Flask instance and
    registers all the versions of the api
"""
from flask import Flask
from .apiv1 import blueprint as apiv1
from flask_cors import CORS

app = Flask(__name__)
# Activating Cross Origin Resource Sharing with flask-cors
# https://flask-cors.readthedocs.io/en/latest/
CORS(app, resources=r'/api/v1/*')

app.register_blueprint(apiv1)  # Added v1 of the api
