# Aquapp

Aquapp is an application that monitors the quality of the water over time.

## Setup

The whole application is dockerized, just run the following command (with docker
and docker-compose installed, of course):

$ docker-compose up

Then you need to seed the database, to do so use the seed() method from the Database
object in api/aquapp_api/apis/core/database.py:

$ cd api/aquapp_api/apis/core

$ python

$ from database import Database

$ Database().seed()
