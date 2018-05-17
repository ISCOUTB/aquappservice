from flask import request, abort
from flask_restplus import Namespace, Resource, reqparse
from .core.database import Database
from .core.swagger_models import node, data, datum, node_type, sensor, link, date_array, new_node, new_datum
from dateutil import parser as date_parser

api = Namespace('nodes', description='Node related operations')

# API schemas
node = api.schema_model('Node', node)
new_node = api.schema_model('InputNode', new_node)
data = api.schema_model('Data', data)
datum = api.schema_model('Datum', datum)
new_datum = api.schema_model('InputDatum', new_datum)
node_type = api.schema_model('Node-Type', node_type)
sensor = api.schema_model('Sensor', sensor)
link = api.schema_model('Link', link)
date_array = api.schema_model('DateArray', date_array)


@api.route('/types')
class NodeTypes(Resource):
    @api.doc(summary='Get all node types',
             description='Returns a collection of node types',
             responses={200: ('Node type collection', [node_type])})
    def get(self):
        return [{**ndt, '_id': str(ndt['_id'])}
                for ndt in Database().get_node_types()]


@api.route('/types/add')
class AddNodeType(Resource):
    @api.doc(summary='Add new node types',
             description='Add new node types',
             responses={201: 'Node type added successfully'},
             security=['apikey', 'oauth2'])
    @api.expect([node_type], validate=True)
    def post(self):
        print(request.get_json())
        return 201


@api.route('/add')
class AddNode(Resource):
    @api.doc(description='Add new node',
             responses={201: 'Node added successfully'})
             # security=['apikey', 'oauth2'])
    @api.expect(new_node)
    def post(self):
        args = request.get_json()
        if 'name' in args and 'location' in args and 'coordinates' in args and 'status' in args and 'node_type_id' in args:
            if Database().add_node(args['name'], args['location'], args['coordinates'], args['status'], args['node_type_id']):
                return {'message': 'Node created successfully'}, 201
        return {'message': 'failed to create the node, check input'}, 400


@api.route('/<string:node_id>/edit')
@api.param('node_id',
           description='Id of the node you are going to edit',
           _in='path',
           required=True,
           type='string')
class EditNode(Resource):
    @api.doc(description='Edit a node',
             responses={200: 'Node updated'})
             # security=['apikey', 'oauth2'])
    @api.expect(new_node)
    def put(self, node_id):
        args = request.get_json()
        if 'name' in args and 'location' in args and 'coordinates' in args and 'status' in args and 'node_type_id' in args:
            if Database().edit_node(node_id, args['name'], args['location'], args['coordinates'], args['status'], args['node_type_id']):
                return {'message': 'Node edited successfully'}, 201
        return {'message': 'failed to update the node, check input'}, 400

""" FOR DEBUGGING PURPOSES ONLY
@api.route('<string:node_id>/all-data')
class GetNodeDataDefinitions(Resource):
    @api.doc(description='Data collection',
             responses={200: 'Get all the sensor data'})
             # security=['apikey', 'oauth2'])
    def get(self, node_id):
        return [{**data, '_id': str(data['_id'])} for data in Database().get_all_sensor_data(node_id)]
# """

@api.route('<string:node_id>/add-sensor-data')
@api.param('variable',
           description='Sensor to add',
           _in='query',
           required=True,
           type='string')
@api.param('node_id',
           description='Id of the node you are adding the sensor data definition to',
           _in='path',
           required=True,
           type='string')
class AddNodeSensorData(Resource):
    @api.doc(description='Add a sensor data definition to a node',
             responses={201: 'Sensor data definition added successfully'})
             # security=['apikey', 'oauth2'])
    def post(self, node_id):
        parser = reqparse.RequestParser()
        parser.add_argument('variable', location="args", required=True, type=str)
        args = parser.parse_args()
        if Database().add_sensor_data(node_id, args['variable']):
            return {'message': 'Sensor data added successfully'}, 201
        else:
            return {'message': 'Error creating the sensor data, verify your input'}, 400


