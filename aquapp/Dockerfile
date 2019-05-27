FROM node:10.15

# Expose api port
EXPOSE 80

# Update apt caches and install nginx & Angular cli
RUN apt update && \
    apt-get install -y --no-install-recommends nginx && \
    npm install -g @angular/cli


# Frontend config and SSL files
RUN rm /etc/nginx/sites-enabled/default
COPY ./config/aquapp.conf /etc/nginx/sites-enabled/aquapp
COPY ./config/utb.edu.co.* /etc/ssl/

WORKDIR /aquapp

# Copy all files to /aquapp
COPY . .

# Install dependencies and Compile for production
RUN npm install && \
    ng build --prod --aot --build-optimizer

# Serve with nginx in the foreground
CMD nginx -g 'daemon off;'
