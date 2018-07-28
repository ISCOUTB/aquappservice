"""
    Operations regarding water bodies: adding,
    listing, modifying, deleting and calculating
    their ICAMpff value.
    
    All the files (excluding __init__.py) in this
    directory performs api operation according to
    their names using marshmallow to validate
    the input:
    https://marshmallow.readthedocs.io/en/latest/
"""

import requests  # Python 3 requests module: http://docs.python-requests.org/en/master/
from flask import request, abort
from flask_restplus import Namespace, Resource, reqparse
from .core.database import Database
from .core.swagger_models import water_body, node, string_array
from .core.marshmallow_models import NewWaterBodySchema
from .core.utils import token_required
from dateutil import parser as date_parser  # python-dateutil module: https://dateutil.readthedocs.io/en/stable/
from functools import reduce
from datetime import datetime

api = Namespace('water-bodies', description='Water bodies related operations')

# API schemas
water_body = api.schema_model('WaterBody', water_body)
node = api.schema_model('Node', node)
string_array = api.schema_model('StringArray', string_array)

@api.route('/add')
class AddWaterBody(Resource):
    @api.doc(summary='Add water bodies to the water bodies collection', security="apikey")
    @api.expect([water_body])
    @token_required
    def post(self):
        new_water_bodies, errors = NewWaterBodySchema(many=True).load(request.get_json() or {})
        if errors:
            new_water_bodies = [wb for wb in (set(range(len(new_water_bodies)) - set(errors.keys())))]
        if new_water_bodies:
            Database().add_water_bodies(new_water_bodies)
        return {
            'message': 
                ('Water bodies added successfully') if not errors else 
                    ('Some water bodies were excluded due to errrors' if new_water_bodies else 
                        'Error, no water body were added due to errors')
        }, 201 if new_water_bodies else 400


@api.route('/')
class WaterBody(Resource):
    @api.doc(summary='Get all the water bodies',
             description='Returns a collection of water bodies',
             responses={200: ('Water body collection', [water_body])})
    def get(self):
        """
        The water bodies are in a format that LeafletJS can
        interpret.
        """
        return [{**water_body, '_id': str(water_body['_id'])} for water_body in Database().get_water_bodies()]

@api.route('/<string:water_body_id>/nodes')
@api.param('water_body_id',
           description='Id of the water body to return',
           _in='path',
           required=True,
           type='string')
class WaterBodyNodes(Resource):
    @api.doc(summary='Get all nodes that analyze a given water body',
             description='Returns a collection of nodes',
             responses={200: ('Node collection', [node]),
                        404: 'Node type not found'})
    def get(self, water_body_id):
        return Database().get_water_body_nodes(water_body_id)


@api.route('/<string:water_body>/export-as-csv')
@api.param('water_body', description='ID of water body', _in='path',
           required=True, type='string')
@api.param('id_2', description='ID of node or water body', _in='query',
           required=False, type='string')
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
    def get(self, water_body):
        # There shoud be a better way to get the icampff without repeating code
        # but I have no time now.
        def icampffs(water_body_id, sd, ed):
            def icampff(node_id, date):
                sd = date_parser.parse("1900-01-01 00:00:00")
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
                last_date = max([(obj['data'][-1]['date'] if len(obj['data']) else date_parser.parse("1900-01-01 00:00:00")) for obj in d]) 
                d = [((obj['data'][-1]['value'] if obj['data'][-1]['date'] == last_date else -1) if len(obj['data']) else -1) for obj in d]
                
                # Checking if there's data for calculating the ICAMpff
                for value in d:
                    if value != -1:
                        break
                else:
                    abort(404)  # It's better to abort rather than giving useless data

                new_hash = hash(reduce(lambda x, y: str(x) + str(y), d))
                # Now we need to check the date of the cache in the water body
                # to see if it's current
                if Database().check_icampff_hash(water_body_id, node_id, new_hash):
                    return Database().get_icampff_cache(water_body_id, node_id)['icampff']

                # If there's no cache registered then the ICAMpff value is taken from the invemar api
                try:
                    new_icampff = requests.get("http://buritaca.invemar.org.co/ICAMWebService/calculate-icam-ae/od/{}/no3/{}/sst/{}/ctt/{}/ph/{}/po4/{}/dbo/{}/cla/{}".format(*d)).json()['value']
                except KeyError:
                    print('Error loading the icampff value from invemar!!!')
                    """
                        This approach is better and more transparent
                        with the user than just returning 0 when
                        we are unable to return the value from Invemar.
                    """
                    abort(404)
                # Once taken the ICAMpff from Invemar, the value is stored in the database
                Database().set_icampff_cache(water_body_id, node_id, new_hash, new_icampff)
                return new_icampff
            
            icampff_values = []

            try:
                for node in Database().get_water_body_nodes(water_body_id):
                    for variable in ["Dissolved Oxygen (DO)", "Nitrate (NO3)", "Total Suspended Solids (TSS)", "Thermotolerant Coliforms", "pH", "Phosphates (PO4)", "Biochemical Oxygen Demand (BOD)", "Chrolophyll A (CLA)"]:
                        for datum in Database().get_sensor_data(node, variable, start_date=sd, end_date=ed)["data"]:
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

        if args["id_2"] is None:
            """ Schema of each element of data
                {
                    "date": str(datetime.now()), <-- Beware that the dates are str not datetime.datetime objects!
                    "nodes": [],
                    "icampffs": [0],
                    "icampff_avg": 0
                }
            """
            data = icampffs(water_body,sd_1, ed_1)
            for datum in data:
                csv_data += str(datum["date"]) + "," + str(datum["icampff_avg"]) + "\n"
        else:
            nodes = Database().get_nodes()
            water_bodies = Database().get_water_bodies()

            if args["id_2"] in [str(node["_id"]) for node in nodes]:
                """ Schema of each element of data
                    {
                        "date": str(datetime.now()), <-- Beware that the dates are str not datetime.datetime objects!
                        "nodes": [],
                        "icampffs": [0],
                        "icampff_avg": 0
                    }
                """
                data_1 = icampffs(water_body, sd_1, ed_1)
                data_2 = Database().get_sensor_data(args["id_2"], args["variable_2"], sd_2, ed_2)

                for datum in data_1:
                    csv_data += str(datum["date"]) + "," + str(datum["icampff_avg"])  + ","
                    
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
                    csv_data += str(datum["date"]) + ",," + str(datum["value"]) + "\n"
            
            elif args["id_2"] in [str(water_body["_id"]) for water_body in water_bodies]:
                data_1 = icampffs(water_body, sd_1, ed_1)
                data_2 = icampffs(args["id_2"], sd_2, ed_2)
                """ Schema of each element of data_1 and data_2
                    {
                        "date": str(datetime.now()), <-- Beware that the dates are str not datetime.datetime objects!
                        "nodes": [],
                        "icampffs": [0],
                        "icampff_avg": 0
                    }
                """
                for datum in data_1:
                    csv_data += str(datum["date"]) + "," + str(datum["icampff_avg"]) + ","

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
                    csv_data += icam["date"] + ",," + str(icam["icampff_avg"]) + "\n"

        return csv_data, 200