@api.route('<string:node_id>/add-sensor-datum')
class AddNodeSensorDatum(Resource):
    @api.doc(description='Register a new meassure to the sensor of a node',
             responses={201: 'Datum created'})
             # security=['apikey', 'oauth2'])
    @api.expect(new_datum)
    def post(self, node_id):
        datum = request.get_json()
        if Database().add_datum(node_id, datum):
            return {'message': 'Sensor datum added successfully'}, 201
        else:
            return {'message': 'Error creating the datum, verify your input'}, 400


@api.route('/types/<string:node_type_id>')
@api.param('node_type_id',
           description='Id of node type to return',
           _in='path',
           required=True,
           type='string')
class NodeTypeById(Resource):
    @api.doc(summary='Find node type by ID',
             description='Returns a single node type',
             responses={200: ('Returns a single node type', node_type),
                        404: 'Node type not found'})
    def get(self, node_type_id):
        return [{**ndt, '_id': str(ndt['_id'])}
                for ndt in Database().get_node_type(node_type_id)][0]


@api.route('/types/<string:node_type_id>/nodes')
@api.param('node_type_id',
           description='Id of node type to return',
           _in='path',
           required=True,
           type='string')
class NodesByNodeType(Resource):
    @api.doc(summary='Get all nodes of a given node type',
             description='Returns all nodes of a node type',
             responses={200: ('Node collection', [node]),
                        404: 'Node type not found'})
    def get(self, node_type_id):
        return [{**nd, '_id': str(nd['_id'])}
                for nd in Database().get_nodes_by_node_type_id(node_type_id)]


@api.route('/')
class Nodes(Resource):
    @api.doc(summary='Get all nodes',
             description='Returns all nodes',
             responses={200: ('Node collection', [node])})
    def get(self):
        return [{**nd, '_id': str(nd['_id'])}
                for nd in Database().get_nodes()]


@api.route('/<string:node_id>')
@api.param('node_id', description='ID of node to return', _in='path',
           required=True, type='string')
class Node(Resource):
    @api.doc(summary='Get a node by ID', description='Returns a single node',
             responses={200: ('A node object', node), 404: 'Node not found'})
    def get(self, node_id):
        return [{**nd, '_id': str(nd['_id'])}
                for nd in Database().get_node(node_id)][0]


@api.route('/<string:node_id>/delete')
@api.param('node_id', description='ID of node to return', _in='path',
           required=True, type='string')
class DeleteNode(Resource):
    @api.doc(summary='Get a node by ID', description='Returns a single node',
             responses={200: ('A node object', node), 404: 'Node not found'})
    def delete(self, node_id):
        if Database().delete_node(node_id):
            return {'message': 'node deleted successfully'}, 200
        else:
            return {'message': 'node not found'}, 404


@api.route('/<string:node_id>/data')
@api.param('node_id', description='Unique node identifier to filter by',
           _in='path', required=True, type='string')
@api.param('start_date',
           description='Initial date to filter by', _in='query',
           required=True, type='string')
@api.param('end_date', description='End date to filter by',
           _in='query', required=True, type='string')
@api.param('variable', description='Sensor',
           _in='query', required=True, type='string')
class NodeData(Resource):
    @api.doc(summary='Get node data', description='Get the node data according to the provided parameters',
             responses={200: ('Filtered data', data)})
    def get(self, node_id):
        parser = reqparse.RequestParser(bundle_errors=True)
        parser.add_argument('start_date', type=str, required=True, location='args')
        parser.add_argument('end_date', type=str, required=True, location='args')
        parser.add_argument('variable', type=str, required=True, location='args')
        args = parser.parse_args()
        return Database().get_sensor_data(node_id, args['variable'], start_date=args['start_date'], end_date=args['end_date'])


@api.route('/<string:node_id>/available-dates')
@api.param('node_id', description='Unique node identifier to filter by',
           _in='path', required=True, type='string')
@api.param('variable', description='Sensor',
           _in='query', required=True, type='string')
class ValidRanges(Resource):
    @api.doc(summary='Get the dates in which there were collected data',
             responses={200: ('Dates', data)})
    def get(self, node_id):
        parser = reqparse.RequestParser(bundle_errors=True)
        parser.add_argument('variable', type=str, required=True, location='args')
        args = parser.parse_args()

        return Database().get_sensor_data(node_id, args['variable'])
