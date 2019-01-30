import {DefaultCrudRepository, juggler} from '@loopback/repository';
import {User} from '../models';
import {MongodsDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id
> {
  constructor(
    @inject('datasources.mongods') dataSource: MongodsDataSource,
  ) {
    super(User, dataSource);
  }
}
