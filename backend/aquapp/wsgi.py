"""
This script runs the aquapp application using a development server.
"""
from dotenv import load_dotenv  # Loading app settings from the .env file
print('Loading environment variables')
load_dotenv(dotenv_path='/backend/aquapp/.env', verbose=True)
from .api import app

if __name__ == '__main__':
    app.run()
