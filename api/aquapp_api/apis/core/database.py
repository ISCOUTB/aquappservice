import pymongo
import json
import os
from datetime import datetime
from dateutil import parser as date_parser
from bson.objectid import ObjectId

os.chdir('/usr/src/app/aquapp_api/apis/core')

class Database:
    _db_client = pymongo.MongoClient('mongodb://database:27017/')
    _default_db = _db_client.db
    _instance = None

    def __init__(self):
        # Shortcuts to the db collections
        self.node_types = Database._default_db.node_types
        self.nodes = Database._default_db.nodes
        self.sensors = Database._default_db.sensors
        self.users = Database._default_db.users
        self.sensor_data = Database._default_db.sensor_data
        self.water_bodies = Database._default_db.water_bodies

    def seed(self):
        # Create the admin user (obviously, the initial password will be taken from the env in production)
        if not [user for user in self.users.find({'username': 'admin'})]:
            self.users.insert_one({'username': 'admin', 'password': 'n/r3t3'})

           # Load all node types into the "node_types" collection
        try:
            node_types = [{**node_type, "_id": ObjectId(node_type["_id"])}
                          for node_type in json.loads(
                          open(os.path.join(os.path.dirname(__file__),
                                            "data/node_types.json")).read())]
            self.node_types.insert_many(node_types)
        except pymongo.errors.BulkWriteError:
            print('Could\'t load the node types')

        # Load all sensors into the "sensors" collection
        if not [sensor for sensor in self.sensors.find()]:
            sensors = json.loads(
                open(os.path.join(os.path.dirname(__file__),
                                  "data/sensors.json")).read())
            self.sensors.insert_many(sensors)

        # Load all nodes into the "nodes" collection TODO wrap the try in an if to check for an empty db
        try:
            nodes = [{**node, "_id": ObjectId(node["_id"])}
                      for node in json.loads(open(os.path.join(os.path.dirname(__file__), "data/nodes.json")).read())]
            self.nodes.insert_many(nodes)
        except pymongo.errors.BulkWriteError:
            print('Couldn\'t load the nodes')

        # Load all seeds WIP
        if not [sensor_data for sensor_data in self.sensor_data.find()]:
            sensor_data = []
            for node in nodes:
                for sensor in next(filter(lambda n: str(n['_id']) == str(node['node_type_id']), node_types))['sensors']:
                    sensor_data.append({'node_id': str(node['_id']), 'variable': sensor['variable'], 'data': []})
            
            for filename in os.listdir(os.path.join(os.path.dirname(__file__), 'data/nodes-data')):
                try:
                    node = next(filter(lambda n: str(n['_id']) == filename[:-4], nodes))
                except StopIteration:
                    print('Node:', filename[:-4], 'not found')
                    continue
                node_type = next(filter(lambda nt: str(nt['_id']) == node['node_type_id'], node_types))
                print('loading seed ' + filename)
                for line in open(os.path.join('data/nodes-data', filename)):
                    if line != '\n':
                        d = line.replace('\n', '').split(node_type['separator'])
                        for sensor, value in zip(node_type['sensors'], d[1:]):
                            try:
                                next(filter(lambda sd: sd['variable'] == sensor['variable'] and sd['node_id'] == str(node['_id']), sensor_data))['data'].append({'date': date_parser.parse(d[0]), 'value': float(value)})
                            except ValueError:
                                pass  # The value for that variable was not measured in that date
                            except StopIteration:
                                pass
            self.sensor_data.insert_many(sensor_data)

        # Loading the water bodies
        try:
            water_bodies = [{**water_body, 'nodes': []} for water_body in json.loads(open(os.path.join(os.path.dirname(__file__), "data/water_bodies.json")).read())]
            self.water_bodies.insert_many(water_bodies)
        except pymongo.errors.BulkWriteError:
            print('Couldn\'t load the water bodies')

    def __new__(cls):  # Basic singleton pattern
        if cls._instance is None:
            cls._instance = object.__new__(cls)
        return cls._instance

    def get_nodes(self):  # Get a list with all the nodes
        return [node for node in self.nodes.find()]

    def get_all_sensor_data(self, node_id):
        try:
            self.nodes.find({'_id': ObjectId(node_id)})[0]
            return self.sensor_data.find({'node_id': node_id})
        except IndexError:
            return []
        return True

    def add_node(self, name, location, coordinates, status, node_type_id):
        try:
            self.node_types.find({'_id': ObjectId(node_type_id)})[0]
            self.nodes.insert_one({'name': name, 'location': location, 'coordinates': coordinates, 'status': status, 'node_type_id': node_type_id})
        except IndexError:
            return False
        return True

    def edit_node(self, node_id, name, location, coordinates, status, node_type_id):
        try:
            node = self.nodes.find({'_id': ObjectId(node_id)})[0]
            if node_type_id != node["node_type_id"]:
                self.sensor_data.delete_many({'node_id': node_id})
            self.nodes.update_one({'_id': ObjectId(node_id)}, {'$set': {'name': name, 'location': location, 'coordinates': coordinates, 'status': status, 'node_type_id': node_type_id}})
        except IndexError:
            return False
        return True

    def add_sensor_data(self, node_id, variable):
        try:
            node = self.nodes.find({'_id': ObjectId(node_id)})[0]
            node_type = self.node_types.find({'_id': ObjectId(node['node_type_id'])})[0]
            if variable in [sensor["variable"] for sensor in node_type["sensors"]]:
                try:
                    self.sensor_data.find({'node_id': node_id, 'variable': variable})[0]
                except KeyError:
                    return False
                except IndexError:
                    self.sensor_data.insert_one({
                        'variable': variable,
                        'node_id': node_id,
                        'data': []
                    })
                    return True
        except KeyError:
            return False
        except IndexError:
            return False
        return False

    def add_datum(self, node_id, datum):
        try:
            node = self.nodes.find({'_id': ObjectId(node_id)})[0]
            node_type = self.node_types.find({'_id': ObjectId(node['node_type_id'])})[0]
            if datum['variable'] in [sensor["variable"] for sensor in node_type["sensors"]]:
                try:
                    self.sensor_data.find({'node_id': node_id, 'variable': datum["variable"]})[0]
                    self.sensor_data.update_one({'node_id': node_id, 'variable': datum["variable"]}, {
                        '$push': {'data': {"value": datum["value"], "date": date_parser.parse(datum["date"])}}
                    })
                except KeyError:
                    return False
                except IndexError:
                    return False
        except KeyError:
            return False
        return True

    def delete_node(self, node_id):
        try:
            self.nodes.find({'_id': ObjectId(node_id)})[0]
            self.nodes.delete_one({'_id': ObjectId(node_id)})
        except IndexError:
            return False
        return True

    def add_water_body(self):
        pass

    def get_water_bodies(self): # Get a list with all the water bodies
        return [water_body for water_body in self.water_bodies.find()]

    def get_water_body_nodes(self, water_body_id):
        try:
            water_body = self.water_bodies.find({'_id': ObjectId(water_body_id)})[0]
            return water_body['nodes']
        except IndexError:
            return []
    
    def add_node_to_water_body(self, node_id, water_body_id):
        try:
            node = self.nodes.find({'_id': ObjectId(node_id)})[0]
            water_body = self.water_bodies.find({'_id': ObjectId(water_body_id)})[0]
            if node_id in water_body['nodes'] or node['node_type_id'] != '59c9d9019a892016ca4be412':
                return False
            self.water_bodies.update({'_id': ObjectId(water_body_id)},{'$push': {'nodes': node_id}})
        except IndexError:
            return False
        return True

    def remove_nodes_from_water_body(self, water_body_id, node_ids):
        try:
            self.water_bodies.find({'_id': ObjectId(water_body_id)})
            self.water_bodies.update_one({'_id': ObjectId(water_body_id)}, 
                {'$pull': {'nodes': {'$in': node_ids}}})
        except IndexError:
            return False
        return True


    def get_node_types(self):  # Get a list with all the node types
        return [node_type for node_type in self.node_types.find()]

    def get_node_type(self, id):  # Get the node type with the provided id 
        return self.node_types.find({"_id": ObjectId(id)})

    def get_node(self, id):  # Get the node with the provided id
        return self.nodes.find({"_id": ObjectId(id)})

    def get_nodes_by_node_type_id(self, id):  # Get all nodes with node_type = id
        return [node for node in self.nodes.find({"node_type_id": id})]

    def add_user(self):  # Add a new user to the users collection
        pass

    def get_user(self, query):  # Get a user
        return [user for user in self.users.find(query)]

    def get_sensor_data(self, node_id, variable, start_date="", end_date=""):  # Get sensor data
        try:
            sensor = self.sensor_data.find({
                'node_id': node_id,
                'variable': variable
            })[0]
        except IndexError:
            return []
        if start_date and end_date:
            start_date = date_parser.parse(start_date)
            end_date = date_parser.parse(end_date)

            return {'variable': variable, 'node_id': node_id, 'data': [
                {**data, 'date': str(data['date'])} for data in filter(lambda s: start_date <= s['date'] <= end_date, sensor['data'])
            ]}
        else:
            return list({str(datum['date'].month) + "/" + str(datum['date'].day) + "/" + str(datum['date'].year) for datum in sensor['data']})
