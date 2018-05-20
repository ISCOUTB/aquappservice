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
from .marshmallow_fields import CoordinatesField, DateTimeField, ObjectIdField


class NodeSchema(Schema):
    _id = ObjectIdField(required=True)
    name = fields.Str(required=True)
    location = fields.Str(required=True)
    coordinates = CoordinatesField(required=True)
    created_at = DateTimeField(required=True)
    updated_at = DateTimeField(required=True)
    node_type_id = fields.Str(required=True)


class NewNodeSchema(Schema):
    name = fields.Str(required=True)
    location = fields.Str(required=True)
    coordinates = CoordinatesField(required=True)
    node_type_id = fields.Str(required=True)


class EditNodeSchema(Schema):
    name = fields.Str(required=False)
    location = fields.Str(required=False)
    coordinates = CoordinatesField(required=False)
    node_type_id = fields.Str(required=False)