@api.route('/<string:water_body_id>/icampff')
@api.param('water_body_id',
           description='Id of the water body',
           _in='path',
           required=True,
           type='string')
class WaterBodyICAMpff(Resource):
    @api.doc(summary='Get the ICAMpff value of a given water body',
             responses={200: 'Icampff value as an integer',
                        404: 'Node type not found'})
    def get(self, water_body_id):
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
            lastest_date = max([(obj['data'][-1]['date'] if len(obj['data']) else sd) for obj in d]) 
            d = [((obj['data'][-1]['value'] if obj['data'][-1]['date'] == lastest_date else -1) if len(obj['data']) else -1) for obj in d]
            
            # Checking if there's data for calculating the ICAMpff
            for value in d:
                if value != -1:
                    break
            else:
                abort(404)  # It's better to abort rather than giving useless data

            new_hash = hash(reduce(lambda x, y: str(x) + str(y), d))
            # Now we need to check the date of the cache in the water body
            # to see if it's current
            if Database().check_icampff_hash(water_body_id, node_id, new_hash):
                return Database().get_icampff_cache(water_body_id, node_id)['icampff']

            # If there's no cache registered then the ICAMpff value is taken from the invemar api
            try:
                new_icampff = requests.get("http://buritaca.invemar.org.co/ICAMWebService/calculate-icam-ae/od/{}/no3/{}/sst/{}/ctt/{}/ph/{}/po4/{}/dbo/{}/cla/{}".format(*d)).json()['value']
            except KeyError:
                print('Error loading the icampff value from invemar!!!')
                abort(404)
            # Once taken the ICAMpff from Invemar, the value is stored in the database
            Database().set_icampff_cache(water_body_id, node_id, new_hash, new_icampff)
            return new_icampff
        
        icampff_values = []

        try:
            for node in Database().get_water_body_nodes(water_body_id):
                for variable in ["Dissolved Oxygen (DO)", "Nitrate (NO3)", "Total Suspended Solids (TSS)", "Thermotolerant Coliforms", "pH", "Phosphates (PO4)", "Biochemical Oxygen Demand (BOD)", "Chrolophyll A (CLA)"]:
                    for icam in Database().get_sensor_data(node, variable, start_date=sd, end_date=datetime.now())["data"]:
                        for i in range(len(icampff_values)):
                            if icampff_values[i]["date"] == str(icam["date"]):
                                if node not in icampff_values[i]["nodes"]:
                                    icampff_values[i]["nodes"].append(node)
                                    icampff_values[i]["icampffs"].append(icampff(node, icam["date"]))
                                    icampff_values[i]["icampff_avg"] = sum(icampff_values[i]["icampffs"]) / float(len(icampff_values[i]["icampffs"]))
                                break
                        else:
                            ic = icampff(node, icam["date"])
                            icampff_values.append({
                                "date": str(icam["date"]),
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


@api.route('/<string:water_body>/available-dates')
@api.param('water_body', description='Id of the water body', _in='path', required=True, type='string')
class ValidDates(Resource):
    @api.doc(summary='Get all the water bodies',
             description='Returns a collection of water bodies',
             responses={200: ('Water body collection', [water_body])})
    def get(self, water_body):
        
        def icampffs(water_body_id):
            def icampff(node_id, date):
                sd = date_parser.parse("1900-01-01 00:00:00")
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
                last_date = max([(obj['data'][-1]['date'] if len(obj['data']) else date_parser.parse("1900-01-01 00:00:00")) for obj in d]) 
                d = [((obj['data'][-1]['value'] if obj['data'][-1]['date'] == last_date else -1) if len(obj['data']) else -1) for obj in d]
                
                # Checking if there's data for calculating the ICAMpff
                for value in d:
                    if value != -1:
                        break
                else:
                    abort(404)  # It's better to abort rather than giving useless data

                new_hash = hash(reduce(lambda x, y: str(x) + str(y), d))
                # Now we need to check the date of the cache in the water body
                # to see if it's current
                if Database().check_icampff_hash(water_body_id, node_id, new_hash):
                    return Database().get_icampff_cache(water_body_id, node_id)['icampff']

                # If there's no cache registered then the ICAMpff value is taken from the invemar api
                try:
                    new_icampff = requests.get("http://buritaca.invemar.org.co/ICAMWebService/calculate-icam-ae/od/{}/no3/{}/sst/{}/ctt/{}/ph/{}/po4/{}/dbo/{}/cla/{}".format(*d)).json()['value']
                except KeyError:
                    print('Error loading the icampff value from invemar!!!')
                    """
                        This approach is better and more transparent
                        with the user than just returning 0 when
                        we are unable to return the value from Invemar.
                    """
                    abort(404)
                # Once taken the ICAMpff from Invemar, the value is stored in the database
                Database().set_icampff_cache(water_body_id, node_id, new_hash, new_icampff)
                return new_icampff
            
            icampff_values = []

            try:
                for node in Database().get_water_body_nodes(water_body_id):
                    for variable in ["Dissolved Oxygen (DO)", "Nitrate (NO3)", "Total Suspended Solids (TSS)", "Thermotolerant Coliforms", "pH", "Phosphates (PO4)", "Biochemical Oxygen Demand (BOD)", "Chrolophyll A (CLA)"]:
                        for icam in Database().get_sensor_data(node, variable, start_date=date_parser.parse("1900-01-01 00:00:00"), end_date=datetime.now())["data"]:
                            for i in range(len(icampff_values)):
                                if icampff_values[i]["date"] == str(icam["date"]):
                                    if node not in icampff_values[i]["nodes"]:
                                        icampff_values[i]["nodes"].append(node)
                                        icampff_values[i]["icampffs"].append(icampff(node, icam["date"]))
                                        icampff_values[i]["icampff_avg"] = sum(icampff_values[i]["icampffs"]) / float(len(icampff_values[i]["icampffs"]))
                                    break
                            else:
                                ic = icampff(node, icam["date"])
                                icampff_values.append({
                                    "date": str(icam["date"]),
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

        return [str(date.month) + "/" + str(date.day) + "/" + str(date.year) for date in [date_parser.parse(icam["date"]) for icam in icampffs(water_body)]]

@api.route('/<string:water_body_id>/add-node')
@api.param('node_id', description='Node id of the node to add', _in='query', required=True, type='string')
@api.param('water_body_id', description='Id of the water body', _in='path', required=True, type='string')
class AddNodeToWaterBody(Resource):
    @api.doc(summary='Update the node list of a water body', 
             responses={200: ('Water body updated successfully')},
             security="apikey")
    @token_required
    def post(self, water_body_id):
        parser = reqparse.RequestParser()
        parser.add_argument('node_id', type=str, required=True, location='args')
        args = parser.parse_args()
        if Database().add_node_to_water_body(args['node_id'], water_body_id):
            return {'message': 'water body updated successfully'}, 200
        else:
            return {'message': 'Error, maybe the node or the water body doesn\'t exist, the node is already associated to the water body or the node is not of type Water Quality'}, 400


@api.route('/<string:water_body_id>/remove_nodes')
@api.param('water_body_id', description='Id of the water body', _in='path', required=True, type='string')
class RemoveNodesFromWaterBody(Resource):
    @api.doc(summary='Update the node list of a water body', 
             responses={200: ('Water body updated successfully')}, 
             security="apikey")
    @api.expect(string_array)
    @token_required
    def put(self, water_body_id):
        args = request.get_json()
        if type(args) != list:  # Making a marshmallow schema for this is a waste unless we need to do the same in another endpoint
            return {'message': 'Wrong data format'}, 400
        if Database().remove_nodes_from_water_body(water_body_id, args):
            return {'message': 'Water body updated successfully'}, 200
        return {'message': 'Wrong data format or water body ID'}, 400
