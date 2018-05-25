from flask import request, abort
from flask_restplus import Namespace, Resource, reqparse
from .core.database import Database
from .core.marshmallow_models import NodeSchema, NewNodeSchema, EditNodeSchema, DatumSchema, NodeTypeSchema, EditNodeTypeSchema, NewNodeTypeSchema
from .core.swagger_models import node, data, datum, node_type, sensor, link, date_array, new_node, new_datum
from .core.utils import token_required
from dateutil import parser as date_parser
from marshmallow import Schema

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


@api.route('/types/add')
class AddNodeType(Resource):
    @api.doc(summary='Add new node types',
             description='Add new node types',
             responses={201: 'Node type added successfully'},
             security='apikey')
    @api.expect([node_type])
    @token_required
    def post(self):
        node_types, errors = NodeTypeSchema(many=True).load(request.get_json() or {})
        if errors:
            node_types = [node_types[i] for i in (set(range(len(node_types))) - set(errors.keys()))]
        Database().add_node_types(node_types)
        return {
            'message':
                ('Node types added successfully') if not errors else 
                    ('Some node types were not added due to errors, check your input.' if node_types else 
                        'Error, invalid input'), 
            **errors
        }, 201 if node_types else 400


@api.route('/types')
class NodeTypes(Resource):
    @api.doc(summary='Get all node types',
             description='Returns a collection of node types',
             responses={200: ('Node type collection', [node_type])})
    def get(self):
        return [{**ndt, '_id': str(ndt['_id'])}
                for ndt in Database().get_node_types()]


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


@api.route('/<string:node_type_id>/edit')
@api.param('node_id',
           description='Id of the node type you are going to edit',
           _in='path',
           required=True,
           type='string')
class EditNodeType(Resource):
    @api.doc(description='Edit a node type',
             responses={200: 'Node type updated'},
             security='apikey')
    @api.expect(new_node)
    @token_required
    def put(self, node_id):
        new_node_data, errors = EditNodeTypeSchema().load(request.get_json() or {})
        if errors:
            return {'message': 'ERROR: failed to edit the node, check input', **errors}, 400
        if new_node_data:
            Database().edit_node(node_id, new_node_data)
            return {'message': 'Node edited successfully'}, 200
        return {'message': "There is no data to update the node with"}, 400

# MISSING DELETE FOR NODE-TYPES


@api.route('/add')
class AddNode(Resource):
    @api.doc(description='Add new nodes',
             responses={201: 'Node added successfully'},
             security="apikey")
    @api.expect([new_node])
    @token_required
    def post(self):
        # The result of the load() method is of type UnMarshallResult, it's an array with two elements, the first is the
        # deserialized object and the second the errors.
        nodes, errors = NewNodeSchema(many=True).load(request.get_json() or {})
        if errors:  # There are validation errors, the nodes without valid data are 
            safe_nodes = [nodes[i] for i in (set(range(len(nodes))) - set(errors.keys()))]
            if safe_nodes:
                Database().add_nodes(safe_nodes)
            return {'message': 'ERROR: failed to create the nodes, check input' if not safe_nodes else 'WARNING: some nodes were not added, check the errors attribute in this response', **errors}, 400
        Database().add_nodes(nodes)
        return {'message': 'Nodes created successfully'}, 201


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
class NodeById(Resource):
    @api.doc(summary='Get a node by ID', description='Returns a single node',
             responses={200: ('A node object', node), 404: 'Node not found'})
    def get(self, node_id):
        return [{**nd, '_id': str(nd['_id'])}
                for nd in Database().get_node(node_id)][0]


@api.route('/<string:node_id>/data')
@api.param('node_id', description='Unique node identifier to filter by',
           _in='path', required=True, type='string')
@api.param('start_date',
           description='Initial date to filter by', _in='query',
           required=True, type='string')
@api.param('end_date', description='End date to filter by',
           _in='query', required=False, type='string')
@api.param('variable', description='Sensor',
           _in='query', required=False, type='string')
class NodeData(Resource):
    @api.doc(summary='Get node data', description='Get the node data according to the provided parameters',
             responses={200: ('Filtered data', data)})
    def get(self, node_id):
        parser = reqparse.RequestParser(bundle_errors=True)
        parser.add_argument('start_date', type=str, required=True, location='args')
        parser.add_argument('end_date', type=str, required=True, location='args')
        parser.add_argument('variable', type=str, required=True, location='args')
        args = parser.parse_args()
        try:
            sd = date_parser.parse(args["start_date"])
            ed = date_parser.parse(args["end_date"])
        except ValueError:
            return {'message': 'The dates are in the wrong format!, start_date={}, end_date={}'.format(args["start_date"], args["end_date"])}, 400
        return Database().get_sensor_data(node_id, args['variable'], sd, ed), 200


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
        return Database().get_available_dates(node_id, args['variable'])


@api.route('/<string:node_id>/edit')
@api.param('node_id',
           description='Id of the node you are going to edit',
           _in='path',
           required=True,
           type='string')
class EditNode(Resource):
    @api.doc(description='Edit a node',
             responses={200: 'Node updated'},
             security='apikey')
    @api.expect(new_node)
    @token_required
    def put(self, node_id):
        new_node_data, errors = EditNodeSchema().load(request.get_json() or {})
        if errors:
            return {'message': 'ERROR: failed to edit the node, check input', **errors}, 400
        if new_node_data:
            Database().edit_node(node_id, new_node_data)
        return {
            'message': 
                ('Node edited successfully') if not errors else 
                    ('Some fields were not updated due to errors' if new_node_data else 
                        'There is no data to update the node with')
        }, 201 if new_node_data else 400


@api.route('<string:node_id>/add-sensor-data')
@api.param('variable', description='Sensor',
           _in='query', required=True, type='string')
class AddNodeSensorData(Resource):
    @api.doc(description='Register new meassures of the sensor of a node',
             responses={201: 'Datum created'},
             security='apikey')
    @api.expect([new_datum])
    @token_required
    def post(self, node_id):
        variable = reqparse.RequestParser().add_argument('variable', type=str, required=True, location='args').parse_args()['variable']
        data, errors = DatumSchema(many=True).load(request.get_json() or {})
        if errors:
            data = [data[i] for i in (set(range(len(data))) - set(errors.keys()))]
        Database().add_sensor_data(node_id, variable, data)
        return {
                'message': 
                    ('Data added successfully') if not errors else 
                        ("Some data could'nt be added due to errors, check error report." 
                            if data else "Failed to add data, check error report")
        }, 200 if data else 400


@api.route('/<string:node_id>/delete')
@api.param('node_id', description='ID of node to return', _in='path',
           required=True, type='string')
class DeleteNode(Resource):
    @api.doc(summary='Delete a node by ID', description='Deletes a single node',
             responses={200: ('A node object', node), 404: 'Node not found'},
             security='apikey')
    @token_required
    def delete(self, node_id):
        if Database().delete_node(node_id):
            return {'message': 'node deleted successfully'}, 200
        else:
            return {'message': 'node not found'}, 404
