"""
    Custom fields for the models in marshmallow_models.py
"""

from marshmallow import fields, ValidationError
from bson import ObjectId
from bson.objectid import InvalidId
from dateutil import parser
from datetime import datetime


class ObjectIdField(fields.Field):
    default_error_messages = {
        'invalid': 'Invalid ID.',
    }
    def _deserialize(self, value, attr, data):
        try:
            return ObjectId(value)
        except InvalidId:
            raise ValidationError("Invalid ID")


class CoordinatesField(fields.Field):
    default_error_messages = {
        'invalid': 'Invalid coordinates.',
    }
    def _deserialize(self, value, attr, data):
        if type(value) != list:
            raise ValidationError("The coordinates parameter must be an array (ex: [10.4033992,-75.4976742].")
        if len(value) != 2:
            raise ValidationError("The coordinates parameter must have 2 elements (latitude and longitude)")
        try:
            value = [float(v) for v in value]
        except ValueError:
            raise ValidationError("The latitude and longitude must be floating point numbers")
        errors = "Invalid latitude (It must be between -90 and 90)" if not (-90 <= value[0] <= 90) else ""
        errors += ("Invalid longitude (It must be between -180 and 180)" if not errors else ". Invalid longitude  (It must be between -180 and 180).") if not (-180 <= value[1] <= 180) else ""
        if errors:
            raise ValidationError(errors)
        return value


class DateTimeField(fields.Field):
    default_error_messages = {
        'invalid': 'Invalid coordinates.',
    }
    def _deserialize(self, value, attr, data):
        if type(value) != str:
            raise ValidationError("The field must be a string.")
        try:
            if value:
                return parser.parse(value)
            return datetime.utcnow()  # If no date time provided, return the current date time.
        except ValueError:
            raise ValidationError("The string hasn't a valid datetime format (use ISO format).")


class SensorField(fields.Field):
    variable = fields.Str(required=True)
    unit = fields.Str(required=True)


# This field checks if the coordinates fields is
# a valid leaflet Polygon or MultiPolygon
class WBCoordinatesField(fields.Field):
    default_error_messages = {
        'invalid': 'Invalid coordinates.',
    }
    def _deserialize(self, value, attr, data):
        dim_count = 0
        aux = value['coordinates']
        while True:
            if type(aux) == list:
                if len(aux):
                    aux = aux[0]
                    dim_count += 1
                    continue
                else:
                    dim_count += 1
                    break
            break 
        # Polygons must be 3D arrays and MultiPolygons 4D arrays
        if (value['type'] == 'Polygon' and dim_count == 3) or (value['type'] == 'MultiPolygon' and dim_count == 4):
            # Every coordinate in the polygons must be checked
            if dim_count == 3:
                for w in value:
                    for x in w:
                        for y in x:
                            if type(y) == list and not ((y[0] in range(-90, 91) and y[1] in range (-180, 181)) and len(y) == 2):
                                break
                else:
                    return value
            else:
                for w in value:
                    for x in w:
                        for y in x:
                            for z in y:
                                if type(y) == list and not (((y[0] in range(-90, 91)) and (y[1] in range (-180, 181))) and len(y) == 2):
                                    break
                else:    
                    return value           
        raise ValidationError('The data is not a valid Polygon or MultiPolygon.')    


class WBGeometryField(fields.Field):
    type = fields.Str(required=True)
    coordinates = WBCoordinatesField(required=True)


class WBPropertiesField(fields.Field):
    name = fields.Str(required=True)
    id = fields.Str(required=True)


# Bcrypt can only hash strings up to 72 characters long
# so this checks if the provided string is > than 12
# and less than 72 characters.
# If in the future it's needed to use longer passwords
# then use the solution provided in marshmallow_models.py
# in the UserSchema
class BcryptHashablePasswordField(fields.Field):
    default_error_messages = {
        'invalid': 'Invalid password.',
    }
    def _deserialize(self, value, attr, data):
        if type(value) != str:
            raise ValidationError('password must be a string.')
        if not 12 <= len(value) <= 72:
            raise ValidationError('password must be 12 to 72 characters long.')
        return value


# This checks if the username length is between 6 and 24 characters
class UsernameField(fields.Field):
    default_error_messages = {
        'invalid': 'Invalid password.',
    }
    def _deserialize(self, value, attr, data):
        if type(value) != str:
            raise ValidationError('username must be a string.')
        if not 6 <= len(value) <= 24:
            raise ValidationError('username must be 6 to 24 characters long.')
        return value
