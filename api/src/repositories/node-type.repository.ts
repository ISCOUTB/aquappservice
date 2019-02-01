import {
  DefaultCrudRepository
} from '@loopback/repository';
import {NodeType} from '../models';
import {MongodsDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class NodeTypeRepository extends DefaultCrudRepository<
  NodeType,
  typeof NodeType.prototype.id
> {
  constructor(@inject('datasources.mongods') dataSource: MongodsDataSource) {
    super(NodeType, dataSource);
  }
}
