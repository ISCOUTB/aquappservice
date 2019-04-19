import {Entity, model, property} from '@loopback/repository';

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
  userId?: string;

  constructor(data?: Partial<Node>) {
    super(data);
  }
}
