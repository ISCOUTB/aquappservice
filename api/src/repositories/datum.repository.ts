import {DefaultCrudRepository} from '@loopback/repository';
import {Datum} from '../models';
import {MongodsDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class DatumRepository extends DefaultCrudRepository<
  Datum,
  typeof Datum.prototype.id
> {
  constructor(
    @inject('datasources.mongods') dataSource: MongodsDataSource,
  ) {
    super(Datum, dataSource);
  }
}
