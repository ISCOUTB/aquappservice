import {Entity, model, property} from '@loopback/repository';

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

  @property({
    type: 'string',
  })
  userId?: string;

  constructor(data?: Partial<NodeType>) {
    super(data);
  }
}
