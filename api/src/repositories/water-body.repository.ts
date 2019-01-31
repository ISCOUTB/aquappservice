import {
  DefaultCrudRepository,
  HasManyRepositoryFactory,
  repository,
} from '@loopback/repository';
import {WaterBody, Node} from '../models';
import {MongodsDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';
import {NodeRepository} from './node.repository';

export class WaterBodyRepository extends DefaultCrudRepository<
  WaterBody,
  typeof WaterBody.prototype.id
> {
  public readonly nodes: HasManyRepositoryFactory<
    Node,
    typeof WaterBody.prototype.id
  >;
  constructor(
    @inject('datasources.mongods') dataSource: MongodsDataSource,
    @repository.getter('NodeRepository')
    getNodeRepository: Getter<NodeRepository>,
  ) {
    super(WaterBody, dataSource);
    this.nodes = this.createHasManyRepositoryFactoryFor(
      'nodes',
      getNodeRepository,
    );
  }
}
