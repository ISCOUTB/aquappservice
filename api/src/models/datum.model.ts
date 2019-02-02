import {Entity, model, property} from '@loopback/repository';

@model()
export class Datum extends Entity {
  @property({
    type: 'string',
    id: true,
  })
  id?: string;

  @property({
    type: 'date',
    required: true,
  })
  date: Date;

  @property({
    type: 'any',
    required: true,
  })
  // tslint:disable-next-line:no-any
  value: any;

  @property({
    type: 'string',
    required: true,
  })
  nodeId: string;

  @property({
    type: 'string',
  })
  userId?: string;

  constructor(data?: Partial<Datum>) {
    super(data);
  }
}
