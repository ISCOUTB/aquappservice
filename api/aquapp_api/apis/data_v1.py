from flask_restplus import Namespace, Resource

api = Namespace("data", description="Data related operations")

# API schemas
datum = api.schema_model(name="Datum", schema={
      "type": "object",
      "properties": {
        "timestamp": {
          "type": "string",
          "description": "collecting date",
          "format": "yyyymmddhhmiss",
          "example": 20161008185500
        },
        "value": {
          "type": "number",
          "description": "measured value",
          "example": 0.209
        }
      }
    })
data = api.schema_model(name="Data", schema={
      "type": "object",
      "properties": {
        "_id": {
          "type": "string",
          "description": "Unique data identifier",
          "example": "59c9d12312016ca4be1892"
        },
        "variable": {
          "type": "string",
          "description": "Data collected variable"
        },
        "node_id": {
          "type": "integer",
          "description": "Unique node identifier",
          "example": "59b75c5f9a8920223f2eabe4"
        },
        "data": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/Datum"
          }
        },
        "updated_at": {
          "type": "string",
          "description": "Node last update date",
          "example": "2017-07-27T19:05:11.000Z"
        },
        "created_at": {
          "type": "string",
          "description": "Node storing date",
          "example": "2017-07-27T19:05:11.000Z"
        }
      }
    })

DATA = []


@api.route("nodes/<string:node_id>/data")
@api.param("node_id", description="ID of node which data to return",
           _in="path", required=True, type="Integer")
class DataByNodeId(Resource):
    @api.doc(summary="Find available data by node ID",
             description="Returns a collection of data",
             responses={200: ("Data object", [data]), 404: "Node not found"})
    def get(self):
        return DATA


@api.route("data")
@api.param("node_id", description="Unique node identifier to filter by",
           _in="query", required=True, type="string")
@api.param("start_date",
           description="Initial date to filter by", _in="query",
           required=True, type="string")
@api.param("end_date", description="End date to filter by",
           _in="query", required=True, type="string")
@api.param("variable", description="Unique node identifier to filter by",
           _in="query", required=True, type="string")
class Data(Resource):
    @api.doc(summary="", description="",
             responses={200: ("Filtered data", data)})
    def get(self):
        return DATA


"""
@api.route("datum")
class Sensors(Resource):
    @api.doc(responses={200: ("", datum)})
    def get(self):
        return []
"""
