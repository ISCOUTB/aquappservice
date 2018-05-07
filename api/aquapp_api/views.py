"""
Routes and views for the flask application.
"""

from datetime import datetime
from flask import render_template
from aquapp_api import app

@app.route('/')
def index():
    return render_template('index.html')