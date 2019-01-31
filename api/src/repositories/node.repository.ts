import {
  DefaultCrudRepository,
  HasManyRepositoryFactory,
  repository,
} from '@loopback/repository';
import {Node, Datum} from '../models';
import {MongodsDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';
import {DatumRepository} from './datum.repository';

export class NodeRepository extends DefaultCrudRepository<
  Node,
  typeof Node.prototype.id
> {
  public readonly data: HasManyRepositoryFactory<
    Datum,
    typeof Node.prototype.id
  >;
  constructor(
    @inject('datasources.mongods') dataSource: MongodsDataSource,
    @repository.getter('DatumRepository')
    getDatumRepository: Getter<DatumRepository>,
  ) {
    super(Node, dataSource);
    this.data = this.createHasManyRepositoryFactoryFor(
      'data',
      getDatumRepository,
    );
  }
}
