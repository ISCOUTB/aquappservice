import {
  DefaultCrudRepository,
  HasManyRepositoryFactory,
  repository,
} from '@loopback/repository';
import {NodeType, Sensor} from '../models';
import {MongodsDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';
import {SensorRepository} from './sensor.repository';

export class NodeTypeRepository extends DefaultCrudRepository<
  NodeType,
  typeof NodeType.prototype.id
> {
  public readonly sensors: HasManyRepositoryFactory<
    Sensor,
    typeof NodeType.prototype.id
  >;
  constructor(
    @inject('datasources.mongods') dataSource: MongodsDataSource,
    @repository.getter('SensorRepository')
    getSensorRepository: Getter<SensorRepository>,
  ) {
    super(NodeType, dataSource);
    this.sensors = this.createHasManyRepositoryFactoryFor(
      'sensors',
      getSensorRepository,
    );
  }
}
