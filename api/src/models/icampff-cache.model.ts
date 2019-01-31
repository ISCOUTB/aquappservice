import {Entity, model, property} from '@loopback/repository';

@model()
export class IcampffCache extends Entity {
  @property({
    type: 'string',
    id: true,
  })
  id?: string;

  @property({
    type: 'number',
    required: true,
  })
  value: number;

  @property({
    type: 'date',
    required: true,
  })
  date: Date;

  @property({
    type: 'string',
    required: true,
  })
  waterBodyId: string;

  @property({
    type: 'string',
    required: true,
  })
  nodeId: string;

  @property({
    type: 'string',
  })
  userId?: string;

  constructor(data?: Partial<IcampffCache>) {
    super(data);
  }
}
