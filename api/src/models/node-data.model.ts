import {Entity, model, property} from '@loopback/repository';
import {Datum} from './datum.model';

@model()
export class NodeData extends Entity {
  @property({
    type: 'string',
    id: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  variable: string;

  @property({
    type: 'array',
    itemType: Datum,
  })
  data: Datum[];

  @property({
    type: 'string',
    required: true,
  })
  nodeId: string;

  @property({
    type: 'string',
  })
  userId?: string;

  constructor(data?: Partial<NodeData>) {
    super(data);
  }
}
