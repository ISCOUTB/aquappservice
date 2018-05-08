"""
The flask application package.
"""
from flask import Flask
from .apiv1 import blueprint as apiv1
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

app.register_blueprint(apiv1)  # Added v1 of the api

import aquapp_api.views
