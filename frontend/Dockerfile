FROM node:latest

WORKDIR /frontend

COPY . /frontend

RUN npm install -g @angular/cli

RUN npm install

EXPOSE 80

CMD ng serve --port 80 --host 0.0.0.0 --disable-host-check
