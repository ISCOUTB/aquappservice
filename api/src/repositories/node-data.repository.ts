import {DefaultCrudRepository} from '@loopback/repository';
import {NodeData} from '../models';
import {MongodsDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class NodeDataRepository extends DefaultCrudRepository<
  NodeData,
  typeof NodeData.prototype.id
> {
  constructor(
    @inject('datasources.mongods') dataSource: MongodsDataSource,
  ) {
    super(NodeData, dataSource);
  }
}
