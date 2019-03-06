# Aquapp

AquApp is a web-based platform created to carry out the monitoring and subsequent follow-up of some physical-chemical and biological parameter of water quality of the estuarine bayous and lagoons internal system (or simply lagoon system) of Cartagena de Indias. The platform also calculates the Marine and Estuarine Water Quality Index for Fauna and Flora Preservation (ICAMpff, by its initials in Spanish), which was created by Invemar (Institute for Marine and Coastal Research).

## Setup for development

This new version uses [loopback 4](https://v4.loopback.io/) and [angular](https://angular.io/). This new version
also uses [Mongodb](https://www.mongodb.com/), you can install it on your machine, or if you have docker, create a docker container:

    docker run -d -p 27017:271017 --name aquappmdb mongo:4.0.4.

You have to map aquappdatabase to 127.0.0.1 in your /etc/hosts (C:\Windows\System32\drivers\etc\hosts in Windows)
file, adding the following line:

    echo "127.0.0.1 aquappdatabase" >> /etc/hosts

Install loopback cli and angular cli.

    npm install -g @loopback/cli
    npm install -g @angular/cli

Install their dependencies (run the following command in the api and aquapp directories):

    npm install

Start the api

    cd api; npm start

To stop it run 
    
    npm stop

Start the development server for the frontend:

    cd aquapp
    ng serve

To stop it just pres CTRL + C.

### Setup for production.

You need docker installed. Just open the command prompt
and cd to the root of the project, then:

    docker-compose -f "docker-compose-new-prod.yml" up

**Remember to write an .env file in api/ first with the api secret and admin password!**, otherwise the app will use placeholders.

    SECRET_KEY=pleasefillwithsecretkeysecuence
    ADMIN_PASS=thisistheadminpassword
    APP_PORT=3000
    APP_HOST=0.0.0.0 #bind to any ip

**Note for new dev**: Why a rewrite?. The api grew too hard to mantain, its previous version wasn't following a standard (thus accumulating technical debt), and it also lacks desing patterns that this new version has (like dependency injection). Regarding the frontend, it needed a rewrite, since the dashboard was awful: No way to add, edit or remove data, edit water bodies, add/remove icampffs, flush/build caches etc...
Also, there were lots of repeated code, and I found a better way to integrate leaflet with angular (see [ngx-leaflet](https://github.com/Asymmetrik/ngx-leaflet)) as an angular component.
