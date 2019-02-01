import {Entity, model, property} from '@loopback/repository';

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

  @property({
    type: 'string',
  })
  userId?: string;

  constructor(data?: Partial<WaterBody>) {
    super(data);
  }
}
