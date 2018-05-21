FROM python:3-onbuild

COPY ./requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY ./config/env.default /usr/src/app/.env

EXPOSE 8080

CMD python /usr/src/app/runserver.py
