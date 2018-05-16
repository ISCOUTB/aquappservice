FROM python:3-onbuild

COPY ./requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8080

CMD python /usr/src/app/runserver.py
