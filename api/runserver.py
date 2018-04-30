"""
This script runs the aquapp application using a development server.
"""

from aquapp_api import app

if __name__ == '__main__':
    app.run('0.0.0.0', 80, debug=True)
