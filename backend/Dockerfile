FROM esperantodeparture/python3-uwsgi-nginx

COPY ./requirements.txt .

RUN mkdir /backend

RUN pip install --no-cache-dir -r requirements.txt

COPY ./config/supervisor_app.conf /etc/supervisor/conf.d/

COPY ./config/aquapp.conf /etc/nginx/sites-enabled/backend

RUN chown -R www-data:www-data /backend

EXPOSE 8080

ENV PYTHONPATH=/backend/

COPY ./config/env.default /backend/aquapp/.env

COPY . /backend

WORKDIR /backend/aquapp

CMD ["supervisord"]
