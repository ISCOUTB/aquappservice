import {Entity, model, property, hasMany} from '@loopback/repository';
import { Sensor } from './sensor.model';

@model()
export class NodeType extends Entity {
  @property({
    type: 'string',
    id: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
    required: true,
    default: ',',
  })
  separator: string;

  @hasMany(() => Sensor, {keyTo: 'nodeTypeId'})
  sensors: Sensor[];

  @property({
    type: 'string',
  })
  userId?: string;

  constructor(data?: Partial<NodeType>) {
    super(data);
  }
}
