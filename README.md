# Aquapp Platform

AquApp is a web-based platform created to carry out the monitoring geolocated information for IoT.

### Setup for production.

You need docker and docker-compose installed on your system.

Check if you already been created the following folders (backups, grafana, influxd, imports and aquappdatabase):

    mkdir -p data/{backups,grafana,influxd,imports,aquappdatabase}

Please the SSL certificates in:

    api/ssl/utb.edu.co.crt
    api/ssl/utb.edu.co.key
    aquapp/config/utb.edu.co.crt
    aquapp/config/utb.edu.co.key

Just open the command prompt and cd to the root of the project, then:

    docker-compose up --build

**Remember to write an .env file in api/ first with the api secret and admin password!**, otherwise the app will use placeholders.

    SECRET_KEY=pleasefillwithsecretkeysecuence
    ADMIN_PASS=thisistheadminpassword
    APP_PORT=3000
    APP_HOST=0.0.0.0

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
