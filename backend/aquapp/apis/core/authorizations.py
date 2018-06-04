# Authorization definitions following swagger rules
# https://swagger.io/docs/specification/authentication/
auth = {
    'apikey': {
        'type': 'apiKey',
        'in': 'header',
        'name': 'API-KEY'
    }
}