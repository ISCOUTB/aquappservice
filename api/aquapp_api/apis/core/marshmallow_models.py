"""
    Validation is mandatory in a real-world application like this,
    to avoid creating some unmaintainable spaguetti code for
    validating the data that the API receives we'll be using
    marshmallow (https://marshmallow.readthedocs.io/en/latest/).
    Marshmallow is a ORM/ODM that allows us to serialize
    complex datatypes into dictionaries/json objects (or vice 
    versa) by creating reusable schemas of the objects we
    are mapping.
"""

from marshmallow import Schema, pprint, fields
from datetime import datetime
from dateutil import parser
from marshmallow_fields import *


class NodeType:
    def __init__(self, _id, name, separator, sensors, created_at, updated_at, links):
        self._id = _id
        self.name = name
        self.separator = separator
        self.sensors = sensors
        self.created_at = datetime.utcnow()
        self.updated_at = parser.parse(updated_at)
        self.links = links


class NodeTypeSchema(Schema):
    _id = fields.Str()
    name = fields.Str()
    separator = fields.Str()
    sensors = fields.List(SensorField())
    created_at = fields.DateTime()
    updated_at = fields.DateTime()


class Node:
    def __init__(self, _id, name, location, coordinates, updated_at, node_type_id):
        self._id = _id
        self.name = name
        self.location = location
        self.coordinates = coordinates
        self.created_at = datetime.utcnow()
        self.updated_at = parser.parse(updated_at)
        self.node_type_id = node_type_id


class NodeSchema(Schema):
    _id = fields.Str()
    name = fields.Str()
    location = fields.Str()
    coordinates = fields.List(fields.Float())
    created_at = fields.DateTime()
    updated_at = fields.DateTime()
    node_type_id = fields.Str()
