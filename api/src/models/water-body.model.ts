import {Entity, model, property, hasMany} from '@loopback/repository';
import { Node } from './node.model';

@model()
export class WaterBody extends Entity {
  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
    id: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  geojson: string;

  @hasMany(() => Node, {keyTo: 'WaterBodyId'})
  nodes: Node[];

  @property({
    type: 'string',
  })
  userId?: string;

  constructor(data?: Partial<WaterBody>) {
    super(data);
  }
}
