import os
import json
from dateutil import parser as date_parser
from bson import ObjectId
sensor_data = []
node_types = [{**node_type, "_id": ObjectId(node_type["_id"])}
                          for node_type in json.loads(
                          open(os.path.join(os.path.dirname(__file__),
                                            "data/node_types.json")).read())]
nodes = [{**node, "_id": ObjectId(node["_id"])}
                      for node in json.loads(open(os.path.join(os.path.dirname(__file__), "data/nodes.json")).read())]
            
for filename in os.listdir(os.path.join(os.path.dirname(__file__), 'data/nodes-data')):
    try:
        node = next(filter(lambda n: str(n['_id']) == filename[:-4], nodes))
    except StopIteration:
        print('Node:', filename[:-4], 'not found')
        continue
    node_type = next(filter(lambda nt: str(nt['_id']) == node['node_type_id'], node_types))
    print('loading seed ' + filename)
    data = [d.split(node_type["separator"]) for d in open(os.path.join('data/nodes-data', filename)).read().split("\n")]
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
            try:
                new_sensor_data[j - 1]['data'].append({'date': date, 'value': float(data[i][j])})
            except ValueError:
                pass

    sensor_data.extend(new_sensor_data)
print([len(s['data']) for s in sensor_data])
