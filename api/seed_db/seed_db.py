import json
import pymongo
import os
from bson.objectid import ObjectId
from dateutil import parser as date_parser

db_client = pymongo.MongoClient('mongodb://localhost:27017/')
default_db = db_client.db
dbnode_types = default_db.node_types
dbnodes = default_db.nodes
dbusers = default_db.users
dbsensor_data = default_db.sensor_data
dbwater_bodies = default_db.water_bodies

# Loading nodes
print("Adding nodes")
try:
    nodes = [{**node, "_id": ObjectId(node["_id"])} for node in json.loads(open("nodes.json", "r").read())]
    dbnodes.insert_many(nodes)
except pymongo.errors.BulkWriteError:
    print("The nodes were already loaded")

# Loading node types
print("Adding node types")
try:
    node_types = [{**node_type, "_id": ObjectId(node_type["_id"])} for node_type in json.loads(open("node_types.json", "r").read())]
    dbnode_types.insert_many(node_types)
except pymongo.errors.BulkWriteError:
    print("The node types were already loaded")

# Loading water bodies
print("Adding water bodies")
try:
    water_bodies = [{**water_body, "_id": ObjectId(water_body["_id"])} for water_body in json.loads(open("water_bodies.json", "r").read())]
    dbwater_bodies.insert_many(water_bodies)
except pymongo.errors.BulkWriteError:
    print("The water bodies were already loaded")

# Loading seeds
print("Adding sensor data")
if not dbsensor_data.find_one():
    for filename in os.listdir(os.path.join(os.getcwd(), 'sensor_data')):
        try:
            node = next(filter(lambda n: str(n['_id']) == filename[:-4], nodes))
        except StopIteration:
            print('Node:', filename[:-4], 'not found')
            continue
        node_type = next(filter(lambda nt: str(nt['_id']) == node['node_type_id'], node_types))
        print('loading seed ' + filename)
        data = [d.split(node_type["separator"]) for d in open(os.path.join('sensor_data', filename)).read().split("\n")]
        new_sensor_data = [
            {
                'variable': sensor['variable'],
                'node_id': str(node['_id']),
                'data': []
            } for sensor in node_type['sensors']
        ]
        for i in range(len(data)):
            date = date_parser.parse(data[i][0])
            for j in range(1, len(data[i])):
                if data[i][j] == "---":  # No data registered for this sensor at this date
                    continue
                try:
                    value = float(data[i][j])
                except ValueError:
                    value = data[i][j]  # The value is a string

                new_sensor_data[j - 1]['data'].append({'date': date, 'value': value})
        dbsensor_data.insert_many(new_sensor_data)
else:
    print("The sensor data were already loaded")
