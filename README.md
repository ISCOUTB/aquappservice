# Aquapp

AquApp is a web-based platform created to carry out the monitoring and subsequent follow-up of some physical-chemical and biological parameter of water quality of the estuarine bayous and lagoons internal system (or simply lagoon system) of Cartagena de Indias. The platform also calculates the Marine and Estuarine Water Quality Index for Fauna and Flora Preservation (ICAMpff, by its initials in Spanish), which was created by Invemar (Institute for Marine and Coastal Research).

## Setup

This new version uses [loopback 4](https://v4.loopback.io/) and [angular](https://angular.io/).

### For production.

You need docker installed. Just open the command prompt
and cd to the root of the project, then:

\$ docker-compose -f "docker-compose-new-prod.yml" up

**Remember to write an .env file in api/ first with the api secret and admin password!.**,
otherwise the app will use default placeholders.

### For development

Start mongodb (you can use docker if you want), then modify your
/etc/hosts (C:\Windows\System32\drivers\etc\hosts in Windows) file to map aquappdatabase
to 127.0.0.1. Start the api with npm start in the api directory. Finally start the frontend
with ng serve --open (from the aquapp directory).

**Note1**: To stop the api you have to run "npm stop" in the api directory from the command prompt.

**Note2**: Why a rewrite?. The api was unmaintainable, its previous version wasn't following a
standard, and it also lacks desing patterns that this new version has (like dependency injection).
Regarding the frontend, it needed a rewrite, since the dashboard was awful: no way to add, edit or
remove data, edit water bodies, add/remove icampffs, flush/build caches etc... Also, there were lots
of repeated code, and I found a better way to integrate leaflet with angular (see
[ngx-leaflet](https://github.com/Asymmetrik/ngx-leaflet)).
