FROM python:3-onbuild

COPY ./requirements.txt .

EXPOSE 80

RUN pip install --no-cache-dir -r requirements.txt

# CMD ["python", "./runserver.py"]
