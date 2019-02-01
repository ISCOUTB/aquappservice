import {DefaultCrudRepository} from '@loopback/repository';
import {WaterBody} from '../models';
import {MongodsDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class WaterBodyRepository extends DefaultCrudRepository<
  WaterBody,
  typeof WaterBody.prototype.id
> {
  constructor(@inject('datasources.mongods') dataSource: MongodsDataSource) {
    super(WaterBody, dataSource);
  }
}
