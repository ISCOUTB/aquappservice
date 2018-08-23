"""
    Operations regarding nodes: adding,
    listing, modifying, and deleting.
    
    All the files (excluding __init__.py) in this
    directory performs api operation according to
    their names using marshmallow to validate
    the input:
    https://marshmallow.readthedocs.io/en/latest/
"""

from flask import request, abort
from flask_restplus import Namespace, Resource, reqparse
from .core.database import Database
from .core.marshmallow_models import NodeSchema, NewNodeSchema, EditNodeSchema, DatumSchema, NodeTypeSchema, EditNodeTypeSchema, NewNodeTypeSchema
from .core.swagger_models import node, data, datum, node_type, sensor, link, date_array, new_node, new_datum
from .core.utils import token_required
from dateutil import parser as date_parser
from datetime import datetime
from marshmallow import Schema
from functools import reduce

api = Namespace('nodes', description='Node related operations')

# Swagger schemas
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
        node_types, errors = NodeTypeSchema(many=True).load(request.get_json(force=True) or {})
        if errors:
            # The node_types that were created with errors are removed
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

# MISSING DELETE AND EDIT FOR NODE-TYPES


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
        nodes, errors = NewNodeSchema(many=True).load(request.get_json(force=True) or {})
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


@api.route('/<string:node_id>/export-as-csv')
@api.param('node_id', description='ID of node to return', _in='path',
           required=True, type='string')
@api.param('id_2', description='ID of node or water body', _in='query',
           required=False, type='string')
@api.param('variable_1', description='sensor variable', _in='query',
           required=True, type='string')
@api.param('variable_2', description='sensor variable (used if id_2 is a node id)', _in='query',
           required=False, type='string')
@api.param('start_date_1', description='Start date for the measure', _in='query',
           required=True, type='string')
@api.param('start_date_2', description='Start date for the measure', _in='query',
           required=False, type='string')
@api.param('end_date_1', description='End date for the measure', _in='query',
           required=True, type='string')
@api.param('end_date_2', description='End date for the measure', _in='query',
           required=False, type='string')
