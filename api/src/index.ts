import {AquappApi} from './application';
import {ApplicationConfig} from '@loopback/core';

export {AquappApi};

import * as fs from 'fs';

export async function main(options: ApplicationConfig = {}) {
  if (!options) options = {};
  if (!options.rest) options.rest = {};
  // These options allow me to test the api from my local network
  // They're also required for deployment
  options.rest.port = process.env.APP_PORT || 3000;
  options.rest.host = process.env.APP_HOST || '0.0.0.0';
  options.rest.protocol = 'https';
  try {
    options.rest.key = fs.readFileSync('/etc/ssl/utb.edu.co.key');
    options.rest.cert = fs.readFileSync('/etc/ssl/utb.edu.co.crt');
  } catch (error) {
    console.log('Certificate not found, using empty files', error);
    options.rest.protocol = 'http';
    options.rest.key = '';
    options.rest.cert = '';
  }
  const app = new AquappApi(options);
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}/ping`);

  return app;
}
