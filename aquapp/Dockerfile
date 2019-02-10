FROM node:10.15

# Expose api port
EXPOSE 80

# Update apt caches
RUN apt update

# Install nginx
RUN apt-get install -y --no-install-recommends nginx

# Install Angular cli
RUN npm install -g @angular/cli

# Frontend config
RUN rm /etc/nginx/sites-enabled/default
COPY ./config/aquapp.conf /etc/nginx/sites-enabled/aquapp

WORKDIR /aquapp

# Copy all files to /aquapp
COPY . .

# Install dependencies
RUN npm install

# Compile for production
RUN ng build --prod --aot --build-optimizer

# Serve with nginx in the foreground
CMD nginx -g 'daemon off;'