class ExportAsCSV(Resource):
    @api.doc(summary='')
    def get(self, node_id):
        # There shoud be a better way to get the icampff without repeating code
        # but I have no time now.
        def icampffs(water_body_id):
            sd = date_parser.parse("1900-01-01 00:00:00")
            def icampff(node_id, date):
                d = [
                    Database().get_sensor_data(node_id, "Dissolved Oxygen (DO)", start_date=sd, end_date=date),
                    Database().get_sensor_data(node_id, "Nitrate (NO3)", start_date=sd, end_date=date),
                    Database().get_sensor_data(node_id, "Total Suspended Solids (TSS)", start_date=sd, end_date=date),
                    Database().get_sensor_data(node_id, "Thermotolerant Coliforms", start_date=sd, end_date=date),
                    Database().get_sensor_data(node_id, "pH", start_date=sd, end_date=date),
                    Database().get_sensor_data(node_id, "Phosphates (PO4)", start_date=sd, end_date=date),
                    Database().get_sensor_data(node_id, "Biochemical Oxygen Demand (BOD)", start_date=sd, end_date=date),
                    Database().get_sensor_data(node_id, "Chrolophyll A (CLA)", start_date=sd, end_date=date)
                ]
                # This two lines ensure that only the last meassurements are taken into account.
                latest_date = max([(obj['data'][-1]['date'] if len(obj['data']) else sd) for obj in d]) 
                d = [((obj['data'][-1]['value'] if obj['data'][-1]['date'] == latest_date else -1) if len(obj['data']) else -1) for obj in d]
                
                # Checking if there's data for calculating the ICAMpff
                for value in d:
                    if value != -1:
                        break
                else:
                    abort(404)  # It's better to abort rather than giving useless data

                # I know, I know, it's not a hash, it was a hash but I don't have a
                # creative name for this thing.
                new_hash = str(d)
                # Now we need to check the date of the cache in the water body
                # to see if it's current
                if Database().check_icampff_hash(water_body_id, node_id, new_hash, latest_date):
                    return Database().get_icampff_cache(water_body_id, node_id, latest_date)['icampff']

                # If there's no cache registered then the ICAMpff value is taken from the invemar api
                try:
                    new_icampff = requests.get("http://buritaca.invemar.org.co/ICAMWebService/calculate-icam-ae/od/{}/no3/{}/sst/{}/ctt/{}/ph/{}/po4/{}/dbo/{}/cla/{}".format(*d)).json()['value']
                except KeyError:
                    abort(404)
                except requests.exceptions.ConnectionError:
                    abort(404)
                except requests.exceptions.ConnectTimeout:
                    abort(404)
                except requests.exceptions.HTTPError:
                    abort(404)
                # Once taken the ICAMpff from Invemar, the value is stored in the database
                Database().set_icampff_cache(water_body_id, node_id, new_hash, new_icampff, latest_date)
                return new_icampff
            
            icampff_values = []

            try:
                for node in Database().get_water_body_nodes(water_body_id):
                    for variable in ["Dissolved Oxygen (DO)", "Nitrate (NO3)", "Total Suspended Solids (TSS)", "Thermotolerant Coliforms", "pH", "Phosphates (PO4)", "Biochemical Oxygen Demand (BOD)", "Chrolophyll A (CLA)"]:
                        for datum in Database().get_sensor_data(node, variable, start_date=date_parser.parse("1900-01-01 00:00:00"), end_date=datetime.now())["data"]:
                            for i in range(len(icampff_values)):
                                if icampff_values[i]["date"] == str(datum["date"]):
                                    if node not in icampff_values[i]["nodes"]:
                                        icampff_values[i]["nodes"].append(node)
                                        icampff_values[i]["icampffs"].append(icampff(node, datum["date"]))
                                        icampff_values[i]["icampff_avg"] = sum(icampff_values[i]["icampffs"]) / float(len(icampff_values[i]["icampffs"]))
                                    break
                            else:
                                ic = icampff(node, datum["date"])
                                icampff_values.append({
                                    "date": str(datum["date"]),
                                    "nodes": [node],
                                    "icampffs": [ic],
                                    "icampff_avg": ic
                                })
            
            except StopIteration:
                return {"message": "water body not found"}, 400

            return icampff_values if icampff_values else [
                {
                    "date": str(datetime.now()),
                    "nodes": [],
                    "icampffs": [0],
                    "icampff_avg": 0
                }
            ]

        parser = reqparse.RequestParser(bundle_errors=True)
        parser.add_argument('start_date_1', type=str, required=True, location='args')
        parser.add_argument('start_date_2', type=str, required=False, location='args')
        parser.add_argument('end_date_1', type=str, required=True, location='args')
        parser.add_argument('end_date_2', type=str, required=False, location='args')
        parser.add_argument('id_2', type=str, required=False, location='args')
        parser.add_argument('variable_1', type=str, required=True, location='args')
        parser.add_argument('variable_2', type=str, required=False, location='args')
        args = parser.parse_args()

        try:
            sd_1 = date_parser.parse(args["start_date_1"]).replace(tzinfo=None)
            ed_1 = date_parser.parse(args["end_date_1"]).replace(tzinfo=None)
            if args["id_2"] is not None:
                sd_2 = date_parser.parse(args["start_date_2"]).replace(tzinfo=None)
                ed_2 = date_parser.parse(args["end_date_2"]).replace(tzinfo=None)
        except ValueError:
            return {'message': 'The dates are in the wrong format!'}, 400
        except KeyError:
            return {'message': 'start_date_2, end_date_2 are missing'}, 400
        
        # csv_data = "Date," + args["variable_1"] + ("," + args["variable_2"] if args["variable_2"] is not None else "") + "\n"
        csv_data = ""
        min_date = datetime.utcnow()
        max_date = date_parser.parse("1900-01-01 00:00:00")

        if args["id_2"] is None:
            data = Database().get_sensor_data(node_id, args["variable_1"], sd_1, ed_1)
            for datum in data["data"]:
                min_date = datum["date"] if datum["date"] < min_date else min_date
                max_date = datum["date"] if datum["date"] > max_date else max_date
                csv_data += str(datum["date"]) + "," + str(datum["value"]) + "\n"
        else:
            nodes = Database().get_nodes()
            water_bodies = Database().get_water_bodies()

            if args["id_2"] in [str(node["_id"]) for node in nodes]:
                data_1 = Database().get_sensor_data(node_id, args["variable_1"], sd_1, ed_1)
                data_2 = Database().get_sensor_data(args["id_2"], args["variable_2"], sd_2, ed_2)

                for datum in data_1["data"]:
                    min_date = datum["date"] if datum["date"] < min_date else min_date
                    max_date = datum["date"] if datum["date"] > max_date else max_date
                    csv_data += str(datum["date"]) + "," + str(datum["value"])  + ","
                    
                    found = False
                    for i in range(len(data_2["data"])):
                        if data_2["data"][i]["date"] == datum["date"]:
                            found = True
                            csv_data += str(data_2["data"][i]["value"])
                            break

                    if found:
                        del data_2["data"][i]

                    csv_data += "\n"
                
                for datum in data_2["data"]:
                    min_date = datum["date"] if datum["date"] < min_date else min_date
                    max_date = datum["date"] if datum["date"] > max_date else max_date
                    csv_data += str(datum["date"]) + ",," + str(datum["value"]) + "\n"
            
            elif args["id_2"] in [str(water_body["_id"]) for water_body in water_bodies]:
                data_1 = Database().get_sensor_data(node_id, args["variable_1"], sd_1, ed_1)
                data_2 = icampffs(args["id_2"])
                """ Schema of each element of data_2
                    {
                        "date": str(datetime.now()), <-- Beware that the dates are str not datetime.datetime objects!
                        "nodes": [],
                        "icampffs": [0],
                        "icampff_avg": 0
                    }
                """
                for datum in data_1["data"]:
                    min_date = datum["date"] if datum["date"] < min_date else min_date
                    max_date = datum["date"] if datum["date"] > max_date else max_date
                    csv_data += str(datum["date"]) + "," + str(datum["value"]) + ","

                    found = False

                    for i in range(len(data_2)):
                        if data_2[i]["date"] == str(datum["date"]):
                            found = True
                            csv_data += str(data_2[i]["icampff_avg"])
                            break

                    if found:
                        del data_2[i]

                    csv_data += "\n"
                
                for icam in data_2:
                    min_date = icam["date"] if icam["date"] < min_date else min_date
                    max_date = icam["date"] if icam["date"] > max_date else max_date
                    csv_data += icam["date"] + ",," + str(icam["icampff_avg"]) + "\n"

        return {
                    "csv": csv_data,
                    "minDate": str(min_date),
                    "maxDate": str(max_date)
                }, 200


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
        sensor_data = Database().get_sensor_data(node_id, args['variable'], sd, ed) or {'variable': args['variable'], 'node_id': node_id, 'data': []}
        return {
            'variable': sensor_data['variable'], 
            'node_id': sensor_data['node_id'], 
            'data': [{**datum, 'date': str(datum['date'])} for datum in sensor_data['data']]
        }, 200


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
        new_node_data, errors = EditNodeSchema().load(request.get_json(force=True) or {})
        if new_node_data and new_node_data:
            if not Database().edit_node(node_id, new_node_data):
                return {'message': 'ERROR: Node not found!', **errors}, 404
        return {
            'message': 
                ('Node edited successfully') if not errors and new_node_data else 
                    ('Some fields were not updated due to errors' if new_node_data else 
                        'There is no data to update the node with'),
            **errors
        }, 200 if new_node_data else 400  # 200 HTTP code makes more sense since we're not creating a new node


