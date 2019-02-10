# Aquapp (current version)

AquApp is a web-based platform created to carry out the monitoring and subsequent follow-up of some physical-chemical and biological parameter of water quality of the estuarine bayous and lagoons internal system (or simply lagoon system) of Cartagena de Indias. The platform also calculates the Marine and Estuarine Water Quality Index for Fauna and Flora Preservation (ICAMpff, by its initials in Spanish), which was created by Invemar (Institute for Marine and Coastal Research).

## Setup (current version)

This new version uses [loopback 4](https://v4.loopback.io/) and [angular](https://angular.io/).

### For production. 

You need docker installed. Just open the command prompt
and cd to the root of the project, then:

\$ docker-compose -f "docker-compose-new-prod.yml" up

**Remember to write an .env file in api/ first with the api secret and admin password!.**,
otherwise the app will use default placeholders.

### For development

Start mongodb (you can use docker if you want), then modify your
/etc/hosts file to map aquappdatabase to 127.0.0.1. Start the api with npm start in the
api directory. Finally start the frontend with ng serve --open (from the aquapp directory).

**Note1**: To stop the api you have to run "npm stop" in the api directory from the command prompt.

**Note2**: Why a rewrite?. The api was unmaintainable, its previous version wasn't following a
standard, and it also lacks desing patterns that this new version has (like dependency injection).
Regarding the frontend, it needed a rewrite, since the dashboard was awful: no way to add, edit or
remove data, edit water bodies, add/remove icampffs, flush/build caches etc... Also, there were lots
of repeated code, and I found a better way to integrate leaflet with angular (see 
[ngx-leaflet](https://github.com/Asymmetrik/ngx-leaflet)).

## Setup (previous version)

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
