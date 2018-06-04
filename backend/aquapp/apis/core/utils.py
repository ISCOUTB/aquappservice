"""
    This module is for utilities that can be used in all the
    apis
"""

import jwt
import os
from flask import request
from functools import wraps

"""
    Decorator function that checks if the token stored in the
    'API-KEY' field in the request header is valid and it's
    not expired.
    We use pyjwt to use JSON Web Tokens:
    https://pyjwt.readthedocs.io/en/latest/
"""
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