@api.route('/<string:node_id>/add-sensor-data')
class AddNodeSensorData(Resource):
    @api.doc(description='Register new meassures of the sensor of a node',
             responses={201: 'Datum created'},
             security='apikey')
    @api.expect([new_datum])
    @token_required
    def post(self, node_id):
        # variable = reqparse.RequestParser().add_argument('variable', type=str, required=True, location='args').parse_args()['variable']
        data, errors = DatumSchema(many=True).load(request.get_json(force=True) or {})
        if errors:
            data = [data[i] for i in (set(range(len(data))) - set(errors.keys()))]
        Database().add_sensor_data(node_id, data)
        return {
            'message': 
                ('Data added successfully') if not errors else 
                    ("Some data couldn't be added due to errors, check error report." 
                        if data else "Failed to add data, check error report")
        , **errors}, 200 if data else 400


@api.route('/<string:node_id>/delete')
@api.param('node_id', description='ID of node to return', _in='path',
           required=True, type='string')
class DeleteNode(Resource):
    @api.doc(summary='Delete a node by ID', description='Deletes a single node',
             responses={200: 'Node deleted successfully', 404: 'Node not found'},
             security='apikey')
    @token_required
    def delete(self, node_id):
        if Database().delete_node(node_id):
            return {'message': 'Node deleted successfully'}, 200
        else:
            return {'message': 'Node not found'}, 404


@api.route('/<string:node_id>/delete-all-data')
@api.param('node_id', description='ID of node to return', _in='path',
           required=True, type='string')
class DeleteAllNodeData(Resource):
    @api.doc(summary='Delete all the node data',
             responses={200: 'Node data deleted successfully', 404: 'Node not found'},
             security='apikey')
    @token_required
    def delete(self, node_id):
        if Database().delete_all_node_data(node_id):
            return {'message': 'Node data deleted successfully'}, 200
        else:
            return {'message': 'Node not found'}, 404