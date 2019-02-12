FROM node:10.15

# Expose api port
EXPOSE 3000

# Update apt caches
RUN apt update

# Install pm2
RUN npm install -g pm2

# Loopback cli
RUN npm install -g @loopback/cli

WORKDIR /api

# Copy all files
COPY . .

# Install node dependencies
RUN npm install

# Compile ts to js into dist/
RUN npm start
RUN npm stop

# Start the app with pm2
CMD pm2 start ecosystem.config.js --env production --no-daemon
