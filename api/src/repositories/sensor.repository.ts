import {DefaultCrudRepository} from '@loopback/repository';
import {Sensor} from '../models';
import {MongodsDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class SensorRepository extends DefaultCrudRepository<
  Sensor,
  typeof Sensor.prototype.id
> {
  constructor(
    @inject('datasources.mongods') dataSource: MongodsDataSource,
  ) {
    super(Sensor, dataSource);
  }
}
