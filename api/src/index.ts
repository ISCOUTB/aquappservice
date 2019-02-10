import {AquappApi} from './application';
import {ApplicationConfig} from '@loopback/core';

export {AquappApi};

export async function main(options: ApplicationConfig = {}) {
  if (!options) options = {};
  if (!options.rest) options.rest = {};
  // These options allow me to test the api from my local network
  // They're also required for deployment
  options.rest.port = process.env.APP_PORT || 3000;
  options.rest.host = process.env.APP_HOST || '0.0.0.0';
  const app = new AquappApi(options);
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}/ping`);

  return app;
}
