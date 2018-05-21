"""
This script runs the aquapp application using a development server.
"""
import os
from dotenv import load_dotenv  # Loading app settings from the .env file
print('Loading environment variables')
load_dotenv(dotenv_path='/usr/src/app/.env', verbose=True)

from aquapp_api.api import app

if __name__ == '__main__':
    app.run('0.0.0.0', 8080, debug=True)
