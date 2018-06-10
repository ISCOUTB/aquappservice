# Aquapp

Aquapp is an application that monitors the quality of the water over time.

## Setup

The whole application is dockerized, just run the following command (with docker
and docker-compose installed, of course):

$ docker-compose up

The application needs initial data to work, execute seed_db.py in /seed_db. Use
pipenv to avoid polluting the current python installation.

$ cd seed_db

$ pipenv install

$ pipenv shell

$ python seed_db.py

[About pipenv](https://docs.pipenv.org/)
