import {Entity, model, property} from '@loopback/repository';

@model()
export class Sensor extends Entity {
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
    type: 'string',
    required: true,
  })
  unit: string;

  @property({
    type: 'string',
    required: true,
  })
  nodeTypeId: string;

  @property({
    type: 'string',
  })
  userId?: string;

  constructor(data?: Partial<Sensor>) {
    super(data);
  }
}
