import {DefaultCrudRepository} from '@loopback/repository';
import {Node} from '../models';
import {MongodsDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class NodeRepository extends DefaultCrudRepository<
  Node,
  typeof Node.prototype.id
> {
  constructor(@inject('datasources.mongods') dataSource: MongodsDataSource) {
    super(Node, dataSource);
  }
}
