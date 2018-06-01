import pymongo
import json
import os
import bcrypt
from datetime import datetime
from dateutil import parser as date_parser
from bson.objectid import ObjectId

os.chdir('/backend/aquapp/apis/core')

# The methods are ordered by the operation type (CRUD) and the objects involved (node, node_type, water_body, data and datum)
class Database:
    _db_client = pymongo.MongoClient('mongodb://database:27017/')
    _default_db = _db_client.db
    _instance = None

    def __init__(self):
        # Shortcuts to the db collections
        self.node_types = Database._default_db.node_types
        self.nodes = Database._default_db.nodes
        self.users = Database._default_db.users
        self.sensor_data = Database._default_db.sensor_data
        self.water_bodies = Database._default_db.water_bodies
        self.icampff_caches = Database._default_db.icampff_caches

    def seed(self):
        # Create the admin user
        if not [user for user in self.users.find({'username': os.getenv('ADMIN_USERNAME')})]:
            print("Adding admin user")
            self.users.insert_one({'username': os.getenv('ADMIN_USERNAME'), 'password': bcrypt.hashpw(os.getenv('DEFAULT_ADMIN_KEY').encode('utf-8'), bcrypt.gensalt())})

        # Load all node types into the "node_types" collection
        try:
            node_types = [{**node_type, "_id": ObjectId(node_type["_id"])}
                          for node_type in json.loads(
                          open(os.path.join(os.path.dirname(__file__),
                                            "data/node_types.json")).read())]
            self.node_types.insert_many(node_types)
        except pymongo.errors.BulkWriteError:
            print('Failed load the node types')

        # Load all nodes into the "nodes" collection TODO wrap the try in an if to check for an empty db
        try:
            nodes = [{**node, "_id": ObjectId(node["_id"])}
                      for node in json.loads(open(os.path.join(os.path.dirname(__file__), "data/nodes.json")).read())]
            self.nodes.insert_many(nodes)
        except pymongo.errors.BulkWriteError:
            print('Failed to load the nodes')

        # Load all seeds
        if not [sensor_data for sensor_data in self.sensor_data.find()]:
            for i in range(10):
                self.sensor_data.insert_many(json.loads(open(os.path.join(os.path.dirname(__file__),
                                                "data/sensor_data{}.json".format(i))).read()))

        # Loading the water bodies
        try:
            water_bodies = [{**water_body, '_id': ObjectId(water_body['_id'])} for water_body in json.loads(open(os.path.join(os.path.dirname(__file__), "data/water_bodies.json")).read())]
            self.water_bodies.insert_many(water_bodies)
        except pymongo.errors.BulkWriteError:
            print('Failed to load the water bodies')

    def __new__(cls):  # Basic singleton pattern
        if cls._instance is None:
            cls._instance = object.__new__(cls)
        return cls._instance

    def add_nodes(self, nodes):  # Now it adds a list of nodes instead of a single one for efficiency
        # TODO when a node is excluded, we need to tell the user!
        nodes = list(filter(lambda node: self.node_types.find_one({'_id': ObjectId(node['node_type_id'])}), nodes))
        result = self.nodes.insert_many(nodes)  # insert_many() is preferred to multiple insert_one()
        for node, _id in zip(nodes, result.inserted_ids):  # Adding the sensor_data definitions (refer to the data model in swagger_models.py in the same directory)
            node_type = self.node_types.find_one({'_id': ObjectId(node['node_type_id'])})
            sensor_data_definitions = [{'variable': sensor['variable'], 'node_id': str(_id), 'data': []} for sensor in node_type['sensors']]
            self.sensor_data.insert_many(sensor_data_definitions)

    def get_nodes(self):  # Get a list with all the nodes
        return [node for node in self.nodes.find()]

    def get_node(self, id):  # Get the node with the provided id
        return self.nodes.find({"_id": ObjectId(id)})

    def get_nodes_by_node_type_id(self, id):  # Get all nodes with node_type = id
        return [node for node in self.nodes.find({"node_type_id": id})]

    def get_all_sensor_data(self, node_id):
        try:
            self.nodes.find({'_id': ObjectId(node_id)})[0]
            return self.sensor_data.find_one({'node_id': node_id})
        except IndexError:
            return None  # TODO: CHANGE IN THE API, NONE MAPS TO NULL WHEN ITS CONVERTED TO JSON
        return True

    def get_sensor_data(self, node_id, variable, start_date, end_date):  # Get sensor data
        sensor = self.sensor_data.find_one({
            'node_id': node_id,
            'variable': variable
        }) or {
                'variable': variable, 
                'node_id': node_id,
                'data': []
            }
        
        return {**sensor, 'data': [
            datum for datum in filter(lambda s: start_date <= date_parser.parse(s['date']) <= end_date, sensor['data'])
        ]}

    def get_available_dates(self, node_id, variable):
        sensor = self.sensor_data.find_one({
            'node_id': node_id,
            'variable': variable
        })
        if not sensor:  # No sensor data registered
            return []
        return list({str(datum['date'].month) + "/" + str(datum['date'].day) + "/" + str(datum['date'].year) for datum in sensor['data']})


    def edit_node(self, node_id, new_node_data):
        node = self.nodes.find_one({'_id': ObjectId(node_id)})
        if not node:
            return False
        if new_node_data["node_type_id"] != node["node_type_id"]:
            self.sensor_data.delete_many({'node_id': node_id})
            # TODO if it was a WQ node, remove the caches as well
        self.nodes.update_one({'_id': ObjectId(node_id)}, {'$set': {**new_node_data}})
        return True

    def add_sensor_data(self, node_id, variable, data):
        node = self.nodes.find_one({'_id': ObjectId(node_id)})
        node_type = self.node_types.find_one({'_id': ObjectId(node['node_type_id'])})
        # If the node doesn't exist, the node type doesn't exist or the variable is not in the
        # list of sensors of the node type, the operation is cancelled.
        if not node or not node_type or variable not in [sensor['variable'] for sensor in node_type['sensors']]:
            return
        self.sensor_data.update_one({'node_id': node_id, 'variable': variable}, {
            '$push': {
                '$each': {
                    'data': data
                }
            }
        })

    def delete_node(self, node_id):
        try:
            self.nodes.find({'_id': ObjectId(node_id)})[0]
            self.nodes.delete_one({'_id': ObjectId(node_id)})
        except IndexError:
            return False
        return True

    def add_water_bodies(self, water_bodies):
        self.water_bodies.insert_many(water_bodies)

    def get_water_bodies(self): # Get a list with all the water bodies
        return [water_body for water_body in self.water_bodies.find()]

    def get_water_body_nodes(self, water_body_id):
        try:
            water_body = self.water_bodies.find({'_id': ObjectId(water_body_id)})[0]
            return water_body['nodes']
        except IndexError:
            return []

    def get_icampff_cache(self, water_body_id, node_id):
        return self.icampff_caches.find_one({
            'water_body_id': water_body_id,
            'node_id': node_id
        })

    def check_icampff_hash(self, water_body_id, node_id, h):
        cache = self.icampff_caches.find_one({
            'water_body_id': water_body_id,
            'node_id': node_id
        })
        return cache['hash'] == h if cache else False

    def set_icampff_cache(self, water_body_id, node_id, h, icampff):
        self.icampff_caches.update_one(
            {
                'water_body_id': water_body_id,
                'node_id': node_id
            },
            {
                '$set': {
                    'icampff': icampff,
                    'hash': h
                }
            }, upsert=True)

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

    def add_node_types(self, node_types):  # Add a list of node types
        if node_types:
            self.node_types.insert_many(node_types)

    def get_node_types(self):  # Get a list with all the node types
        return [node_type for node_type in self.node_types.find()]

    def get_node_type(self, id):  # Get the node type with the provided id
        return self.node_types.find({"_id": ObjectId(id)})

    def edit_node_type(self, node_type_id, new_node_type_data):
        self.node_types.update_one(
            {
                '_id': ObjectId(node_type_id)
            },
            {
                '$set': {
                    **new_node_type_data
                }
            }
        )

    def delete_node_type(self, node_type_id):
        self.node_types.delete_one({'_id': ObjectId(node_type_id)})
        # Remove all the nodes with that node type as well
        self.nodes.delete_many({'node_type_id': node_type_id})

    def add_user(self, username):  # Add a new user to the users collection
        return self.users.find_one({'username': username})

    def get_user(self, username):  # Get a user
        return self.users.find_one({'username': username})
