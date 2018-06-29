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

from marshmallow import Schema, fields
from .marshmallow_fields import NodeStatusField, BcryptHashablePasswordField, UsernameField, CoordinatesField, DateTimeField, ObjectIdField, SensorField, WBGeometryField, WBPropertiesField


# This schema not only validates the input but it also
# converts the id provided to a bson ObjectId instance
class NodeSchema(Schema):
    _id = ObjectIdField(required=True)
    name = fields.Str(required=True)
    location = fields.Str(required=True)
    coordinates = CoordinatesField(required=True)
    created_at = DateTimeField(required=True)
    updated_at = DateTimeField(required=True)
    node_type_id = fields.Str(required=True)


# This is the schema used when creating new nodes,
# since we don't need the created_at and
# updated_at properties
class NewNodeSchema(Schema):
    name = fields.Str(required=True)
    location = fields.Str(required=True)
    coordinates = CoordinatesField(required=True)
    node_type_id = fields.Str(required=True)
    status = NodeStatusField(required=True)


# This is the schema used when creating new nodes,
# since we don't need (in fact, we musn't accept
# that the user edits them directly) the 
# created_at and updated_at properties
class EditNodeSchema(Schema):
    name = fields.Str(required=False)
    location = fields.Str(required=False)
    coordinates = CoordinatesField(required=False)
    node_type_id = fields.Str(required=False)
    status = NodeStatusField(required=False)


class DatumSchema(Schema):
    date = fields.DateTime(required=True)
    value = fields.Float(required=True)
    variable = fields.Str(required=True)


# As the NodeSchema, this also converts the id
# to an ObjectId instance
class NodeTypeSchema(Schema):
    _id = ObjectIdField(required=True)
    name = fields.Str(required=True)
    separator = fields.Str(required=True)
    sensors = fields.List(SensorField(), required=True)


# Schema for creating new node types
# It's the same as the node type schema, but it's
# here in case that the model changes
class NewNodeTypeSchema(Schema):
    _id = ObjectIdField(required=False)
    name = fields.Str(required=True)
    separator = fields.Str(required=True)
    sensors = fields.List(SensorField(), required=True)


class EditNodeTypeSchema(Schema):
    _id = ObjectIdField(required=False)
    name = fields.Str(required=False)
    separator = fields.Str(required=False)
    sensors = fields.List(SensorField(), required=False)


class NewWaterBodySchema(Schema):
    properties = WBPropertiesField()
    geometry = WBGeometryField()

"""
    This schema checks if the password provided
    can be hashed by bcrypt. Bcrypt has a
    passowrd length limit of 72 characters,
    there are workarounds to get over this
    issue but this application doesn't
    requires long passwords right now.
    If in the future it's useful to have 72+
    characters passwords then you can first
    hash the long password with a
    cryptographic hash as suggested by the
    bycript module documentation:
    
    The following example hashes the long
    password with sha256 (using python hashlib)
    and encodes it to base64 (the later is important).

    >>> password = b"an incredibly long password" * 10
    >>> hashed = bcrypt.hashpw(
    ...     base64.b64encode(hashlib.sha256(password).digest()),
    ...     bcrypt.gensalt()
    ... )
"""
class UserSchema(Schema):
    username = UsernameField(required=True)
    password = BcryptHashablePasswordField(required=True)
