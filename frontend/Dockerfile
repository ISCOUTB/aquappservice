FROM ubuntu

WORKDIR /frontend

COPY . /frontend

RUN apt update

RUN apt install -y curl apt-transport-https build-essential bzip2 curl git vim

RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -

RUN apt install -y --no-install-recommends nodejs nginx

COPY ./config/frontend.conf /etc/nginx/sites-available/frontend.conf

RUN ln -s /etc/nginx/sites-available/frontend.conf /etc/nginx/sites-enabled/frontend

RUN rm /etc/nginx/sites-enabled/default

RUN npm install -g @angular/cli

RUN npm install

RUN apt-get clean

EXPOSE 80

#CMD ng serve --port 80 --host 0.0.0.0 --disable-host-check
CMD nginx -g 'daemon off;'
