"""
    This namespace is only meant for logging into
    the api. The credentials are passed to
    login/ in the request payload and if they're
    valid a token is returned.
    
    All the files (excluding __init__.py) in this
    directory performs api operation according to
    their names using marshmallow to validate
    the input:
    https://marshmallow.readthedocs.io/en/latest/
"""

import jwt
import os
import bcrypt
from flask import request, abort
from flask_restplus import Namespace, Resource, reqparse
from .core.swagger_models import user
from .core.marshmallow_models import UserSchema
from .core.database import Database
from .core.utils import token_required
from datetime import datetime, timedelta

api = Namespace('login', description='login operations')
user = api.schema_model('User', user)

# Receives a valid user and password and then provide a token to access the 
# protected routes across the application.
@api.route('/')
class Login(Resource):
    @api.doc(summary='Login to the API',
             responses={200: 'Login successful'})
    @api.expect(user)
    def post(self):
        user, errors = UserSchema().load(request.get_json(force=True) or {})
        if not errors:
            u = Database().get_user(user['username'])
            if u and bcrypt.checkpw(user['password'].encode('utf-8'), u['password']):
                # The token expires in one day
                return {
                    'message': 'Login successful',
                    'TOKEN': jwt.encode({
                        'user': user['username'],
                        'exp': datetime.utcnow() + timedelta(minutes=1440)
                    }, os.getenv('SECRET_KEY')).decode('utf-8')
                }, 200
        return {'message': 'Login failed, check your username and password', **errors}, 400

@api.route("/change-password")
class ChangePassword(Resource):
    @api.doc(summary='Change the password of a user',
             responses={200: 'Password changed'})
    @api.expect(user)
    def post(self):
        user, errors = UserSchema().load(request.get_json(force=True) or {})
        if not errors:
            Database().change_password(user['username'], user["password"])
            return {
                'message': 'Password changed'
            }, 200
        return {'message': 'Failed to change the password', **errors}, 400
