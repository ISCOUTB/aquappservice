from flask import request, make_response
from flask_restplus import Namespace, Resource
from .database import Database
from .authorizations import http_basic

authorizations = {**http_basic}

api = Namespace("login", description="Login related operations",
                security=authorizations)

user = api.schema_model("User", {
    "type": "object",
    "properties": {
        "username": {
            "type": "string",
            "description": "The user's name",
            "example": "admin"
        },
        "password": {
            "type": "string",
            "descripion": "The user's password",
            "example": "12345"
        }
    }
})


@api.route("/login")
class Login(Resource):
    @api.doc(security=[{'basicAuth': ['read', 'write']}])
    def post(self):
        if request.authorization:
            user = Database().get_user(
                {"username": request.authorization.username,
                 "passowrd": request.authorization.password
                 })
            if user:
                pass
        return make_response('We could not verify your identity!', 401, {'WWW-Authenticate': 'Basic realm="Login required"'})
