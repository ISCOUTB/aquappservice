FROM node:10.15

# Expose api port
EXPOSE 3000

# Update apt caches and Install pm2 and Loopback cli
RUN apt update && \
        npm install -g pm2  && \
        npm install -g @loopback/cli

WORKDIR /api

# Copy all files
COPY . .

# Install node dependencies and Compile ts to js into dist/
RUN npm install  && \
    npm start  && \
    npm stop

COPY ./ssl/utb.edu.co.crt /etc/ssl/utb.edu.co.crt
COPY ./ssl/utb.edu.co.key /etc/ssl/utb.edu.co.key

# Start the app with pm2
CMD pm2 start ecosystem.config.js -i 4 --env production --no-daemon
