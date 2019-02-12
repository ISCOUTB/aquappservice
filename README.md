# Aquapp

AquApp is a web-based platform created to carry out the monitoring and subsequent follow-up of some physical-chemical and biological parameter of water quality of the estuarine bayous and lagoons internal system (or simply lagoon system) of Cartagena de Indias. The platform also calculates the Marine and Estuarine Water Quality Index for Fauna and Flora Preservation (ICAMpff, by its initials in Spanish), which was created by Invemar (Institute for Marine and Coastal Research).

# Setup

The whole application is dockerized, just run the following command (with docker
and docker-compose installed, of course):

\$ docker-compose up

The container with the mongo database uses the official mongo container, but the
other 2 containers are maintained by me. If you need the Dockerfiles of those
containers, here you are:

- [Frontend (nginx + node)](https://hub.docker.com/r/esperantodeparture/nginx-node/)
- [Backend (nginx + uwgsi)](https://hub.docker.com/r/esperantodeparture/python3-uwsgi-nginx/)

The application needs initial data to work, execute seed_db.py in /seed_db. Use
pipenv to avoid polluting your python installation.

\$ cd seed_db

\$ pipenv install

\$ pipenv shell

\$ python seed_db.py

[About pipenv](https://docs.pipenv.org/)
