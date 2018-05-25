import jwt
import os
from flask import request
from functools import wraps

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers['API-KEY'] if 'API-KEY' in request.headers else ""
        if not token:
            return {
                'message': 'Token is missing, log in using your credentials at /login to get a token'
            }, 401
        try:
            jwt.decode(token, os.getenv('SECRET_KEY'))
        except jwt.InvalidTokenError:
            return {
                'message': 'Invalid token, log in using your credentials at /login to get a token'
            }, 401
        return f(*args, **kwargs)
    return decorated
