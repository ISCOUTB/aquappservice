import {Entity, model, property, hasMany} from '@loopback/repository';
import {Datum} from './datum.model';

@model()
export class Node extends Entity {
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
  })
  location: string;

  @property({
    type: 'array',
    itemType: 'number',
    required: true,
  })
  coordinates: number[];

  @property({
    type: 'string',
    default: 'Off',
  })
  status?: string;

  @property({
    type: 'string',
    required: true,
  })
  nodeTypeId: string;

  @property({
    type: 'string',
  })
  waterBodyId?: string;

  @hasMany(() => Datum, {keyTo: 'nodeId'})
  data: Datum[];

  @property({
    type: 'string',
  })
  userId?: string;

  constructor(data?: Partial<Node>) {
    super(data);
  }
}
