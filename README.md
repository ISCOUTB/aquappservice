# Aquapp

Aquapp is an application that monitors the quality of the water over time.

## Setup

The api and the database are dockerized, to start them run (in the root of the project):

$ docker-compose up

Then start the angular frontend:

$ cd aquapp-front

$ ng serve

Finally you need to seed the database, to do so use the seed() method from the Database
object in api/aquapp_api/apis/core/database.py:

$ cd api/aquapp_api/apis/core

$ python

$ from database import Database

$ Database().seed()
