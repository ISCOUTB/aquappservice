import jwt
import os
import bcrypt
from flask import request, abort
from flask_restplus import Namespace, Resource, reqparse
from .core.swagger_models import user
from .core.marshmallow_models import UserSchema
from .core.database import Database
from datetime import datetime, timedelta

api = Namespace('login', description='login operations')
user = api.schema_model('User', user)

# Receives a valid user and password and then provide a token to access the 
# protected routes across the application.
@api.route('/')
class Login(Resource):
    @api.doc(summary='Login to the API',
             responses={201: 'Login successful'})
    @api.expect(user)
    def post(self):
        user, errors = UserSchema().load(request.get_json())
        if not errors:
            u = Database().get_user(user['username'])
            if u and bcrypt.checkpw(user['password'].encode('utf-8'), u['password']):
                # The token expires in one day
                return {
                    'message': 'Login successful',
                    'API-TOKEN': jwt.encode({
                        'user': user['username'],
                        'exp': datetime.utcnow() + timedelta(minutes=1440)
                    }, os.getenv('SECRET_KEY')).decode('utf-8')
                }, 200
        return {'message': 'Login failed, check your username and password', **errors}, 400
