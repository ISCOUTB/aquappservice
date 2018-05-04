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


    def seed(self):
        # Create the admin user
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
            pass

        # Load all sensors into the "sensors" collection
        if not [sensor for sensor in self.sensors.find()]:
            sensors = json.loads(
                open(os.path.join(os.path.dirname(__file__),
                                  "data/sensors.json")).read())
            self.sensors.insert_many(sensors)

        # Load all nodes into the "nodes" collection TODO wrap the try in an if to check for an empty db
        try:
            nodes = [{**node, "_id": ObjectId(node["_id"]), 
                      'sensors': [{**sensor, 'data': []} for sensor in self.node_types.find({'_id': ObjectId(node['node_type_id'])})[0]['sensors']]}
                      for node in json.loads(open(os.path.join(os.path.dirname(__file__), "data/nodes.json")).read())]
            # Load all seeds WIP
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
                        for i in range(1, len(d)):
                            try:
                                node['sensors'][i - 1]['data'].append({'date': date_parser.parse(d[0]), 'value': float(d[i])})
                            except ValueError:
                                pass  # The value for that variable was not measured in that date
            self.nodes.insert_many(nodes)
        except pymongo.errors.BulkWriteError:
            pass

    def __new__(cls):  # Basic singleton pattern
        if cls._instance is None:
            cls._instance = object.__new__(cls)
        return cls._instance

    def get_nodes(self):  # Get a list with all the nodes
        return [node for node in self.nodes.find()]

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

    def get_sensor_data(self, node_id, start_date, end_date, variable):  # Get sensor data
        node = self.nodes.find({'_id': ObjectId(node_id)})[0]
        sensor = next(filter(lambda v: v['variable'] == variable, node['sensors']))
        start_date = date_parser.parse(start_date)
        end_date = date_parser.parse(end_date)
        data = [d for d in filter(lambda x: start_date <= x['date'] <= end_date , sensor['data'])]
        return {'variable': variable, node_id: 'node_id', 'data': data}