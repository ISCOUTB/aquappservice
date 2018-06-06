"""
    This is the entrypoint for uwsgi.
"""
from dotenv import load_dotenv  # Loading app settings from the .env file
print('Loading environment variables')
load_dotenv(dotenv_path='/backend/aquapp/.env', verbose=True)

# This is only done when the application is being initialized
from aquapp.apis.core.database import Database
Database().createAdminUser()

from aquapp.api import app

if __name__ == '__main__':
    app.run()
