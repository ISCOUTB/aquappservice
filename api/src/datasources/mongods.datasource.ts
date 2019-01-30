import {inject} from '@loopback/core';
import {juggler} from '@loopback/repository';
import * as config from './mongods.datasource.json';

export class MongodsDataSource extends juggler.DataSource {
  static dataSourceName = 'mongods';

  constructor(
    @inject('datasources.config.mongods', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
