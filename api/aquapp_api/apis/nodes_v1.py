from flask import request
from flask_restplus import Namespace, Resource
from .database import Database

api = Namespace("nodes", description="Node related operations")

# API schemas
sensor = api.schema_model("Sensor", {
      "type": "object",
      "properties": {
        "variable": {
          "type": "string",
          "description": "Measured property",
          "example": "Thermotolerant Coliforms"
        },
        "unit": {
          "type": "string",
          "description": "Measured unit",
          "example": "NMP/100ml"
        }
      }
    })
links = api.schema_model("Links", {
      "type": "object",
      "properties": {
        "rel": {
          "type": "string",
          "description": "Hypermedia link relationship with the current returned object",
          "example": "self"
        },
        "href": {
          "type": "string",
          "description": "URI to described resource",
          "example": "http://aquapp.utb.services/api/v1/nodes/59b75c5f9a8920223f2eabe4"
        }
      }
    })
node_type = api.schema_model("Node-Types", {
      "type": "object",
      "properties": {
        "_id": {
          "type": "string",
          "description": "Unique node type identifier",
          "example": "59c9d9019a892016ca4be412"
        },
        "name": {
          "type": "string",
          "description": "Node type name",
          "example": "Water Quality"
        },
        "separator": {
          "type": "string",
          "description": "Data delimiter",
          "example": ","
        },
        "sensors": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/Sensor"
          }
        },
        "updated_at": {
          "type": "string",
          "description": "Node type last update date",
          "example": "2017-07-27T19:05:11.000Z"
        },
        "created_at": {
          "type": "string",
          "description": "Node type storing date",
          "example": "2017-07-27T19:05:11.000Z"
        },
        "links": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/Links"
          }
        }
      }
    })
node = api.schema_model("Node", {
      "type": "object",
      "properties": {
        "_id": {
          "type": "string",
          "description": "Unique node identifier",
          "example": "59b75c5f9a8920223f2eabe4"
        },
        "name": {
          "type": "string",
          "description": "Node name",
          "example": "Laguna de Chambacú"
        },
        "location": {
          "type": "string",
          "description": "City location reference",
          "example": "Centro, Puerto Duro. Frente Al Gigante Del Hogar"
        },
        "coordinates": {
          "type": "array",
          "items": {
            "type": "number",
            "example": "10.425083333333, -75.543888888889"
          }
        },
        "status": {
          "type": "string",
          "description": "Node current status",
          "enum": [
            "Real Time",
            "Non Real Time",
            "Off"
          ],
          "example": "Off"
        },
        "node_type_id": {
          "type": "string",
          "description": "Node type unique identifier",
          "example": "59c9d9019a892016ca4be412"
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
        },
        "links": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/Links"
          }
        }
      }
    })


@api.route("node-types")
class NodeTypes(Resource):
    @api.doc(summary="Get all node types",
             description="Returns a collection of node types",
             responses={200: ("Node type collection", [node_type])})
    def get(self):
        return [{**ndt, "_id": str(ndt["_id"])}
                for ndt in Database().get_node_types()]


@api.route("node-types/add")
class AddNodeType(Resource):
    @api.doc(summary="Add new node types",
             description="Add new node types",
             responses={201: "Node type added successfully"},
             security=['apikey', 'oauth2'])
    @api.expect([node_type], validate=True)
    def post(self):
        print(request.get_json())
        return 201


@api.route("node-types/<string:node_type_id>")
@api.param("node_type_id",
           description="Id of node type to return",
           _in="path",
           required=True,
           type="string")
class NodeTypeById(Resource):
    @api.doc(summary="Find node type by ID",
             description="Returns a single node type",
             responses={200: ("Returns a single node type", node_type),
                        404: "Node type not found"})
    def get(self, node_type_id):
        return [{**ndt, "_id": str(ndt["_id"])}
                for ndt in Database().get_node_type(node_type_id)][0]


@api.route("node-types/<string:node_type_id>/nodes")
@api.param("node_type_id",
           description="Id of node type to return",
           _in="path",
           required=True,
           type="string")
class NodesByNodeType(Resource):
    @api.doc(summary="Get all nodes of a given node type",
             description="Returns all nodes of a node type",
             responses={200: ("Node collection", [node]),
                        404: "Node type not found"})
    def get(self, node_type_id):
        return [{**nd, "_id": str(nd["_id"])}
                for nd in Database().get_nodes_by_node_type_id(node_type_id)]


@api.route("nodes")
class Nodes(Resource):
    @api.doc(summary="Get all nodes",
             description="Returns all nodes",
             responses={200: ("Node collection", [node])})
    def get(self):
        return [{**nd, "_id": str(nd["_id"])}
                for nd in Database().get_nodes()]


@api.route("nodes/<string:node_id>")
@api.param("node_id", description="ID of node to return", _in="path",
           required=True, type="string")
class Node(Resource):
    @api.doc(summary="Get a node by ID", description="Returns a single node",
             responses={200: ("A node object", node), 404: "Node not found"})
    def get(self, node_id):
        return [{**nd, "_id": str(nd["_id"])}
                for nd in Database().get_node(node_id)][0]


"""
@api.route("sensors")
class Sensors(Resource):
    @api.doc(responses={200: ("", sensor)})
    def get(self):
        return []


@api.route("links")
class Links(Resource):
    @api.doc(responses={200: ("", links)})
    def get(self):
        return []
# """
