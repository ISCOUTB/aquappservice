FROM esperantodeparture/nginx-node

WORKDIR /frontend

COPY . /frontend

RUN npm install

RUN ng build --prod --aot --build-optimizer

EXPOSE 80

COPY ./config/frontend.conf /etc/nginx/sites-enabled/frontend

CMD nginx -g 'daemon off;'
