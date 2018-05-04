"""
This script runs the aquapp application using a development server.
"""
from dotenv import load_dotenv  # Loading app settings from the .env file
load_dotenv()


from aquapp_api import app

if __name__ == '__main__':
    app.run('0.0.0.0', 80, debug=True)
