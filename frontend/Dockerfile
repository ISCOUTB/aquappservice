FROM ubuntu

WORKDIR /frontend

COPY . /frontend

RUN apt update

RUN apt install -y curl apt-transport-https build-essential bzip2 curl git vim

RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -

RUN apt install -y --no-install-recommends nodejs nginx

COPY ./config/frontend.conf /etc/nginx/sites-enabled/frontend

RUN rm /etc/nginx/sites-enabled/default

RUN npm install -g @angular/cli@6.0.0

RUN npm install

RUN ng build
#RUN ng build --prod --build-optimizer

RUN apt-get clean

EXPOSE 80

#CMD ng serve --port 80 --host 0.0.0.0 --disable-host-check
CMD nginx -g 'daemon off;'
