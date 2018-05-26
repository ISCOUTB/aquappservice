FROM esperantodeparture/nginx-node

WORKDIR /frontend

COPY . /frontend

RUN npm install

#RUN ng build
RUN ng build --prod --build-optimizer

EXPOSE 80

COPY ./config/frontend.conf /etc/nginx/sites-enabled/frontend

#CMD ng serve --port 80 --host 0.0.0.0 --disable-host-check
CMD nginx -g 'daemon off;'
