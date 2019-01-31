import {DefaultCrudRepository} from '@loopback/repository';
import {IcampffCache} from '../models';
import {MongodsDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class IcampffCacheRepository extends DefaultCrudRepository<
  IcampffCache,
  typeof IcampffCache.prototype.id
> {
  constructor(
    @inject('datasources.mongods') dataSource: MongodsDataSource,
  ) {
    super(IcampffCache, dataSource);
  }
}
