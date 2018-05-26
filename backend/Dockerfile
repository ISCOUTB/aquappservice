FROM python:3-onbuild

COPY ./requirements.txt .

COPY . /backend

WORKDIR /backend

COPY ./config/env.default /backend/aquapp/.env

RUN pip3 install -U pip

RUN pip3 install --no-cache-dir -r requirements.txt

RUN pip3 install uwsgi

RUN apt update

RUN apt install -y --no-install-recommends nginx supervisor

RUN rm /etc/nginx/sites-enabled/default

COPY ./config/aquapp.conf /etc/nginx/sites-enabled/aquapp

RUN apt-get clean

COPY ./config/supervisor_app.conf /etc/supervisor/conf.d/

RUN chown -R www-data:www-data /backend

EXPOSE 8080

CMD ["supervisord"]
