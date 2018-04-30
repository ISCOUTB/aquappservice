from flask import json
from apiv1 import api
print(json.dumps(api.__schema__))
