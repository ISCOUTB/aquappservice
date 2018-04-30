api_key = {
    'apikey': {
        'type': 'apiKey',
        'in': 'header',
        'name': 'X-API-KEY'
    }
}

http_basic = {
    'basicAuth': {
        'type': 'http',
        'scheme': 'basic'
    }
}

oauth2 = {
    'type': 'oauth2',
    'flow': 'accessCode',
    'tokenUrl': 'https://somewhere.com/token',
    'scopes': {
        'read': 'Grant read-only access',
        'write': 'Grant read-write access',
    }
}
