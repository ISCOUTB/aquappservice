date_array = {
  'type': 'array',
  'description': 'Array of dates as strings (in format mm/dd/yyyy)',
  'items': {
    'type': 'string'
  }
}

sensor = {
  'type': 'object',
  'properties': {
    'variable': {
      'type': 'string',
      'description': 'Measured property',
      'example': 'Thermotolerant Coliforms'
    },
    'unit': {
      'type': 'string',
      'description': 'Measured unit',
      'example': 'NMP/100ml'
    },
    'data': {
      'type': 'array',
      'items': {
        '$ref': '#/definitions/Data'
    }
    }
  }
}

link = {
  'type': 'object',
  'properties': {
    'rel': {
      'type': 'string',
      'description': 'Hypermedia link relationship with the current returned object',
      'example': 'self'
    },
    'href': {
      'type': 'string',
      'description': 'URI to described resource',
      'example': 'http://aquapp.utb.services/api/v1/nodes/59b75c5f9a8920223f2eabe4'
    }
  }
}

node_type = {
  'type': 'object',
  'properties': {
    '_id': {
      'type': 'string',
      'description': 'Unique node type identifier',
      'example': '59c9d9019a892016ca4be412'
    },
    'name': {
      'type': 'string',
      'description': 'Node type name',
      'example': 'Water Quality'
    },
    'separator': {
      'type': 'string',
      'description': 'Data delimiter',
      'example': ','
    },
    'sensors': {
      'type': 'array',
      'items': {
        '$ref': '#/definitions/Sensor'
      }
    },
    'updated_at': {
      'type': 'string',
      'description': 'Node type last update date',
      'example': '2017-07-27T19:05:11.000Z'
    },
    'created_at': {
      'type': 'string',
      'description': 'Node type storing date',
      'example': '2017-07-27T19:05:11.000Z'
    },
    'links': {
      'type': 'array',
      'items': {
        '$ref': '#/definitions/Links'
      }
    }
  }
}

node = {
  'type': 'object',
  'properties': {
    '_id': {
      'type': 'string',
      'description': 'Unique node identifier',
      'example': '59b75c5f9a8920223f2eabe4'
    },
    'name': {
      'type': 'string',
      'description': 'Node name',
      'example': 'Laguna de Chambacú'
    },
    'location': {
      'type': 'string',
      'description': 'City location reference',
      'example': 'Centro, Puerto Duro. Frente Al Gigante Del Hogar'
    },
    'coordinates': {
      'type': 'array',
      'items': {
        'type': 'number',
        'example': '10.425083333333, -75.543888888889'
      }
    },
    'status': {
      'type': 'string',
      'description': 'Node current status',
      'enum': [
        'Real Time',
        'Non Real Time',
        'Off'
      ],
      'example': 'Off'
    },
    'node_type_id': {
      'type': 'string',
      'description': 'Node type unique identifier',
      'example': '59c9d9019a892016ca4be412'
    },
    'updated_at': {
      'type': 'string',
      'description': 'Node last update date',
      'example': '2017-07-27T19:05:11.000Z'
    },
    'created_at': {
      'type': 'string',
      'description': 'Node storing date',
      'example': '2017-07-27T19:05:11.000Z'
    },
    'links': {
      'type': 'array',
      'items': {
        '$ref': '#/definitions/Links'
      }
    }
  }
}

datum = {
  'type': 'object',
  'properties': {
    'date': {
      'type': 'string',
      'description': 'collecting date iso formatted'
    },
    'value': {
      'type': 'number',
      'description': 'measured value',
      'example': 0.209
    }
  }
}

data = {
  'type': 'object',
  'properties': {
    'variable': {
      'type': 'string',
      'description': 'Data collected variable',
      'example': 'Dissolved Oxygen'
    },
    'node_id': {
      'type': 'string',
      'description': 'Unique node identifier',
      'example': ''
    },
    'data': {
      'type': 'array',
      'items': {
        '$ref': '#/definitions/Datum'
      }
    }
  }
}

water_body = {
  'type': 'object',
  'properties': {
    'properties': {
      'name': {
        'type': 'string'
      },
      'id': {
        'type': 'string'
      }
    },
    'geometry': {
      'type': 'string',
      'coordinates': {
        'type': 'array',
        'items': {
          'type': 'number'
        }
      }
    }
  }
}