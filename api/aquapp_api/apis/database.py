import pymongo
import json
import os
from bson.objectid import ObjectId


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

        # Load all nodes into the "nodes" collection
        try:
            nodes = [{**node, "_id": ObjectId(node["_id"])}
                     for node in json.loads(
                        open(os.path.join(
                             os.path.dirname(__file__),
                             "data/nodes.json")).read())]
            self.nodes.insert_many(nodes)
        except pymongo.errors.BulkWriteError:
            pass

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

        # Load all seeds WIP

        # Create the admin user
        if not [sensor for sensor in self.sensors.find({'username': 'admin'})]:
            self.users.insert_one({'username': 'admin', 'password': 'n/r3t3'})

    def __new__(cls):
        if cls._instance is None:
            cls._instance = object.__new__(cls)
        return cls._instance

    def get_nodes(self):
        return [node for node in self.nodes.find()]

    def get_node_types(self):
        return [node_type for node_type in self.node_types.find()]

    def get_node_type(self, id):
        return self.node_types.find({"_id": ObjectId(id)})

    def get_node(self, id):
        return self.nodes.find({"_id": ObjectId(id)})

    def get_nodes_by_node_type_id(self, id):
        return [node for node in self.nodes.find({"node_type_id": id})]

    def add_user(self):
        pass

    def get_user(self, query):
        return [user for user in self.users.find(query)]
