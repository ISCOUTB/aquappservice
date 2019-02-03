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
    type: 'string',
    required: true,
  })
  value: string;

  constructor(data?: Partial<Datum>) {
    super(data);
  }
}
