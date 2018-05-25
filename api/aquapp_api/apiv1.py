from flask import Blueprint
from flask_restplus import Api, Resource, Swagger

from .apis.nodes import api as nodes
from .apis.water_bodies import api as water_bodies
from .apis.login import api as login
from .apis.core.authorizations import auth

blueprint = Blueprint('api', __name__, url_prefix='/api/v1')

api = Api(blueprint, title='AquAppAPI', version='1.0.0',
          description='API for AquApp clients', authorizations=auth)

api.add_namespace(nodes, path='/nodes')
api.add_namespace(water_bodies, path='/water-bodies')
api.add_namespace(login, path='/login')


@api.route('/schema/')
class ApiSchema(Resource):
    _api_schema_cache = None

    @api.doc(summary='Api schema in json format',
             description='Schema of Api v1 as json')
    def get(self):
        if ApiSchema._api_schema_cache:
            return ApiSchema._api_schema_cache
        ApiSchema._api_schema_cache = Swagger(api)
        ApiSchema._api_schema_cache.as_dict()

        for model_to_be_added in filter(lambda model: model not in ApiSchema._api_schema_cache._registered_models.keys(), api.models.keys()):
            ApiSchema._api_schema_cache.register_model(api.models[model_to_be_added])

        ApiSchema._api_schema_cache = ApiSchema._api_schema_cache.as_dict()
        return ApiSchema._api_schema_cache
